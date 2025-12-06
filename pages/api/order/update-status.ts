// pages/api/order/update-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateOrderAfterPayment } from '@/utils/orderUtils';

interface UpdateStatusRequest {
  orderId: string;
  transactionId: string;
  paymentStatus: string;
  paymentMethod?: string;
}

interface APIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { orderId, transactionId, paymentStatus, paymentMethod } = req.body as UpdateStatusRequest;

  try {
    if (!orderId || !transactionId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, transactionId, paymentStatus'
      });
    }

    console.log('🔄 Updating order status:', { 
      orderId, 
      transactionId, 
      paymentStatus 
    });

    const success = await updateOrderAfterPayment(
      orderId,
      transactionId,
      paymentStatus,
      paymentMethod
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}