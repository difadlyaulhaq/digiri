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
    const result = await sendEmail({
      to: to || 'test@example.com',
      subject: 'Test Email dari Batik Giriloyo',
      html: '<h1>Test Email Berhasil!</h1><p>Sistem email Batik Giriloyo berfungsi dengan baik.</p>'
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test email' });
  }
}