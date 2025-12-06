// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailContent {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(emailContent: EmailContent): Promise<{ success: boolean; error?: any; data?: any }> {
  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Batik Giriloyo <onboarding@resend.dev>';
    
    // Jika masih menggunakan email default resend, beri peringatan
    if (fromAddress.includes('onboarding@resend.dev')) {
      console.warn(
        '⚠️ WARNING: Using default Resend "from" address. Emails can only be sent to your own verified email address.'
      );
    }

    console.log(`📧 Attempting to send email from: ${fromAddress} to: ${emailContent.to}`);
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('❌ An exception occurred while sending email:', error);
    return { 
      success: false, 
      error: { message: error.message || 'Unknown exception occurred' }
    };
  }
}

export interface NFTConfirmationEmailParams {
  customerEmail: string;
  customerName: string;
  productName: string;
  nftId: string;
  txId: string;
  openseaUrl: string;
}

export async function sendNFTConfirmationEmail(params: NFTConfirmationEmailParams) {
  const { customerEmail, customerName, productName, nftId, txId } = params;
  const demoOpenseaUrl = "https://opensea.io/item/ethereum/0x5616c69984db1449b49c3b3adacdd00d77295959/1";
  const emailContent = {
    to: customerEmail,
    subject: `🎨 NFT Certificate untuk ${productName} Telah Siap!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #1e3a8a, #0f172a); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; }
            .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 20px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎨 Selamat, ${customerName}!</h1>
                  <p>NFT Certificate Anda telah berhasil dicetak.</p>
              </div>
              <div class="content">
                  <p>Halo <strong>${customerName}</strong>,</p>
                  <p>Kabar baik! NFT Certificate untuk produk <strong>${productName}</strong> telah berhasil dibuat dan dikirimkan ke wallet Anda.</p>
                  
                  <h4>Detail NFT Anda:</h4>
                  <ul>
                      <li><strong>Produk:</strong> ${productName}</li>
                      <li><strong>NFT ID:</strong> ${nftId}</li>
                      <li><strong>Transaction ID:</strong> ${txId.substring(0, 20)}...</li>
                      <li><strong>Blockchain:</strong> Polygon</li>
                  </ul>
                  
                  <p>Anda dapat melihat NFT Anda langsung di OpenSea, marketplace NFT terbesar.</p>
                  
                  <a href="${demoOpenseaUrl}" class="button">Lihat NFT di OpenSea</a>
                  
                  <h4>Bagaimana Cara Mengaksesnya?</h4>
                  <p>NFT ini terasosiasi dengan email Anda (<strong>${customerEmail}</strong>). Cukup login ke OpenSea atau wallet lain yang mendukung Crossmint dengan email ini untuk melihat koleksi Anda.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };
  return await sendEmail(emailContent);
}