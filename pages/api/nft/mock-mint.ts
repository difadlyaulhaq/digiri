// pages/api/nft/mock-mint.ts - IMPROVED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus, getOrderById } from '@/utils/orderUtils';

interface MockMintRequest {
  orderId: string;
  customerEmail?: string;
  productName?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, customerEmail, productName }: MockMintRequest = req.body;

  try {
    console.log('🎭 Creating mock NFT for order:', orderId);

    // Validasi input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Cek apakah order exists
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Generate realistic mock data
    const mockNftId = `mock-nft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mockTransactionHash = `0x${Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    const mockContractAddress = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');

    console.log('✅ Mock NFT data generated:', {
      nftId: mockNftId,
      transactionHash: mockTransactionHash
    });

    // Simpan ke database
    const updateSuccess = await updateNFTStatus(
      orderId, 
      'minted', 
      [mockNftId], 
      mockTransactionHash
    );

    if (!updateSuccess) {
      throw new Error('Failed to update NFT status in database');
    }

    console.log('💾 Mock NFT saved to database for order:', orderId);

    res.status(200).json({
      success: true,
      nftId: mockNftId,
      transactionHash: mockTransactionHash,
      contractAddress: mockContractAddress,
      message: 'Mock NFT berhasil dibuat (Development Mode)',
      note: 'Ini adalah NFT mock untuk development'
    });

  } catch (error: any) {
    console.error('❌ Mock NFT creation error:', error);
    
    // Try to update status to failed
    try {
      await updateNFTStatus(orderId, 'failed');
    } catch (dbError) {
      console.error('Error updating NFT status to failed:', dbError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Gagal membuat mock NFT',
      orderId: orderId
    });
  }
}