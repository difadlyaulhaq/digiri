// pages/api/nft/mock-mint.ts - VERSI DIPERBAIKI
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus, getOrderById } from '@/utils/orderUtils';
import { sendNFTConfirmationEmail } from '@/lib/email';

// ===== TYPES =====
interface MockMintRequest {
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  productImage?: string;
  artisan?: string;
  location?: string;
  motif?: string;
  processingTime?: string;
}

interface MockNFTData {
  nftId: string;
  transactionHash: string;
  contractAddress: string;
}

interface APIResponse {
  success: boolean;
  nftId?: string;
  transactionHash?: string;
  contractAddress?: string;
  emailSent?: boolean;
  customerEmail?: string;
  nftMintedAt?: string;
  message?: string;
  note?: string;
  error?: string;
  orderId?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Safely parse request data based on method
 */
function parseRequestData(req: NextApiRequest): MockMintRequest {
  if (req.method === 'POST') {
    return req.body as MockMintRequest;
  } else {
    // For GET requests, extract from query parameters
    const query = req.query;
    return {
      orderId: Array.isArray(query.orderId) ? query.orderId[0] : query.orderId || '',
      customerEmail: Array.isArray(query.customerEmail) ? query.customerEmail[0] : query.customerEmail,
      customerName: Array.isArray(query.customerName) ? query.customerName[0] : query.customerName,
      productName: Array.isArray(query.productName) ? query.productName[0] : query.productName,
      productImage: Array.isArray(query.productImage) ? query.productImage[0] : query.productImage,
      artisan: Array.isArray(query.artisan) ? query.artisan[0] : query.artisan,
      location: Array.isArray(query.location) ? query.location[0] : query.location,
      motif: Array.isArray(query.motif) ? query.motif[0] : query.motif,
      processingTime: Array.isArray(query.processingTime) ? query.processingTime[0] : query.processingTime,
    };
  }
}

/**
 * Generate mock blockchain data
 */
function generateMockBlockchainData(): MockNFTData {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 11);
  
  return {
    nftId: `mock-nft-${timestamp}-${randomString}`,
    transactionHash: `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`,
    contractAddress: `0x${Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
}

/**
 * Extract product motif from product name
 */
function extractMotif(productName: string): string {
  const motifMatch = productName.match(/Motif\s+(.+)/i);
  return motifMatch ? motifMatch[1] : productName;
}

// ===== MAIN HANDLER =====
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  // Accept both GET and POST for flexibility in development
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST or GET.' 
    });
  }

  try {
    // Parse request data safely
    const requestData = parseRequestData(req);
    const { orderId } = requestData;

    // ===== VALIDATION =====
    console.log('🎭 Starting mock NFT minting process...');
    
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      console.error('❌ Invalid order ID:', orderId);
      return res.status(400).json({
        success: false,
        error: 'Valid Order ID is required (string)'
      });
    }

    // ===== FETCH ORDER =====
    console.log(`🔍 Looking up order: ${orderId}`);
    const order = await getOrderById(orderId);
    
    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        orderId
      });
    }

    console.log('✅ Order found:', {
      orderId: order.orderId,
      status: order.status,
      nftStatus: order.nftStatus,
      itemsCount: order.items?.length || 0
    });

    // ===== PREPARE NFT DATA =====
    const shippingAddress = order.shippingAddress || {};
    const firstItem = order.items?.[0] || {};
    
    const finalData = {
      customerEmail: requestData.customerEmail || shippingAddress.email,
      customerName: requestData.customerName || shippingAddress.name,
      productName: requestData.productName || firstItem.name || 'Batik Giriloyo',
      artisan: requestData.artisan || "Pengrajin Giriloyo",
      location: requestData.location || "Desa Giriloyo, Yogyakarta",
      motif: requestData.motif || extractMotif(firstItem.name || 'Batik Tradisional'),
      processingTime: requestData.processingTime || "14-21 hari"
    };

    // Validate required fields
    if (!finalData.customerEmail) {
      console.error('❌ No customer email available');
      return res.status(400).json({
        success: false,
        error: 'Customer email is required',
        orderId
      });
    }

    // ===== GENERATE MOCK NFT =====
    console.log('🔄 Generating mock NFT data...');
    const mockData = generateMockBlockchainData();
    const nftMintedAt = new Date().toISOString();
    
    console.log('✅ Mock NFT data generated:', {
      nftId: mockData.nftId,
      txHash: mockData.transactionHash.substring(0, 20) + '...',
      customerEmail: finalData.customerEmail,
      mintedAt: nftMintedAt
    });

    // ===== UPDATE DATABASE =====
    console.log('💾 Saving to database...');
    
    // Create array of NFT IDs (for multiple items, create one NFT per order)
    const nftIds = [mockData.nftId];
    
    const updateSuccess = await updateNFTStatus(
      orderId,
      'minted',
      nftIds,
      mockData.transactionHash,
      nftMintedAt
    );

    if (!updateSuccess) {
      throw new Error('Failed to update NFT status in database');
    }
    console.log('✅ Database updated successfully');

    // ===== SEND EMAIL =====
    console.log(`📧 Preparing email for: ${finalData.customerEmail}`);
    let emailResult: { success: boolean; error?: any };
    
    if (finalData.customerEmail) {
        const openseaUrl = `https://opensea.io/assets/matic/${mockData.contractAddress}/${mockData.nftId}`;
        emailResult = await sendNFTConfirmationEmail({
            customerEmail: finalData.customerEmail,
            customerName: finalData.customerName || 'Pelanggan',
            productName: finalData.productName,
            nftId: mockData.nftId,
            txId: mockData.transactionHash,
            openseaUrl: openseaUrl
        });
    } else {
      emailResult = { success: false, error: 'No customer email provided' };
    }

    // ===== SUCCESS RESPONSE =====
    const response: APIResponse = {
      success: true,
      nftId: mockData.nftId,
      transactionHash: mockData.transactionHash,
      contractAddress: mockData.contractAddress,
      emailSent: emailResult.success,
      customerEmail: finalData.customerEmail,
      nftMintedAt: nftMintedAt,
      message: 'Mock NFT berhasil dibuat (Development Mode)',
      note: 'Ini adalah NFT mock untuk development. Di production, akan menggunakan blockchain sesungguhnya.'
    };

    console.log('🎉 Mock NFT process completed successfully');
    return res.status(200).json(response);

  } catch (error: any) {
    // ===== ERROR HANDLING =====
    console.error('❌ Mock NFT creation error:', error);
    
    // Try to extract orderId from request
    let orderId: string | undefined;
    try {
      const requestData = parseRequestData(req);
      orderId = requestData.orderId;
    } catch {
      // If parsing fails, try to get from query or body directly
      if (req.method === 'POST') {
        orderId = req.body?.orderId;
      } else {
        const query = req.query;
        orderId = Array.isArray(query.orderId) ? query.orderId[0] : query.orderId;
      }
    }

    // Update status to failed in database if we have orderId
    if (orderId) {
      try {
        await updateNFTStatus(orderId, 'failed');
        console.log(`⚠️ Updated order ${orderId} status to 'failed'`);
      } catch (dbError) {
        console.error('Error updating NFT status to failed:', dbError);
      }
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during mock NFT creation',
      orderId: orderId || 'unknown'
    });
  }
}