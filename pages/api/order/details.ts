// pages/api/order/details.ts
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
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      orderId: order.orderId,
      status: order.status,
      nftStatus: order.nftStatus,
      nftIds: order.nftIds || [],
      nftTransactionHash: order.nftTransactionHash,
      customer: {
        name: order.shippingAddress.name,
        email: order.shippingAddress.email
      },
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totals: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        nftFee: order.nftFee,
        total: order.total
      },
      dates: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}