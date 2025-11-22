// pages/api/nft/mint.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus } from '@/utils/orderUtils';
import { sendEmail } from '@/lib/email'; // Import email service

interface MintNFTRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  productImage: string;
  artisan: string;
  location: string;
  motif: string;
  processingTime: string;
}

interface CrossmintResponse {
  id: string;
  onChain: {
    txId: string;
    contractAddress: string;
  };
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
function cleanImageUrl(url: string): string {
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

  const {
    orderId,
    customerEmail,
    customerName,
    productName,
    productImage,
    artisan,
    location,
    motif,
    processingTime
  }: MintNFTRequest = req.body;

  // Validasi input
  if (!orderId || !customerEmail || !productName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: orderId, customerEmail, productName'
    });
  }

  try {
    console.log('🔄 Starting NFT minting process for order:', orderId);

    // Bersihkan dan validasi URL gambar
    const cleanedImageUrl = cleanImageUrl(productImage);
    console.log('🖼️ Cleaned image URL:', cleanedImageUrl);

    // Potong nama produk agar tidak melebihi 32 bytes
    const shortProductName = truncateTo32Bytes(productName);
    const nftName = truncateTo32Bytes(`Batik ${shortProductName}`);
    
    console.log('📝 Name processing:', {
      original: productName,
      shortProductName,
      finalName: nftName
    });

    // Prepare metadata for NFT
    const metadata = {
      name: nftName,
      image: cleanedImageUrl,
      description: `Sertifikat Keaslian Batik Tulis dari ${artisan}, ${location}`,
      attributes: [
        {
          trait_type: "Motif",
          value: truncateTo32Bytes(motif)
        },
        {
          trait_type: "Pengrajin",
          value: truncateTo32Bytes(artisan)
        },
        {
          trait_type: "Lokasi",
          value: truncateTo32Bytes(location)
        },
        {
          trait_type: "Waktu Proses",
          value: processingTime
        },
        {
          trait_type: "Order ID",
          value: orderId
        },
        {
          trait_type: "Pemilik",
          value: truncateTo32Bytes(customerName)
        },
        {
          trait_type: "Tanggal Penerbitan",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "Jenis",
          value: "Batik Tulis"
        },
        {
          trait_type: "Status",
          value: "Certified"
        }
      ],
      external_url: "https://giriloyo-batik.com",
      background_color: "FEF3C7"
    };

    console.log('📦 NFT Metadata prepared:', metadata);

    // Call Crossmint API to mint NFT
    const crossmintResponse = await fetch(
      `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}/nfts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.CROSSMINT_API_KEY!,
          'X-CLIENT-SECRET': process.env.CROSSMINT_CLIENT_SECRET!
        },
        body: JSON.stringify({
          recipient: `email:${customerEmail}:polygon`,
          metadata: metadata,
          reuploadLinkedFiles: true,
          compressed: true
        })
      }
    );

    if (!crossmintResponse.ok) {
      const errorText = await crossmintResponse.text();
      console.error('❌ Crossmint API error:', {
        status: crossmintResponse.status,
        statusText: crossmintResponse.statusText,
        error: errorText
      });
      
      // Update status ke failed di database
      await updateNFTStatus(orderId, 'failed');
      
      // Kirim email notifikasi gagal
      await sendNFTFailedEmail(customerEmail, customerName, productName, orderId);
      
      throw new Error(`Crossmint API error: ${crossmintResponse.status} - ${errorText}`);
    }

    const nftData: CrossmintResponse = await crossmintResponse.json();
    
    console.log('✅ NFT minted successfully:', {
      nftId: nftData.id,
      transactionHash: nftData.onChain.txId,
      contractAddress: nftData.onChain.contractAddress
    });

    // SIMPAN NFT ID KE DATABASE/ORDER
    await updateNFTStatus(
      orderId, 
      'minted', 
      [nftData.id], 
      nftData.onChain.txId
    );

    console.log('💾 NFT ID saved to database:', {
      orderId,
      nftId: nftData.id,
      transactionHash: nftData.onChain.txId
    });

    // Kirim email konfirmasi NFT
    await sendNFTConfirmationEmail(customerEmail, customerName, productName, nftData.id);

    res.status(200).json({
      success: true,
      nftId: nftData.id,
      transactionHash: nftData.onChain.txId,
      contractAddress: nftData.onChain.contractAddress,
      message: 'NFT berhasil dicetak dan dikirim ke email Anda'
    });

  } catch (error: any) {
    console.error('❌ NFT minting error:', error);
    
    // Update status ke failed di database
    try {
      await updateNFTStatus(orderId, 'failed');
    } catch (dbError) {
      console.error('Error updating NFT status to failed:', dbError);
    }
    
    // Notifikasi error ke admin
    await sendErrorNotificationToAdmin(orderId, error.message);

    res.status(500).json({
      success: false,
      error: error.message || 'Gagal mencetak NFT',
      orderId: orderId
    });
  }
}

// Fungsi untuk mengirim email konfirmasi NFT BERHASIL
// In mint.ts - Update the sendNFTConfirmationEmail function
export async function sendNFTConfirmationEmail(
  customerEmail: string, 
  customerName: string, 
  productName: string, 
  nftId: string
): Promise<{ success: boolean; error?: string }> { // Add return type
  try {
    console.log(`📧 Sending NFT confirmation email to: ${customerEmail}`);

    const emailContent = {
      to: customerEmail,
      subject: `🎨 NFT Certificate untuk ${productName} - Batik Giriloyo`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a, #0f172a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .nft-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1e3a8a; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 Selamat ${customerName}!</h1>
              <p>NFT Certificate Batik Giriloyo Anda Telah Siap</p>
            </div>
            <div class="content">
              <p>Halo <strong>${customerName}</strong>,</p>
              
              <div class="nft-card">
                <h3>📦 Detail NFT Certificate</h3>
                <p><strong>Produk:</strong> ${productName}</p>
                <p><strong>NFT ID:</strong> <code>${nftId}</code></p>
                <p><strong>Status:</strong> ✅ Berhasil Dicetak</p>
                <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
              </div>

              <p>🎉 <strong>NFT Certificate</strong> untuk produk <strong>${productName}</strong> telah berhasil dibuat dan dikirim ke wallet digital Anda.</p>
              
              <h4>📍 Cara Melihat NFT Anda:</h4>
              <ol>
                <li>Buka email ini di perangkat Anda</li>
                <li>NFT telah dikirim ke wallet Crossmint Anda</li>
                <li>Download aplikasi Crossmint Wallet atau kunjungi crossmint.com</li>
                <li>Login dengan email: <strong>${customerEmail}</strong></li>
                <li>NFT Anda akan muncul di koleksi</li>
              </ol>

              <p>✨ <strong>NFT ini adalah sertifikat keaslian digital</strong> yang membuktikan kepemilikan dan keaslian batik tulis Giriloyo Anda.</p>

              <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p>🛡️ <strong>Keamanan & Keaslian Terjamin</strong></p>
                <p>Setiap NFT memiliki identifikasi unik di blockchain Polygon yang tidak bisa dipalsukan.</p>
              </div>
            </div>
            <div class="footer">
              <p>Terima kasih telah mendukung pengrajin batik tradisional Giriloyo! 🎨</p>
              <p>Batik Giriloyo - Desa Giriloyo, Yogyakarta</p>
              <p>Email: nft@giriloyo-batik.com | Website: https://giriloyo-batik.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await sendEmail(emailContent);
    
    if (result.success) {
      console.log(`✅ NFT confirmation email sent to: ${customerEmail}`);
      return { success: true };
    } else {
      console.error(`❌ Failed to send NFT email to: ${customerEmail}`, result.error);
      return { 
        success: false, 
        error: result.error || 'Unknown email error' 
      };
    }

  } catch (error: any) {
    console.error('Error sending NFT confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send NFT confirmation email'
    };
  }
}

// Fungsi untuk mengirim email notifikasi GAGAL
async function sendNFTFailedEmail(
  customerEmail: string,
  customerName: string,
  productName: string,
  orderId: string
) {
  try {
    const emailContent = {
      to: customerEmail,
      subject: `⚠️ Proses NFT Certificate Tertunda - Order ${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fef3c7; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Proses NFT Tertunda</h1>
              <p>Order: ${orderId}</p>
            </div>
            <div class="content">
              <p>Halo <strong>${customerName}</strong>,</p>
              
              <p>Kami mengalami sedikit kendala teknis dalam proses pembuatan <strong>NFT Certificate</strong> untuk produk <strong>${productName}</strong>.</p>
              
              <p>🔧 <strong>Tim kami sedang menangani masalah ini</strong> dan NFT Certificate Anda akan segera diproses.</p>
              
              <p>Anda tidak perlu melakukan tindakan apapun. Kami akan mengirimkan update begitu NFT Certificate Anda siap.</p>
              
              <p>Terima kasih atas pengertian dan kesabaran Anda.</p>
            </div>
            <div class="footer">
              <p>Batik Giriloyo - Melestarikan Seni Batik Tradisional</p>
              <p>Email: support@giriloyo-batik.com</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sendEmail(emailContent);
    console.log(`📧 NFT failed notification sent to: ${customerEmail}`);

  } catch (error) {
    console.error('Error sending NFT failed email:', error);
  }
}

// Fungsi untuk notifikasi error ke admin
async function sendErrorNotificationToAdmin(orderId: string, errorMessage: string) {
  try {
    console.log(`🚨 NFT Minting Error for Order ${orderId}: ${errorMessage}`);
    
    // Jika ada email admin di environment variables, kirim notifikasi
    if (process.env.ADMIN_EMAIL) {
      const adminEmailContent = {
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 NFT Minting Failed - Order ${orderId}`,
        html: `
          <h2>🚨 NFT Minting Error</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p>Please check the logs and retry the minting process.</p>
        `
      };

      await sendEmail(adminEmailContent);
    }
    
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}