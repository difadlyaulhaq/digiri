// pages/api/order/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { verifyAndSyncOrder } from '@/utils/orderUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orderId } = req.query;

  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Order ID is required' 
    });
  }

  try {
    console.log('🔍 Verifying order:', orderId);

    // Gunakan fungsi verifyAndSyncOrder
    const { exists, synced, order } = await verifyAndSyncOrder(orderId);

    if (exists) {
      res.status(200).json({
        success: true,
        exists: true,
        synced,
        order: {
          orderId: order?.orderId,
          status: order?.status,
          paymentStatus: order?.paymentStatus,
          nftStatus: order?.nftStatus,
          total: order?.total,
          createdAt: order?.createdAt,
          customer: order?.shippingAddress ? {
            name: order.shippingAddress.name,
            email: order.shippingAddress.email
          } : null
        }
      });
    } else {
      // Coba cari di semua collection
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('orderId', '==', orderId));
      const querySnapshot = await getDocs(q);
      
      const orders: any[] = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      if (orders.length > 0) {
        res.status(200).json({
          success: true,
          exists: true,
          synced: true,
          order: orders[0]
        });
      } else {
        res.status(200).json({
          success: true,
          exists: false,
          synced: false,
          message: 'Order not found in database'
        });
      }
    }
  } catch (error: any) {
    console.error('Error verifying order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify order'
    });
  }
}