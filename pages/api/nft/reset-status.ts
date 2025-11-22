// pages/api/nft/reset-status.ts
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

    // Reset ke status pending dan kosongkan nftIds
    await updateNFTStatus(orderId, 'pending', [], undefined);

    res.status(200).json({
      success: true,
      message: `NFT status untuk order ${orderId} telah direset ke pending`
    });
  } catch (error: any) {
    console.error('Error resetting NFT status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}