// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { batikAIService } from '@/lib/geminiService'; // Import service Anda

type Data = {
  response?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Panggil service Anda di sisi server
    const aiResponseText = await batikAIService.sendMessage(message as string);

    // Kirim balasan ke client
    res.status(200).json({ response: aiResponseText });

  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}