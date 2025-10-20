require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    fhevmTestnet: {
      url: process.env.RPC_URL || "https://rpc.zama.ai/fhevm-testnet",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  paths: {
    artifacts: "../artifacts"
  }
};
