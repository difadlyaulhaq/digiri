// pages/api/nft/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrderById, updateNFTStatus } from '@/utils/orderUtils';
import { sendNFTConfirmationEmail } from '@/lib/email';

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

    // 3. Get NFT ID and product name
    const nftId = order.nftIds[0];
    const productName = order.items[0]?.name || 'Batik Giriloyo';
    
    let txHash = order.nftTransactionHash;
    let contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; // default

    // 4. If transaction hash is missing, fetch from Crossmint
    if (!txHash) {
      console.log(`🟡 Transaction hash missing for order ${orderId}. Fetching from Crossmint...`);
      const crossmintUrl = `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}/nfts/${nftId}`;
      const options = {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.CROSSMINT_API_KEY!
        }
      };

      const crossmintResponse = await fetch(crossmintUrl, options);
      if (!crossmintResponse.ok) {
        throw new Error(`Failed to fetch NFT details from Crossmint: ${crossmintResponse.statusText}`);
      }
      
      const nftDetails = await crossmintResponse.json();
      txHash = nftDetails.onChain?.txId;
      contractAddress = nftDetails.onChain?.contractAddress;

      if (txHash) {
        console.log(`🟢 Fetched transaction hash ${txHash} from Crossmint. Updating DB...`);
        await updateNFTStatus(orderId, 'minted', order.nftIds, txHash);
      } else {
        console.error(`🔴 Could not retrieve transaction hash from Crossmint for NFT ID ${nftId}`);
        throw new Error('Could not retrieve transaction hash from Crossmint.');
      }
    }

    const openseaUrl = `https://opensea.io/assets/matic/${contractAddress}/${nftId}`;

    console.log('🎯 Sending NFT email with details:', {
      customerEmail: order.shippingAddress.email,
      customerName: order.shippingAddress.name,
      productName: productName,
      nftId: nftId,
      txId: txHash
    });

    // 5. Send NFT confirmation email
    const emailResult = await sendNFTConfirmationEmail({
      customerEmail: order.shippingAddress.email,
      customerName: order.shippingAddress.name,
      productName: productName,
      nftId: nftId,
      txId: txHash,
      openseaUrl: openseaUrl,
    });

    // 6. Check the result
    if (emailResult.success) {
      console.log(`✅ NFT email sent successfully for order: ${orderId}`);
      res.status(200).json({
        success: true,
        message: 'Email konfirmasi NFT berhasil dikirim'
      });
    } else {
      console.error(`❌ Failed to send NFT email for order: ${orderId}`, emailResult.error);
      throw new Error('Failed to send NFT email.');
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