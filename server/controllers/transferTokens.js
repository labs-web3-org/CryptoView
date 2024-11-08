const TokenTransaction = require('../models/tokenTransactionsModel')
const { getContract } = require('../utils/web3')
const { ethers, MulticoinProviderPlugin } = require('ethers')

const transferTokens = async (req, res) => {
    try {

        const { from, to, amount } = req.body

        if (!ethers.isAddress(from)) {
            return res.status(400).json({ success: false, message: 'Incvalid Address' })
        }

        if (!ethers.isAddress(to)) {
            return res.status(400).json({ success: false, message: 'Incvalid Address' })
        }
        const contract = await getContract()

        const fromBalanceBefore = await contract.balanceOf(from)
        const toBalanceBefore = await contract.balanceOf(to)

        console.log(`The client sender current have: ${ethers.formatUnits(fromBalanceBefore, 18)} DC \n`)
        console.log(`The client recipient current have: ${ethers.formatUnits(toBalanceBefore, 18)} DC \n`)


        const amountInUnits = ethers.parseUnits(amount, 18);

        const tx = await contract.transfer(to, amountInUnits)
        await tx.wait()

        const fromBalanceAfter = await contract.balanceOf(from)
        const toBalanceAfter = await contract.balanceOf(to)

        console.log(`The client sender now have: ${ethers.formatUnits(fromBalanceAfter, 18)} DC \n`)
        console.log(`The client recipient now have: ${ethers.formatUnits(toBalanceAfter, 18)} DC \n`)

        await TokenTransaction.create({
            from, to, amount, transactionHash: tx.hash
        })

        res.status(200).json({ success: true, txHash: tx.hash })
    } catch (error) {

        console.error('Transaction error:', error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { transferTokens }