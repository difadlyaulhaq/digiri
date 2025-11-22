// pages/api/nft/debug-mint.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, customerEmail } = req.body;

  try {
    console.log('🔍 Detailed debug minting process...');

    // Test 1: Simple GET request to check collection
    console.log('1. Testing collection access...');
    const collectionTest = await fetch(
      `https://www.crossmint.com/api/2022-06-09/collections/${process.env.CROSSMINT_COLLECTION_ID}`,
      {
        method: 'GET',
        headers: {
          'X-API-KEY': process.env.CROSSMINT_API_KEY!,
        }
      }
    );
    
    console.log('Collection test status:', collectionTest.status);
    const collectionData = await collectionTest.text();
    console.log('Collection test response:', collectionData.substring(0, 200));

    // Test 2: Simple POST with minimal data
    console.log('2. Testing minimal NFT mint...');
    const minimalMetadata = {
      name: "Test Batik",
      image: "https://images.unsplash.com/photo-1594736797933-d0401ba94693?w=500&h=500&fit=crop",
      description: "Test NFT"
    };

    const mintTest = await fetch(
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
          metadata: minimalMetadata
        })
      }
    );

    console.log('Mint test status:', mintTest.status);
    const mintResponse = await mintTest.text();
    console.log('Mint test response:', mintResponse);

    res.status(200).json({
      success: true,
      tests: {
        collectionTest: {
          status: collectionTest.status,
          data: collectionData.substring(0, 200)
        },
        mintTest: {
          status: mintTest.status,
          response: mintResponse
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}