// pages/api/nft/test-simple-mint.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateNFTStatus } from '@/utils/orderUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, customerEmail } = req.body;

  try {
    console.log('🧪 Testing simple NFT mint for:', { orderId, customerEmail });

    const metadata = {
      name: "Batik Test",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=500&h=500&fit=crop",
      description: "Test NFT Certificate",
      attributes: [
        {
          trait_type: "Motif",
          value: "Test"
        },
        {
          trait_type: "Order ID",
          value: orderId
        }
      ]
    };

    const crossmintResponse = await fetch(
      `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}/nfts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.CROSSMINT_API_KEY!,
          'X-CLIENT-SECRET': process.env.CROSSMINT_CLIENT_SECRET!
        },
        body: JSON.stringify({
          recipient: `email:${customerEmail}:polygon`,
          metadata: metadata
        })
      }
    );

    const responseText = await crossmintResponse.text();
    console.log('🔍 Simple test response:', responseText);

    if (!crossmintResponse.ok) {
      throw new Error(`Test failed: ${crossmintResponse.status} - ${responseText}`);
    }

    const nftData = JSON.parse(responseText);

    await updateNFTStatus(orderId, 'minted', [nftData.id], nftData.onChain.txId);

    res.status(200).json({
      success: true,
      nftId: nftData.id,
      message: 'Test NFT berhasil dibuat'
    });

  } catch (error: any) {
    console.error('❌ Simple test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}