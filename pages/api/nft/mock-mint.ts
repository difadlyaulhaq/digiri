// pages/api/nft/mock-mint.ts - IMPROVED dengan email fix
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus, getOrderById } from '@/utils/orderUtils';
import { sendEmail } from '@/lib/email';

interface MockMintRequest {
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  productImage?: string;
  artisan?: string;
  location?: string;
  motif?: string;
  processingTime?: string;
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
  }: MockMintRequest = req.body;

  try {
    console.log('🎭 Creating mock NFT for order:', orderId);

    // Validasi input
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    // Cek apakah order exists
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Gunakan data dari order jika tidak disediakan di request
    const finalCustomerEmail = customerEmail || order.shippingAddress.email;
    const finalCustomerName = customerName || order.shippingAddress.name;
    const finalProductName = productName || order.items[0]?.name || 'Batik Giriloyo';
    const finalArtisan = artisan || "Pengrajin Giriloyo";
    const finalLocation = location || "Desa Giriloyo, Yogyakarta";
    const finalMotif = motif || finalProductName.split('Motif ')[1] || finalProductName;
    const finalProcessingTime = processingTime || "14-21 hari";

    // Generate realistic mock data
    const mockNftId = `mock-nft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mockTransactionHash = `0x${Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    const mockContractAddress = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');

    console.log('✅ Mock NFT data generated:', {
      nftId: mockNftId,
      transactionHash: mockTransactionHash,
      customerEmail: finalCustomerEmail
    });

    // Simpan ke database
    const updateSuccess = await updateNFTStatus(
      orderId, 
      'minted', 
      [mockNftId], 
      mockTransactionHash
    );

    if (!updateSuccess) {
      throw new Error('Failed to update NFT status in database');
    }

    console.log('💾 Mock NFT saved to database for order:', orderId);

    // Kirim email konfirmasi NFT
    const emailResult = await sendNFTConfirmationEmail(
      finalCustomerEmail, 
      finalCustomerName, 
      finalProductName, 
      mockNftId,
      mockTransactionHash
    );

    if (!emailResult.success) {
      console.error('❌ Failed to send NFT email:', emailResult.error);
      // Tetap return success karena NFT sudah dibuat, hanya email yang gagal
    }

    res.status(200).json({
      success: true,
      nftId: mockNftId,
      transactionHash: mockTransactionHash,
      contractAddress: mockContractAddress,
      emailSent: emailResult.success,
      message: 'Mock NFT berhasil dibuat (Development Mode)',
      note: 'Ini adalah NFT mock untuk development'
    });

  } catch (error: any) {
    console.error('❌ Mock NFT creation error:', error);
    
    // Try to update status to failed
    try {
      await updateNFTStatus(orderId, 'failed');
    } catch (dbError) {
      console.error('Error updating NFT status to failed:', dbError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Gagal membuat mock NFT',
      orderId: orderId
    });
  }
}

// Fungsi untuk mengirim email konfirmasi NFT
async function sendNFTConfirmationEmail(
  customerEmail: string, 
  customerName: string, 
  productName: string, 
  nftId: string,
  transactionHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 Sending NFT confirmation email to: ${customerEmail}`);

    const emailContent = {
      to: customerEmail,
      subject: `🎨 NFT Certificate untuk ${productName} - Batik Giriloyo`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f8fafc;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: white;
            }
            .header { 
              background: linear-gradient(135deg, #1e3a8a, #0f172a); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f8fafc; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .nft-card { 
              background: white; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #1e3a8a; 
              margin: 20px 0; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #64748b; 
              font-size: 14px; 
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a, #0f172a);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 10px 0;
            }
            .development-note {
              background: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
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
                <p><strong>Transaction Hash:</strong> <code>${transactionHash}</code></p>
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

              <div class="development-note">
                <p>💡 <strong>Development Note</strong></p>
                <p>Ini adalah NFT mock untuk keperluan development. Di lingkungan production, NFT ini akan dicetak di blockchain Polygon yang sesungguhnya.</p>
              </div>

              <a href="https://digiri.vercel.app/orders" class="button">
                Lihat Pesanan Saya
              </a>
            </div>
            <div class="footer">
              <p>Terima kasih telah mendukung pengrajin batik tradisional Giriloyo! 🎨</p>
              <p><strong>Batik Giriloyo</strong> - Desa Giriloyo, Yogyakarta</p>
              <p>Email: difadlyaulhaq2@gmail.com | Website: https://digiri.vercel.app</p>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
                Email ini dikirim otomatis, mohon tidak membalas email ini.
              </p>
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