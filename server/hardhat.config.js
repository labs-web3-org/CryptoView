require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const { INFURA_SEPOLIA_PROVIDER, INFURA_API_KEY, ACCOUNT_PRIVATE_KEY } = process.env
/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: `${INFURA_SEPOLIA_PROVIDER}${INFURA_API_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
    }
  }
};
