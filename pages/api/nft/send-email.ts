// pages/api/nft/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById } from '@/utils/orderUtils';
import { sendNFTConfirmationEmail } from './mint';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Order ID is required' 
    });
  }

  try {
    console.log(`📧 Manual email trigger for order: ${orderId}`);

    // 1. Get order from database
    const order = await getOrderById(orderId);
    
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    console.log('📦 Order details:', {
      orderId: order.orderId,
      status: order.status,
      nftStatus: order.nftStatus,
      nftIds: order.nftIds,
      customerEmail: order.shippingAddress.email,
      customerName: order.shippingAddress.name
    });

    // 2. Check if order has minted NFT
    if (order.nftStatus !== 'minted' || !order.nftIds || order.nftIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order does not have minted NFT',
        nftStatus: order.nftStatus,
        nftIds: order.nftIds
      });
    }

    // 3. Get the first NFT ID
    const nftId = order.nftIds[0];
    const productName = order.items[0]?.name || 'Batik Giriloyo';

    console.log('🎯 Sending NFT email with details:', {
      customerEmail: order.shippingAddress.email,
      customerName: order.shippingAddress.name,
      productName: productName,
      nftId: nftId
    });

    // 4. Send NFT confirmation email and await the result
    const emailResult = await sendNFTConfirmationEmail(
      order.shippingAddress.email,
      order.shippingAddress.name,
      productName,
      nftId
    );

    // 5. Check the result from the email function
    if (emailResult.success) {
      console.log(`✅ NFT email sent successfully for order: ${orderId}`);
      res.status(200).json({
        success: true,
        orderId: orderId,
        customerEmail: order.shippingAddress.email,
        nftId: nftId,
        message: 'Email konfirmasi NFT berhasil dikirim'
      });
    } else {
      console.error(`❌ Failed to send NFT email for order: ${orderId}`, emailResult.error);
      res.status(500).json({
        success: false,
        orderId: orderId,
        error: emailResult.error || 'Gagal mengirim email konfirmasi NFT'
      });
    }

  } catch (error: any) {
    console.error('❌ Error sending NFT email:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal memproses pengiriman email',
      orderId: orderId
    });
  }
}