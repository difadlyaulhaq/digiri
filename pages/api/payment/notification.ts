// pages/api/payment/notification.ts
import type { NextApiRequest, NextApiResponse } from 'next';
const midtransClient = require('midtrans-client');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await apiClient.transaction.notification(req.body);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔔 Midtrans notification: ${orderId} - ${transactionStatus}`);

    // Update order status berdasarkan notifikasi
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        // TODO: Update order status to challenge
      } else if (fraudStatus === 'accept') {
        // TODO: Update order status to paid/success
      }
    } else if (transactionStatus === 'settlement') {
      // TODO: Update order status to paid/success
    } else if (transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire') {
      // TODO: Update order status to failed/cancelled
    } else if (transactionStatus === 'pending') {
      // TODO: Update order status to pending
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    res.status(500).json({ error: 'Failed to process notification' });
  }
}