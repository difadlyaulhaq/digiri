import { ethers } from 'ethers';

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS!;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

// Simple ABI untuk kontrak yang sudah diperbaiki
const BatikNFTABI = [
  "function mintNFT(address to, string memory orderId, string memory tokenURI) public returns (uint256)",
  "function batchMintNFT(address[] memory recipients, string[] memory orderIds, string[] memory tokenURIs) external",
  "function registerWallet(address wallet, string memory email) external",
  "function getTokenIdByOrder(string memory orderId) external view returns (uint256)",
  "function getOrderByTokenId(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, string orderId)",
  "event WalletRegistered(address indexed wallet, string email)"
];

// Setup provider dan signer
let provider: ethers.providers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

function initializeContract() {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL);
    
    // Pastikan private key diawali dengan 0x
    const privateKey = DEPLOYER_PRIVATE_KEY.startsWith('0x') 
      ? DEPLOYER_PRIVATE_KEY 
      : `0x${DEPLOYER_PRIVATE_KEY}`;
    
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, BatikNFTABI, wallet);
  }
  return { provider, wallet, contract };
}

export interface MintNFTParams {
  recipientAddress: string;
  orderId: string;
  metadataURI: string;
}

export async function mintNFTOnChain(params: MintNFTParams) {
  try {
    console.log('⛓️ Starting on-chain minting process...');
    const { contract } = initializeContract();

    // Check gas price
    const gasPrice = await provider.getGasPrice();
    console.log('⛽ Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'Gwei');

    // Estimate gas
    const gasEstimate = await contract.estimateGas.mintNFT(
      params.recipientAddress,
      params.orderId,
      params.metadataURI
    );
    console.log('⛽ Gas estimate:', gasEstimate.toString());

    // Send transaction
    const tx = await contract.mintNFT(
      params.recipientAddress,
      params.orderId,
      params.metadataURI,
      {
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
        gasPrice: gasPrice.mul(110).div(100), // Add 10% to current gas price
      }
    );

    console.log('📤 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    // Wait for confirmation
    const receipt = await tx.wait(2); // 2 confirmations
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

    // Get token ID from event
    const event = receipt.events?.find((e: any) => e.event === 'NFTMinted');
    const tokenId = event?.args?.tokenId.toString();

    if (!tokenId) {
      throw new Error('Token ID not found in transaction receipt');
    }

    console.log('🎨 NFT Minted! Token ID:', tokenId);

    // Construct OpenSea URL
    const network = process.env.NODE_ENV === 'production' ? 'matic' : 'mumbai';
    const openseaUrl = `https://opensea.io/assets/${network}/${NFT_CONTRACT_ADDRESS}/${tokenId}`;

    return {
      success: true,
      tokenId,
      transactionHash: receipt.transactionHash,
      contractAddress: NFT_CONTRACT_ADDRESS,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      openseaUrl,
      polygonscanUrl: `https://polygonscan.com/tx/${receipt.transactionHash}`
    };

  } catch (error: any) {
    console.error('❌ Error minting NFT on-chain:', error);
    
    // Parse error message
    let errorMessage = 'Unknown blockchain error';
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for gas';
    } else if (error.code === 'NONCE_EXPIRED') {
      errorMessage = 'Transaction nonce expired';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(`Blockchain error: ${errorMessage}`);
  }
}

// Batch mint multiple NFTs
export async function batchMintNFTs(mintParams: MintNFTParams[]) {
  try {
    console.log(`⛓️ Starting batch mint for ${mintParams.length} NFTs...`);
    const { contract } = initializeContract();

    const recipients = mintParams.map(p => p.recipientAddress);
    const orderIds = mintParams.map(p => p.orderId);
    const metadataURIs = mintParams.map(p => p.metadataURI);

    const tx = await contract.batchMintNFT(recipients, orderIds, metadataURIs);
    const receipt = await tx.wait(2);

    console.log('✅ Batch mint successful!');

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      mintCount: mintParams.length
    };

  } catch (error) {
    console.error('❌ Error in batch minting:', error);
    throw error;
  }
}

// Create custodial wallet untuk user
export async function createCustodialWallet(email: string): Promise<{
  address: string;
  privateKey: string;
}> {
  try {
    console.log('👛 Creating custodial wallet for:', email);

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();

    console.log('✅ Wallet created:', wallet.address);

    // IMPORTANT: Simpan private key terenkripsi di database!
    // Jangan log private key di production!
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔑 Private Key (DEV ONLY):', wallet.privateKey);
    }

    return {
      address: wallet.address,
      privateKey: wallet.privateKey // ENCRYPT THIS BEFORE STORING!
    };

  } catch (error) {
    console.error('❌ Error creating custodial wallet:', error);
    throw error;
  }
}

// Get wallet address dari email (check database first)
export async function getOrCreateWalletForEmail(email: string): Promise<string> {
  try {
    // TODO: Check database untuk existing wallet
    // const existingWallet = await db.wallets.findOne({ email });
    // if (existingWallet) return existingWallet.address;

    // Create new wallet jika belum ada
    const { address, privateKey } = await createCustodialWallet(email);

    // TODO: Save to database (ENCRYPTED!)
    // await db.wallets.create({
    //   email,
    //   address,
    //   encryptedPrivateKey: encrypt(privateKey, ENCRYPTION_KEY)
    // });

    // Register wallet di contract
    const { contract } = initializeContract();
    const tx = await contract.registerWallet(address, email);
    await tx.wait(1);

    return address;

  } catch (error) {
    console.error('❌ Error getting/creating wallet:', error);
    throw error;
  }
}

// Check wallet balance
export async function getWalletBalance(address: string): Promise<string> {
  const { provider } = initializeContract();
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

// Get NFT details
export async function getNFTDetails(tokenId: string) {
  try {
    const { contract } = initializeContract();
    
    const owner = await contract.ownerOf(tokenId);
    const tokenURI = await contract.tokenURI(tokenId);
    const orderId = await contract.getOrderByTokenId(tokenId);

    return {
      tokenId,
      owner,
      tokenURI,
      orderId
    };

  } catch (error) {
    console.error('❌ Error getting NFT details:', error);
    throw error;
  }
}

export default {
  mintNFTOnChain,
  batchMintNFTs,
  createCustodialWallet,
  getOrCreateWalletForEmail,
  getWalletBalance,
  getNFTDetails
};