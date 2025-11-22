// pages/api/nft/test-connection.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('🔗 Testing Crossmint connection...');

    // Test dengan request GET yang sederhana
    const testResponse = await fetch(
      `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.CROSSMINT_API_KEY!,
        }
      }
    );

    console.log('🔍 Connection test status:', testResponse.status);

    if (testResponse.ok) {
      res.status(200).json({
        success: true,
        status: testResponse.status,
        message: 'Berhasil terhubung ke Crossmint API'
      });
    } else {
      const errorText = await testResponse.text();
      res.status(testResponse.status).json({
        success: false,
        status: testResponse.status,
        error: errorText,
        message: 'Gagal terhubung ke Crossmint API'
      });
    }

  } catch (error: any) {
    console.error('❌ Connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error saat test koneksi'
    });
  }
}