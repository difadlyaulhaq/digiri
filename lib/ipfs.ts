import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_JWT = process.env.PINATA_JWT; // Alternative auth

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'string' | 'number' | 'date';
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI
  external_url?: string;
  attributes: NFTAttribute[];
  background_color?: string;
  animation_url?: string;
  youtube_url?: string;
}

// Upload gambar ke IPFS via Pinata
export async function uploadImageToIPFS(imageUrl: string): Promise<string> {
  try {
    console.log('📤 Uploading image to IPFS:', imageUrl);

    // Jika URL adalah base64, convert ke buffer
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      return await uploadBufferToIPFS(buffer, 'image.png');
    }

    // Download gambar dari URL
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const buffer = Buffer.from(imageResponse.data);
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'png';
    
    return await uploadBufferToIPFS(buffer, `image.${extension}`);
  } catch (error) {
    console.error('❌ Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

// Upload buffer ke Pinata
async function uploadBufferToIPFS(buffer: Buffer, filename: string): Promise<string> {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', buffer, filename);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log('✅ Image uploaded to IPFS:', ipfsHash);
    
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error('❌ Error in uploadBufferToIPFS:', error.response?.data || error.message);
    throw error;
  }
}

// Upload metadata JSON ke IPFS
export async function uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
  try {
    console.log('📤 Uploading metadata to IPFS:', metadata.name);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    console.log('✅ Metadata uploaded to IPFS:', ipfsHash);
    
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error('❌ Error uploading metadata to IPFS:', error.response?.data || error.message);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

// Upload collection metadata (untuk OpenSea collection page)
export async function uploadCollectionMetadata(): Promise<string> {
  const collectionMetadata = {
    name: "Batik Giriloyo Heritage Collection",
    description: "Sertifikat keaslian digital untuk batik tulis dari Desa Wisata Batik Giriloyo, Yogyakarta. Setiap NFT mewakili kepemilikan dan keaslian produk batik yang dibuat oleh pengrajin lokal.",
    image: "ipfs://YOUR_COLLECTION_IMAGE_HASH", // Upload collection image dulu
    external_link: "https://digiri.vercel.app",
    seller_fee_basis_points: 250, // 2.5% royalty
    fee_recipient: "0xYOUR_WALLET_ADDRESS" // Address yang terima royalty
  };

  return await uploadMetadataToIPFS(collectionMetadata as any);
}