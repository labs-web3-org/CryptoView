require('dotenv').config()
const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')


const { INFURA_HOLESKY_PROVIDER, INFURA_SEPOLIA_PROVIDER, ACCOUNT_PRIVATE_KEY, INFURA_API_KEY } = process.env


const provider = new ethers.JsonRpcProvider(`${INFURA_HOLESKY_PROVIDER}${INFURA_API_KEY}`)

const wallet = new ethers.Wallet(ACCOUNT_PRIVATE_KEY, provider);
const contractAddressFile = path.resolve(__dirname, 'deployedContract.json')

let contractAddress;

const deployContract = async () => {
    const ABI = require('../artifacts/contracts/DappCoin.sol/DappCoin.json').abi
    const BYTECODE = require('../artifacts/contracts/DappCoin.sol/DappCoin.json').bytecode

    if (fs.existsSync(contractAddressFile)) {
        const data = fs.readFileSync(contractAddressFile, 'utf-8').trim()
            ? JSON.parse(fs.readFileSync(contractAddressFile, 'utf-8'))
            : fs.readFileSync(contractAddressFile, 'utf-8')

        if (data.contractAddress) {
            console.log('Contract already deployed at:', data.contractAddress)

            return data.contractAddress
        }
    }

    const factory = new ethers.ContractFactory(ABI, BYTECODE, wallet);
    const contract = await factory.deploy(100000000000000000000000n)

    console.log('Contract deployed to:', contract.target)

    contractAddress = contract.target

    fs.writeFileSync(contractAddressFile, JSON.stringify({ contractAddress }), 'utf-8')

    return contractAddress
}


const getContract = async () => {
    const ABI = require('../artifacts/contracts/DappCoin.sol/DappCoin.json').abi
    let contractAddress;

    try {
        const fileContent = fs.readFileSync(contractAddressFile, 'utf-8');
        if (fileContent.trim().length > 0) {
            const parseData = JSON.parse(fileContent)
            contractAddress = parseData.contractAddress
        }

        if (!contractAddress) {
            throw new Error('No contract addres found in the file')
        }

        return new ethers.Contract(contractAddress, ABI, wallet)
    } catch (error) {
        console.error('Error reading contract address:', error.message)
        throw error;
    }
}

module.exports = {
    getContract,
    deployContract
}