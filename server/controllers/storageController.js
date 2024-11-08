require('dotenv').config()
const { PinataSDK } = require('pinata-web3')
const storageModel = require('../models/storageModel')


const handleGetFile = async (req, res) => {
    const { PINATA_JWT, PINATA_GATEAWAY } = process.env

    const pinata = new PinataSDK({
        pinataJwt: PINATA_JWT,
        pinataGateway: PINATA_GATEAWAY
    })

    try {

        const { hash } = req.params
        const url = await pinata.gateways.convert(hash)

        res.status(200).json({ success: true, url })

    } catch (error) {
        res.status(500).json({ success: false, message: 'Filed to get the file' })
    }
}

const handleUpload = async (req, res) => {
    const { PINATA_JWT, PINATA_GATEAWAY } = process.env

    const pinata = new PinataSDK({
        pinataJwt: PINATA_JWT,
        pinataGateway: PINATA_GATEAWAY
    })
    console.log(PINATA_JWT, PINATA_GATEAWAY)
    try {

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' })
        }

        const blob = new Blob([req.file.buffer], { type: req.file.mimetype })

        const file = new File([blob], req.file.originalname, { type: req.file.mimetype })

        const uploadedFile = await pinata.upload.file(file)

        const data = await storageModel.create({
            ipfsHash: uploadedFile.IpfsHash,
            filename: req.file.originalname,
        })

        res.status(200).json({ success: true, message: 'File uploaded successfully', data })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Filed to upload' })
    }
}

module.exports = {
    handleGetFile,
    handleUpload
}