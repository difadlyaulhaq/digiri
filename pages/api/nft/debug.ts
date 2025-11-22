// pages/api/nft/debug.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Jangan expose di production!
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not allowed in production' });
  }

  res.status(200).json({
    crossmint: {
      hasCollectionId: !!process.env.CROSSMINT_COLLECTION_ID,
      hasApiKey: !!process.env.CROSSMINT_API_KEY,
      hasClientSecret: !!process.env.CROSSMINT_CLIENT_SECRET,
      collectionIdLength: process.env.CROSSMINT_COLLECTION_ID?.length,
      apiKeyLength: process.env.CROSSMINT_API_KEY?.length,
      clientSecretLength: process.env.CROSSMINT_CLIENT_SECRET?.length,
    },
    nodeEnv: process.env.NODE_ENV
  });
}