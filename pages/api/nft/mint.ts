// pages/api/nft/mint.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus, getOrderById } from '@/utils/orderUtils';

interface MintNFTRequest {
  orderId: string;
}

// Fungsi untuk memotong string agar tidak melebihi 32 bytes
function truncateTo32Bytes(str: string): string {
  const encoder = new TextEncoder();
  const decoded = new TextDecoder('utf-8');
  const encoded = encoder.encode(str);
  
  if (encoded.length <= 32) return str;
  
  // Potong menjadi 32 bytes dan decode ulang
  const truncated = encoded.slice(0, 32);
  return decoded.decode(truncated).replace(/\uFFFD/g, ''); // Hapus karakter invalid
}

// Fungsi untuk memvalidasi dan membersihkan URL gambar
function cleanImageUrl(url: string | undefined): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=500&h=500&fit=crop';
  }

  try {
    console.log('🖼️ Original image URL:', url);
    
    // Jika URL relatif, ubah menjadi absolut dengan domain yang benar
    if (url.startsWith('/')) {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://digiri.vercel.app';
      return `${baseUrl}${url}`;
    }
    
    // Jika sudah absolut, return as-is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Default fallback image
    console.log('⚠️ Using fallback image for:', url);
    return 'https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=500&h=500&fit=crop';
  } catch (error) {
    console.error('Error cleaning image URL:', error);
    return 'https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=500&h=500&fit=crop';
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId }: MintNFTRequest = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: orderId'
    });
  }

  try {
    console.log('🔄 Triggering async NFT minting for order:', orderId);
    
    // 1. Get order details from database
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // 2. Set status to "minting"
    await updateNFTStatus(orderId, 'minting');
    console.log(`⏳ NFT status for order ${orderId} updated to 'minting'.`);
    
    // Extract required data from order
    const { shippingAddress, items } = order;
    const customerEmail = shippingAddress?.email;
    const customerName = shippingAddress?.name;
    const productName = items?.[0]?.name || 'Batik Giriloyo';
    const productImage = items?.[0]?.image || '/logo.png';
    
    if (!customerEmail || !customerName) {
      // Set status to failed because we can't proceed
      await updateNFTStatus(orderId, 'failed');
      return res.status(400).json({ success: false, error: 'Customer email or name not found in order' });
    }

    // Prepare data for metadata (same as before)
    const cleanedImageUrl = cleanImageUrl(productImage);
    const shortProductName = truncateTo32Bytes(productName);
    const nftName = truncateTo32Bytes(`Batik ${shortProductName}`);
    const metadata = {
        name: nftName,
        image: cleanedImageUrl,
        description: `Sertifikat Keaslian Batik Tulis dari Pengrajin Giriloyo.`,
        attributes: [
            { trait_type: "Motif", value: truncateTo32Bytes(items?.[0]?.name || 'Unknown') },
            { trait_type: "Pengrajin", value: "Pengrajin Giriloyo" },
            { trait_type: "Lokasi", value: "Desa Giriloyo, Yogyakarta" },
            { trait_type: "Order ID", value: orderId },
            { trait_type: "Pemilik", value: truncateTo32Bytes(customerName) },
            { trait_type: "Tanggal Penerbitan", value: new Date().toISOString().split('T')[0] },
            { trait_type: "Jenis", value: "Batik Tulis" },
        ],
        external_url: `https://digiri.vercel.app/orders?orderId=${orderId}`,
        background_color: "FEF3C7"
    };

    // 3. Define the webhook URL
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/nft/crossmint-webhook`;
    console.log(`🔔 Webhook configured to: ${webhookUrl}`);

    // 4. Call Crossmint API with webhook
    const crossmintUrl = `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}/nfts`;
    
    const crossmintPayload = {
      recipient: `email:${customerEmail}:polygon`,
      metadata: metadata,
      reuploadLinkedFiles: true,
      webhookUrl: webhookUrl, // Send the webhook URL
    };

    fetch(crossmintUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.CROSSMINT_API_KEY!,
        'X-CLIENT-SECRET': process.env.CROSSMINT_CLIENT_SECRET!
      },
      body: JSON.stringify(crossmintPayload)
    }).then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Crossmint API initiation error:', {
                status: response.status,
                error: errorText,
            });
            // Update status to failed in the background
            updateNFTStatus(orderId, 'failed').catch(dbError => {
              console.error('Error updating status to failed after Crossmint initiation error:', dbError);
            });
        } else {
            const responseData = await response.json();
            console.log('✅ Crossmint minting process initiated:', { 
              orderId: orderId,
              crossmintActionId: responseData.id 
            });
        }
    }).catch(error => {
        console.error('❌ Network error when calling Crossmint API:', error);
        // Update status to failed in the background
        updateNFTStatus(orderId, 'failed').catch(dbError => {
          console.error('Error updating status to failed after network error:', dbError);
        });
    });

    // 5. Respond immediately with 202 Accepted
    res.status(202).json({
      success: true,
      message: 'NFT minting process initiated. You will receive an email upon completion.',
      orderId: orderId
    });

  } catch (error: any) {
    console.error('❌ Top-level error in minting trigger:', error);
    // Don't update status here, as the background fetch might still be running
    // The webhook or a timeout job should handle the failure state
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate NFT minting',
      orderId: orderId
    });
  }
}