const { Schema, model } = require('mongoose')


const storageSchema = new Schema({
    ipfsHash: String,
    filename: String,
    uploadDate: { type: Date, default: Date.now }
})


module.exports = model('Storage', storageSchema)