const express = require("express");
const { getBalanceFromWallet } = require("../controllers/tokenController");
const router = express.Router();

router.get('/balance', getBalanceFromWallet)

module.exports = router