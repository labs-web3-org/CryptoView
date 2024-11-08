require('dotenv').config()
const axios = require('axios')

const { ETHERSCAN_API_KEY } = process.env

const getContractABI = async (contractAddress) => {
    try {
        const {
            data: {
                result: ABI
            }
        } = await axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`)

        return JSON.parse(ABI)

    } catch (error) {
        throw error
    }
}

module.exports = {
    getContractABI
}