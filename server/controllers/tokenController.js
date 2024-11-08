require('dotenv').config()
const { getContractABI } = require('../utils/web3')
const { Web3 } = require('web3')

const { INFURA_PROVIDER, INFURA_API_KEY } = process.env

const provider = new Web3.providers.HttpProvider(`${INFURA_PROVIDER}${INFURA_API_KEY}`)

const web3 = new Web3(provider)

const getBalanceFromWallet = async (req, res) => {
    try {
        const { contractAddress, walletAddress } = req.query
        const ABI = await getContractABI(contractAddress);

        if (!contractAddress || !walletAddress) {
            return res.status(400).json({ success: false, message: 'Contract Address and wallet address require' })
        }

        const tokenContract = new web3.eth.Contract(ABI, contractAddress);
        const balance = await tokenContract.methods.balanceOf(walletAddress).call()

        res.status(200).json({ success: true, balance: web3.utils.fromWei(balance, 'ether') })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error getting the balance' })
    }
}

module.exports = {
    getBalanceFromWallet
}