import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadImageToIPFS, uploadMetadataToIPFS, NFTMetadata } from '@/lib/ipfs';
import { mintNFTOnChain, getOrCreateWalletForEmail } from '@/lib/blockchain';
import { updateNFTStatus } from '@/utils/orderUtils';
import { sendEmail } from '@/lib/email';

interface MintRequest {
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
  }: MintRequest = req.body;

  // Validasi input
  if (!orderId || !customerEmail || !productName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  try {
    console.log('🎨 Starting OpenSea NFT minting for order:', orderId);

    // STEP 1: Upload gambar ke IPFS
    console.log('📤 Step 1: Uploading image to IPFS...');
    let ipfsImageUrl: string;
    
    try {
      ipfsImageUrl = await uploadImageToIPFS(productImage);
      console.log('✅ Image uploaded:', ipfsImageUrl);
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      throw new Error('Failed to upload image to IPFS');
    }

    // STEP 2: Prepare metadata sesuai OpenSea standards
    console.log('📝 Step 2: Preparing metadata...');
    const metadata: NFTMetadata = {
      name: `Batik ${productName}`,
      description: `Sertifikat Keaslian Digital Batik Tulis dari ${artisan}, ${location}. Batik ini merupakan karya seni tradisional yang dibuat dengan proses tulis tangan membutuhkan waktu ${processingTime}.`,
      image: ipfsImageUrl,
      external_url: `https://digiri.vercel.app/verify-certificate?orderId=${orderId}`,
      attributes: [
        {
          trait_type: "Motif",
          value: motif
        },
        {
          trait_type: "Pengrajin",
          value: artisan
        },
        {
          trait_type: "Lokasi",
          value: location
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
          trait_type: "Pemilik Awal",
          value: customerName
        },
        {
          trait_type: "Tanggal Penerbitan",
          value: new Date().toISOString().split('T')[0],
          display_type: 'date'
        },
        {
          trait_type: "Jenis Batik",
          value: "Batik Tulis"
        },
        {
          trait_type: "Desa Asal",
          value: "Giriloyo"
        },
        {
          trait_type: "Provinsi",
          value: "D.I. Yogyakarta"
        },
        {
          trait_type: "Status Sertifikat",
          value: "Certified"
        }
      ],
      background_color: "FEF3C7" // Warm yellow for batik
    };

    // STEP 3: Upload metadata ke IPFS
    console.log('📤 Step 3: Uploading metadata to IPFS...');
    let metadataURI: string;
    
    try {
      metadataURI = await uploadMetadataToIPFS(metadata);
      console.log('✅ Metadata uploaded:', metadataURI);
    } catch (error) {
      console.error('❌ Failed to upload metadata:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }

    // STEP 4: Get atau create wallet untuk customer
    console.log('👛 Step 4: Getting wallet for customer...');
    let recipientAddress: string;
    
    try {
      recipientAddress = await getOrCreateWalletForEmail(customerEmail);
      console.log('✅ Wallet address:', recipientAddress);
    } catch (error) {
      console.error('❌ Failed to get wallet:', error);
      throw new Error('Failed to create wallet for customer');
    }

    // STEP 5: Mint NFT on Polygon blockchain
    console.log('⛓️ Step 5: Minting NFT on blockchain...');
    let mintResult;
    
    try {
      mintResult = await mintNFTOnChain({
        recipientAddress,
        orderId,
        metadataURI
      });
      console.log('✅ NFT minted:', mintResult);
    } catch (error: any) {
      console.error('❌ Failed to mint NFT:', error);
      
      // Update status ke failed
      await updateNFTStatus(orderId, 'failed');
      
      throw new Error(`Blockchain minting failed: ${error.message}`);
    }

    // STEP 6: Update database dengan NFT data
    console.log('💾 Step 6: Updating database...');
    try {
      await updateNFTStatus(
        orderId,
        'minted',
        [mintResult.tokenId],
        mintResult.transactionHash
      );
      console.log('✅ Database updated');
    } catch (error) {
      console.error('❌ Failed to update database:', error);
      // NFT sudah di-mint, jadi tetap lanjut meski database error
    }

    // STEP 7: Send email dengan link OpenSea
    console.log('📧 Step 7: Sending email...');
    try {
      await sendOpenSeaNFTEmail({
        customerEmail,
        customerName,
        productName,
        tokenId: mintResult.tokenId,
        openseaUrl: mintResult.openseaUrl,
        transactionHash: mintResult.transactionHash,
        polygonscanUrl: mintResult.polygonscanUrl
      });
      console.log('✅ Email sent');
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Email gagal tapi NFT sudah di-mint, jadi tetap return success
    }

    // SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      tokenId: mintResult.tokenId,
      transactionHash: mintResult.transactionHash,
      contractAddress: mintResult.contractAddress,
      openseaUrl: mintResult.openseaUrl,
      polygonscanUrl: mintResult.polygonscanUrl,
      recipientAddress,
      metadataURI,
      message: 'NFT berhasil dicetak dan tersedia di OpenSea!'
    });

  } catch (error: any) {
    console.error('❌ NFT minting error:', error);
    
    // Try to update status to failed
    try {
      await updateNFTStatus(orderId, 'failed');
    } catch (dbError) {
      console.error('Error updating status to failed:', dbError);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Gagal mencetak NFT',
      orderId
    });
  }
}

// Email template untuk OpenSea NFT
async function sendOpenSeaNFTEmail(params: {
  customerEmail: string;
  customerName: string;
  productName: string;
  tokenId: string;
  openseaUrl: string;
  transactionHash: string;
  polygonscanUrl: string;
}) {
  const emailContent = {
    to: params.customerEmail,
    subject: `🎨 NFT Certificate Batik Giriloyo - ${params.productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #1e3a8a, #0f172a); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { background: #f8fafc; padding: 30px; }
          .nft-card { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #2081E2; 
            margin: 20px 0; 
          }
          .button {
            display: inline-block;
            background: #2081E2;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 10px 5px;
          }
          .button-secondary {
            background: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Selamat ${params.customerName}!</h1>
            <p>NFT Certificate Anda Telah Berhasil Dicetak</p>
          </div>
          <div class="content">
            <p>Halo <strong>${params.customerName}</strong>,</p>
            
            <div class="nft-card">
              <h3>📦 Detail NFT Certificate</h3>
              <p><strong>Produk:</strong> ${params.productName}</p>
              <p><strong>Token ID:</strong> <code>${params.tokenId}</code></p>
              <p><strong>Status:</strong> ✅ Berhasil Dicetak di Blockchain Polygon</p>
              <p><strong>Transaction Hash:</strong></p>
              <code style="font-size: 11px; word-break: break-all;">${params.transactionHash}</code>
            </div>

            <p>🎉 <strong>NFT Certificate</strong> Anda telah berhasil dicetak di blockchain Polygon dan sekarang tersedia di <strong>OpenSea</strong>!</p>
            
            <h4>📍 Cara Melihat NFT Anda:</h4>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.openseaUrl}" class="button">
                🌊 Lihat di OpenSea
              </a>
              <a href="${params.polygonscanUrl}" class="button button-secondary">
                🔍 Lihat di PolygonScan
              </a>
            </div>

            <ol>
              <li><strong>Klik tombol "Lihat di OpenSea"</strong> di atas</li>
              <li>Anda akan melihat NFT certificate Anda di marketplace OpenSea</li>
              <li>NFT ini adalah milik Anda dan tersimpan di wallet digital</li>
              <li>Anda bisa melihat, menyimpan, atau menjual NFT ini kapan saja</li>
            </ol>

            <h4>💼 Tentang Wallet Anda:</h4>
            <p>Kami telah membuatkan custodial wallet untuk Anda. Wallet ini menyimpan NFT certificate Anda dengan aman. Jika Anda ingin mengontrol wallet sendiri, hubungi customer service kami.</p>

            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p>🛡️ <strong>Keamanan & Keaslian Terjamin</strong></p>
              <p>NFT ini tersimpan di blockchain Polygon yang tidak bisa dipalsukan atau diubah. Setiap transaksi tercatat secara permanent dan dapat diverifikasi oleh siapa saja.</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p>🎨 <strong>Apa yang Bisa Dilakukan dengan NFT Ini?</strong></p>
              <ul>
                <li>✅ Membuktikan keaslian batik Anda</li>
                <li>✅ Menyimpan sebagai koleksi digital</li>
                <li>✅ Menjual atau transfer ke orang lain</li>
                <li>✅ Menampilkan di profil OpenSea</li>
                <li>✅ Memverifikasi keaslian di website kami</li>
              </ul>
            </div>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
            <p>Terima kasih telah mendukung pengrajin batik tradisional Giriloyo! 🎨</p>
            <p><strong>Batik Giriloyo</strong> - Desa Giriloyo, Yogyakarta</p>
            <p>Email: difadlyaulhaq2@gmail.com | Website: https://digiri.vercel.app</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await sendEmail(emailContent);
}