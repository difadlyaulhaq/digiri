// pages/api/order/debug.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById } from '@/utils/orderUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orderId } = req.query;

  try {
    const order = await getOrderById(orderId as string);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      });
    }

    // Check if order can be updated
    const canUpdate = order.status === 'paid' && 
                     (!order.nftStatus || order.nftStatus !== 'minted' || 
                      !order.nftIds || order.nftIds.length === 0);

    res.status(200).json({
      success: true,
      order: {
        id: order.orderId,
        status: order.status,
        nftStatus: order.nftStatus,
        nftIds: order.nftIds || [],
        nftTransactionHash: order.nftTransactionHash,
        items: order.items.map(item => ({
          name: item.name,
          image: item.image,
          quantity: item.quantity
        })),
        customer: {
          name: order.shippingAddress.name,
          email: order.shippingAddress.email
        }
      },
      mintingEligibility: {
        canMint: canUpdate,
        reason: canUpdate ? 'Eligible for minting' : 
          order.status !== 'paid' ? 'Order not paid' : 
          'NFT already minted'
      }
    });
  } catch (error) {
    console.error('Error in order debug:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch order details' 
    });
  }
}