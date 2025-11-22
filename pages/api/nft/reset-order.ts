// pages/api/nft/reset-order.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById, updateNFTStatus } from '@/utils/orderUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.body;

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Reset NFT status
    await updateNFTStatus(orderId, 'pending', [], undefined);

    res.status(200).json({
      success: true,
      message: `Order ${orderId} NFT status has been reset to pending`,
      order: {
        id: order.orderId,
        status: order.status,
        nftStatus: 'pending',
        nftIds: []
      }
    });
  } catch (error: any) {
    console.error('Error resetting order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}