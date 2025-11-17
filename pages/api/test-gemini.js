// pages/api/test-gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Izinkan method GET untuk testing
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  console.log('🔑 API Key Info:', {
    hasNextPublic: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    hasRegular: !!process.env.GEMINI_API_KEY,
    keyLength: apiKey?.length,
    keyPrefix: apiKey?.substring(0, 6) + '...'
  });

  if (!apiKey) {
    return res.status(400).json({ 
      error: 'API Key tidak ditemukan',
      instructions: [
        '1. Buat file .env.local di root project',
        '2. Tambahkan: NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...',
        '3. Dapatkan API key dari: https://aistudio.google.com/',
        '4. Restart server: npm run dev'
      ]
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test dengan model yang berbeda-beda
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-2.5-flash',
      'gemini-pro'
    ];

    let successfulModel = null;
    let testResult = null;

    for (const modelName of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, please respond with 'AI is working!'");
        const response = await result.response;
        const text = response.text();
        
        successfulModel = modelName;
        testResult = text;
        break; // Stop pada model pertama yang berhasil
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
        continue;
      }
    }

    if (successfulModel) {
      res.status(200).json({
        status: 'SUCCESS',
        message: 'API Key valid dan bekerja!',
        model: successfulModel,
        response: testResult,
        keyInfo: {
          length: apiKey.length,
          prefix: apiKey.substring(0, 10) + '...'
        }
      });
    } else {
      res.status(400).json({
        status: 'FAILED',
        error: 'Semua model gagal',
        message: 'API key mungkin tidak memiliki akses ke model Gemini',
        instructions: [
          'Pastikan API key dari Google AI Studio',
          'Cek quota di: https://aistudio.google.com/',
          'Pastikan billing account aktif jika diperlukan'
        ]
      });
    }

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      details: {
        apiKeyExists: !!apiKey,
        keyLength: apiKey?.length,
        keyPrefix: apiKey?.substring(0, 10) + '...',
        possibleCauses: [
          'API key expired atau tidak valid',
          'Quota exceeded',
          'Model tidak tersedia',
          'Region restrictions'
        ]
      }
    });
  }
}