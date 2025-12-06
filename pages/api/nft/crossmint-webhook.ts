// pages/api/nft/crossmint-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus, getOrderById } from '@/utils/orderUtils';
import { sendEmail, sendNFTConfirmationEmail } from '@/lib/email';

// ===== TYPE DEFINITIONS =====

interface CrossmintWebhookPayload {
  actionId: string;
  type: string; // e.g., "nft.minted", "nft.mintingFailed"
  timestamp: string;
  metadata: {
    name: string;
    description: string;
    error?: string;
    [key: string]: any;
  };
  onChain: {
    chain: string;
    contractAddress: string;
    txId: string;
    tokenId: string;
  };
  recipient: {
    walletAddress: string;
    email: string;
  };
}

// ===== EMAIL TEMPLATES =====

async function sendNFTFailedEmail(
  customerEmail: string, 
  customerName: string, 
  productName: string, 
  orderId: string
) {
  const emailContent = {
    to: customerEmail,
    subject: `⚠️ Proses NFT Certificate untuk ${productName} Gagal`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
              .header { background: linear-gradient(135deg, #d97706, #9a3412); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { padding: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>⚠️ Proses NFT Gagal</h1>
              </div>
              <div class="content">
                  <p>Halo <strong>${customerName}</strong>,</p>
                  <p>Mohon maaf, kami mengalami kendala teknis saat mencoba membuat NFT Certificate untuk produk <strong>${productName}</strong> (Order ID: ${orderId}).</p>
                  <p>Tim teknis kami telah diberitahu dan sedang menyelidiki masalah ini. Kami akan mencoba memproses ulang permintaan Anda secara manual.</p>
                  <p>Anda tidak perlu melakukan apa-apa saat ini. Kami akan memberitahu Anda kembali setelah NFT berhasil dibuat.</p>
                  <p>Terima kasih atas kesabaran Anda.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };
  await sendEmail(emailContent);
}

// ===== MAIN HANDLER =====

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  console.log('🔔 Received Crossmint webhook...');

  try {
    const payload = req.body as CrossmintWebhookPayload;

    // VERY IMPORTANT: In production, you MUST verify the webhook signature here.
    // This prevents malicious actors from calling your endpoint.
    // See Crossmint docs: https://docs.crossmint.com/docs/webhooks#verifying-signatures

    const attributes = payload.metadata?.attributes || [];
    const orderIdAttribute = attributes.find(attr => attr.trait_type === "Order ID");
    const orderId = orderIdAttribute?.value;

    if (!orderId) {
      console.error('❌ Webhook error: Order ID not found in metadata attributes.');
      // Respond 200 to prevent Crossmint from retrying a malformed request.
      return res.status(200).json({ success: true, message: 'Acknowledged, but Order ID was missing.' });
    }

    console.log(`Processing webhook for Order ID: ${orderId}, Action: ${payload.type}`);

    const order = await getOrderById(orderId);
    if (!order) {
      console.error(`❌ Order ${orderId} not found in database.`);
       // Respond 200 to prevent retries for an order that doesn't exist.
      return res.status(200).json({ success: true, message: 'Acknowledged, but order not found.' });
    }
    
    // Destructure customer info from the order for emails
    const customerName = order.shippingAddress?.name || 'Pelanggan';
    const customerEmail = order.shippingAddress?.email;
    const productName = order.items?.[0]?.name || 'Batik Giriloyo';

    if (!customerEmail) {
        console.error(`❌ Cannot process webhook for order ${orderId}: customer email is missing.`);
        return res.status(200).json({ success: true, message: 'Acknowledged, but customer email is missing.' });
    }

    switch (payload.type) {
      case 'nft.minted':
        console.log(`✅ NFT for order ${orderId} minted successfully.`);
        const { tokenId, txId, contractAddress } = payload.onChain;
        
        await updateNFTStatus(
          orderId,
          'minted',
          [tokenId], // Use the real Token ID from Crossmint
          txId,
          new Date().toISOString()
        );

        const openseaUrl = `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`;
        
        await sendNFTConfirmationEmail({
          customerEmail,
          customerName,
          productName,
          nftId: tokenId,
          txId,
          openseaUrl
        });

        console.log(`📧 Confirmation email sent for order ${orderId}.`);
        break;

      case 'nft.mintingFailed':
        console.error(`❌ NFT minting failed for order ${orderId}. Reason: ${payload.metadata.error || 'Unknown'}`);
        
        await updateNFTStatus(orderId, 'failed');
        
        await sendNFTFailedEmail(
          customerEmail,
          customerName,
          productName,
          orderId
        );
        console.log(`📧 Failure email sent for order ${orderId}.`);
        break;

      default:
        console.log(`🔔 Received unhandled webhook event type: ${payload.type}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully.' });

  } catch (error: any) {
    console.error('❌ Error processing Crossmint webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
