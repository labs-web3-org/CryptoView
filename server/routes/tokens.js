const express = require("express");
const router = express.Router();

const { transferTokens } = require('../controllers/transferTokens')

router.post('/transfer', transferTokens)

module.exports = router