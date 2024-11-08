const express = require("express");
const { handleGetFile, handleUpload } = require("../controllers/storageController");
const multer = require('multer')
const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/upload', upload.single('file'), handleUpload)

router.get('/file/:hash', handleGetFile)

module.exports = router