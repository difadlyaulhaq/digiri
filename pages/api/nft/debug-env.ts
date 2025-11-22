// pages/api/nft/debug-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya untuk development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  res.status(200).json({
    crossmint: {
      collectionId: process.env.CROSSMINT_COLLECTION_ID ? '***' + process.env.CROSSMINT_COLLECTION_ID.slice(-4) : 'MISSING',
      apiKey: process.env.CROSSMINT_API_KEY ? '***' + process.env.CROSSMINT_API_KEY.slice(-4) : 'MISSING',
      clientSecret: process.env.CROSSMINT_CLIENT_SECRET ? '***' + process.env.CROSSMINT_CLIENT_SECRET.slice(-4) : 'MISSING',
      collectionIdLength: process.env.CROSSMINT_COLLECTION_ID?.length,
      apiKeyLength: process.env.CROSSMINT_API_KEY?.length,
      clientSecretLength: process.env.CROSSMINT_CLIENT_SECRET?.length,
    },
    nodeEnv: process.env.NODE_ENV
  });
}