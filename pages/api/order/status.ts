// pages/api/order/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById } from '@/utils/orderUtils';

interface StatusResponse {
  success: boolean;
  orderId?: string;
  nftStatus?: string;
  nftId?: string | null;
  transactionHash?: string | null;
  mintedAt?: string | null;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid Order ID is required' });
  }

  try {
    console.log(`🔍 Checking NFT status for order: ${orderId}`);

    const order = await getOrderById(orderId);

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return res.status(404).json({ success: false, error: 'Order not found', orderId });
    }
    
    console.log(`✅ Found status '${order.nftStatus}' for order ${orderId}`);

    res.status(200).json({
      success: true,
      orderId: order.orderId,
      nftStatus: order.nftStatus || 'pending', // Default to pending if not set
      nftId: order.nftId?.[0] || null,
      transactionHash: order.transactionHash || null,
      mintedAt: order.nftMintedAt || null,
      message: 'Status retrieved successfully'
    });

  } catch (error: any) {
    console.error(`❌ Error fetching status for order ${orderId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
      orderId
    });
  }
}
