// pages/api/email/test.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to } = req.body;

  try {
    console.log('🔄 Testing email service...');

    const result = await sendEmail({
      to: to || 'difadlyaulhaq2@gmail.com',
      subject: 'Test Email dari Batik Giriloyo',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a, #0f172a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Email Berhasil! 🎉</h1>
            </div>
            <div style="padding: 30px; background: #f8fafc;">
              <p>Sistem email Batik Giriloyo berfungsi dengan baik.</p>
              <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
              <p><strong>Email:</strong> ${to || 'difadlyaulhaq2@gmail.com'}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (result.success) {
      console.log('✅ Test email sent successfully');
      res.status(200).json({ 
        success: true, 
        message: 'Email test berhasil dikirim',
        data: result.data 
      });
    } else {
      console.error('❌ Test email failed:', result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Gagal mengirim email test' 
      });
    }

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send test email' 
    });
  }
}