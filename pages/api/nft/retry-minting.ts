// pages/api/nft/retry-minting.ts - HYBRID VERSION (IMPROVED)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById, updateNFTStatus } from '@/utils/orderUtils';

interface MintResult {
  success: boolean;
  nftId?: string;
  transactionHash?: string;
  contractAddress?: string;
  error?: string;
  message?: string;
}

interface NftData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  productImage: string;
  artisan: string;
  location: string;
  motif: string;
  processingTime: string;
}

interface NftResult {
  success: boolean;
  nftId?: string;
  transactionHash?: string;
  productName: string;
  source: string;
  error?: string;
}

async function tryCrossmintMint(nftData: NftData): Promise<MintResult> {
  try {
    console.log('🔄 Attempting Crossmint mint...', {
      orderId: nftData.orderId,
      customerEmail: nftData.customerEmail,
      productName: nftData.productName
    });

    const mintResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nft/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nftData),
    });

    const responseText = await mintResponse.text();
    console.log('🔍 Crossmint response status:', mintResponse.status);
    console.log('🔍 Crossmint response body:', responseText);

    if (mintResponse.ok) {
      const result = JSON.parse(responseText) as MintResult;
      console.log('✅ Crossmint mint successful:', result.nftId);
      return result;
    } else {
      const errorData = JSON.parse(responseText);
      console.error('❌ Crossmint mint failed:', errorData);
      throw new Error(errorData.error || `Crossmint failed with status: ${mintResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Crossmint attempt failed:', error);
    throw error;
  }
}

async function tryMockMint(nftData: NftData): Promise<MintResult> {
  try {
    console.log('🔄 Falling back to mock mint...', {
      orderId: nftData.orderId,
      productName: nftData.productName
    });

    const mockResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nft/mock-mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nftData),
    });

    const responseText = await mockResponse.text();
    console.log('🔍 Mock response status:', mockResponse.status);
    console.log('🔍 Mock response body:', responseText);

    if (mockResponse.ok) {
      const result = JSON.parse(responseText) as MintResult;
      console.log('✅ Mock mint successful:', result.nftId);
      return result;
    } else {
      const errorData = JSON.parse(responseText);
      console.error('❌ Mock mint failed:', errorData);
      throw new Error(errorData.error || `Mock mint failed with status: ${mockResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Mock mint failed:', error);
    throw error;
  }
}

// Helper function to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Order ID is required' 
    });
  }

  try {
    console.log(`🔄 Starting hybrid NFT minting for order: ${orderId}`);

    // 1. Get order from database
    const order = await getOrderById(orderId);
    
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    console.log('📦 Order details:', {
      orderId: order.orderId,
      status: order.status,
      nftStatus: order.nftStatus,
      customerEmail: order.shippingAddress.email,
      itemsCount: order.items.length
    });

    // 2. Validate order status
    if (order.status !== 'paid') {
      console.error('❌ Order not paid:', { orderId, status: order.status });
      return res.status(400).json({ 
        success: false, 
        error: 'Order is not paid. NFT can only be minted for paid orders.',
        currentStatus: order.status
      });
    }

    // 3. Check if NFT already minted
    if (order.nftStatus === 'minted' && order.nftIds && order.nftIds.length > 0) {
      console.log('ℹ️ NFT already minted for order:', orderId);
      return res.status(400).json({ 
        success: false, 
        error: 'NFT already minted for this order',
        nftIds: order.nftIds
      });
    }

    console.log('📦 Processing order items...');

    const nftResults: NftResult[] = [];
    
    // 4. Process each item in the order
    for (const [index, item] of order.items.entries()) {
      console.log(`\n🎨 Processing item ${index + 1}/${order.items.length}: ${item.name}`);
      
      const nftData: NftData = {
        orderId: order.orderId,
        customerEmail: order.shippingAddress.email,
        customerName: order.shippingAddress.name,
        productName: item.name,
        productImage: item.image,
        artisan: "Pengrajin Giriloyo",
        location: "Desa Giriloyo, Yogyakarta",
        motif: item.name.split('Motif ')[1] || item.name,
        processingTime: "14-21 hari"
      };

      let mintResult: MintResult;
      let source = 'unknown';

      try {
        // Try Crossmint first
        console.log('🔄 Attempting Crossmint...');
        mintResult = await tryCrossmintMint(nftData);
        source = 'crossmint';
        console.log(`✅ Crossmint successful for ${item.name}`);
      } catch (crossmintError) {
        console.log(`⚠️ Crossmint failed for ${item.name}:`, getErrorMessage(crossmintError));
        
        try {
          // Fallback to mock
          console.log('🔄 Falling back to mock mint...');
          mintResult = await tryMockMint(nftData);
          source = 'mock';
          console.log(`✅ Mock mint successful for ${item.name}`);
        } catch (mockError) {
          console.error(`❌ All minting attempts failed for ${item.name}:`, getErrorMessage(mockError));
          mintResult = {
            success: false,
            error: `Both Crossmint and Mock failed: ${getErrorMessage(mockError)}`
          };
          source = 'failed';
        }
      }

      // DEBUG: Log detailed result
      console.log(`📊 Mint result for ${item.name}:`, {
        success: mintResult.success,
        source: source,
        nftId: mintResult.nftId,
        error: mintResult.error
      });

      nftResults.push({
        success: mintResult.success !== false,
        nftId: mintResult.nftId,
        transactionHash: mintResult.transactionHash,
        productName: item.name,
        source: source,
        error: mintResult.error
      });
    }

    // 5. Update database based on results
    const successfulMints = nftResults.filter(result => result.success);
    const failedMints = nftResults.filter(result => !result.success);

    console.log(`\n📊 Final results for order ${orderId}:`, {
      totalItems: order.items.length,
      successfulMints: successfulMints.length,
      failedMints: failedMints.length,
      crossmintMints: nftResults.filter(r => r.source === 'crossmint' && r.success).length,
      mockMints: nftResults.filter(r => r.source === 'mock' && r.success).length
    });

    if (successfulMints.length > 0) {
      const nftIds = successfulMints.map(result => result.nftId).filter((id): id is string => !!id);
      const transactionHash = successfulMints[0]?.transactionHash;
      
      console.log('💾 Updating database with NFT IDs:', nftIds);
      
      const updateSuccess = await updateNFTStatus(orderId, 'minted', nftIds, transactionHash);
      
      if (updateSuccess) {
        console.log(`✅ Successfully updated database for order ${orderId}`);
        console.log(`✅ Successfully minted ${successfulMints.length} NFTs (${successfulMints.filter(r => r.source === 'crossmint').length} crossmint, ${successfulMints.filter(r => r.source === 'mock').length} mock)`);
      } else {
        console.error(`❌ Failed to update database for order ${orderId}`);
      }
    } else {
      console.error(`❌ All NFT minting attempts failed for order ${orderId}`);
      await updateNFTStatus(orderId, 'failed');
    }

    // 6. Prepare final response
    const response = {
      success: successfulMints.length > 0,
      orderId: orderId,
      totalItems: order.items.length,
      successfulMints: successfulMints.length,
      failedMints: failedMints.length,
      crossmintMints: nftResults.filter(r => r.source === 'crossmint' && r.success).length,
      mockMints: nftResults.filter(r => r.source === 'mock' && r.success).length,
      results: nftResults,
      message: successfulMints.length > 0 
        ? `Berhasil membuat ${successfulMints.length} NFT` 
        : 'Gagal membuat NFT'
    };

    console.log(`\n🎉 Final response for order ${orderId}:`, response);
    res.status(200).json(response);

  } catch (error: any) {
    console.error('❌ Error in hybrid NFT minting:', error);
    
    // Try to update status to failed in case of overall error
    try {
      await updateNFTStatus(orderId, 'failed');
    } catch (dbError) {
      console.error('Error updating NFT status to failed:', dbError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Gagal memproses minting NFT',
      orderId: orderId
    });
  }
}