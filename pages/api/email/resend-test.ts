// pages/api/email/resend-test.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend('re_fMu1GhTG_4F71kPqgpFC1peTZJP9CpJ19');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔄 Testing Resend email...');

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'difadlyaulhaq2@gmail.com',
      subject: 'Test dari Batik Giriloyo',
      html: '<p><strong>Selamat!</strong> Email test dari Batik Giriloyo berhasil dikirim!</p>',
    });

    console.log('✅ Resend test successful:', data);

    res.status(200).json({
      success: true,
      message: 'Email test berhasil dikirim',
      data: data
    });
  } catch (error: any) {
    console.error('❌ Resend test error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
}