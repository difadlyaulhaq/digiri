const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Batik Giriloyo NFT Contract...");

  const BatikNFT = await hre.ethers.getContractFactory("BatikGiriloyoNFT");
  const batikNFT = await BatikNFT.deploy();

  await batikNFT.deployed();

  console.log("✅ Contract deployed to:", batikNFT.address);
  console.log("📝 Save this address to your .env.local:");
  console.log(`NFT_CONTRACT_ADDRESS=${batikNFT.address}`);

  // Wait for block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await batikNFT.deployTransaction.wait(5);

  // Verify contract on Polygonscan
  console.log("🔍 Verifying contract on Polygonscan...");
  try {
    await hre.run("verify:verify", {
      address: batikNFT.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });