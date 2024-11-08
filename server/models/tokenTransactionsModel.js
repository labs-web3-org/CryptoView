
const { Schema, model } = require('mongoose')

const tokenTransactionSchema = new Schema({
    from: String,
    to: String,
    amount: String,
    transactionHash: String,
    timestamp: {
        type: Date, default: Date.now
    }
})

module.exports = model('TokenTransaction', tokenTransactionSchema)