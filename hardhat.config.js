require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 20000000000, // 20 gwei
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 'auto',
    }
  },
etherscan: {
  apiKey: {
    polygon: process.env.ETHERSCAN_API_KEY,
    polygonMumbai: process.env.ETHERSCAN_API_KEY,
  },
  customChains: [
    {
      network: "polygon",
      chainId: 137,
      urls: {
        apiURL: "https://api.etherscan.io/v2/api?chainid=137",
        browserURL: "https://polygonscan.com"
      }
    }
  ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};