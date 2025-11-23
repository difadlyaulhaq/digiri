// pages/api/payment/notification.ts - IMPROVED
import type { NextApiRequest, NextApiResponse } from 'next';
const midtransClient = require('midtrans-client');
import { getOrderById, updateOrderStatus, updateNFTStatus } from '@/utils/orderUtils';

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
        await updateOrderStatus(orderId, 'pending');
      } else if (fraudStatus === 'accept') {
        await updateOrderStatus(orderId, 'paid');
        // Trigger NFT minting untuk order yang sudah dibayar
        await triggerNFTMinting(orderId);
      }
    } else if (transactionStatus === 'settlement') {
      await updateOrderStatus(orderId, 'paid');
      // Trigger NFT minting untuk order yang sudah dibayar
      await triggerNFTMinting(orderId);
    } else if (transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire') {
      await updateOrderStatus(orderId, 'cancelled');
    } else if (transactionStatus === 'pending') {
      await updateOrderStatus(orderId, 'pending');
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Midtrans notification:', error);
    res.status(500).json({ error: 'Failed to process notification' });
  }
}

// Fungsi untuk trigger NFT minting - IMPROVED
async function triggerNFTMinting(orderId: string) {
  try {
    console.log(`🔄 Starting NFT minting process for order: ${orderId}`);
    
    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    // Gunakan mock minting untuk development
    const useMockMint = process.env.NODE_ENV === 'development' || !process.env.CROSSMINT_API_KEY;

    if (useMockMint) {
      console.log('🎭 Using mock NFT minting for development');
      await triggerMockNFTMinting(order);
    } else {
      console.log('🎨 Using real NFT minting');
      await triggerRealNFTMinting(order);
    }
  } catch (error) {
    console.error('Error in triggerNFTMinting:', error);
  }
}

// Fungsi untuk mock NFT minting
async function triggerMockNFTMinting(order: any) {
  try {
    // Untuk setiap item di order, mint NFT
    for (const item of order.items) {
      const nftData = {
        orderId: order.orderId,
        customerEmail: order.shippingAddress.email,
        customerName: order.shippingAddress.name,
        productName: item.name,
        productImage: item.image,
        artisan: "Pengrajin Giriloyo",
        location: "Desa Giriloyo, Yogyakarta",
        motif: item.name.split('Motif ')[1] || item.name,
        processingTime: "14-21 hari"
      };

      console.log(`🎨 Mock minting NFT for item: ${item.name}`);

      const mintResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nft/mock-mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      if (mintResponse.ok) {
        const result = await mintResponse.json();
        console.log(`✅ Mock NFT minted successfully: ${result.nftId}`);
        
        // Update order dengan NFT data
        await updateNFTStatus(
          order.orderId,
          'minted',
          [result.nftId],
          result.transactionHash
        );
      } else {
        const error = await mintResponse.text();
        console.error(`❌ Mock NFT minting failed: ${error}`);
        await updateNFTStatus(order.orderId, 'failed');
      }
    }
  } catch (error) {
    console.error('Error in triggerMockNFTMinting:', error);
    await updateNFTStatus(order.orderId, 'failed');
  }
}

// Fungsi untuk real NFT minting
async function triggerRealNFTMinting(order: any) {
  try {
    // Untuk setiap item di order, mint NFT
    for (const item of order.items) {
      const nftData = {
        orderId: order.orderId,
        customerEmail: order.shippingAddress.email,
        customerName: order.shippingAddress.name,
        productName: item.name,
        productImage: item.image,
        artisan: "Pengrajin Giriloyo",
        location: "Desa Giriloyo, Yogyakarta",
        motif: item.name.split('Motif ')[1] || item.name,
        processingTime: "14-21 hari"
      };

      console.log(`🎨 Real minting NFT for item: ${item.name}`);

      const mintResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nft/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      if (mintResponse.ok) {
        const result = await mintResponse.json();
        console.log(`✅ Real NFT minted successfully: ${result.nftId}`);
      } else {
        const error = await mintResponse.text();
        console.error(`❌ Real NFT minting failed: ${error}`);
      }
    }
  } catch (error) {
    console.error('Error in triggerRealNFTMinting:', error);
  }
}