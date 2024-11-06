const NftMetaDataSchema = require("../models/nftMetaDataModal.js");
const TransactionSchema = require("../models/transactionModal.js");
const dotenv = require("dotenv");
dotenv.config();

let API_kEY = process.env.API_kEY;
let PROJECT_ID = process.env.PROJECT_ID;

// Initialize Web3 using the HttpProvider
const { Web3 } = require("web3");
const { default: axios } = require("axios");
const { tokenABI, tokenURIABI } = require("../lib/utils.js");

const web3 = new Web3(
  new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${PROJECT_ID}`)
);
const getNftData = async (req, res) => {
  const { contractAddress, tokenID } = req.body;

  try {
    if (!contractAddress) {
      throw { message: "contractAddress is required" };
    }

    if (!tokenID) {
      throw { message: "tokenID is required" };
    }
    let findIsAlreadyExist = {};
    findIsAlreadyExist = await NftMetaDataSchema.findOne({
      tokenId: tokenID,
      contractAddress: contractAddress,
    }).lean();

    if (findIsAlreadyExist) {
      return res.status(200).json({ data: findIsAlreadyExist });
    }
    const contract = new web3.eth.Contract(tokenURIABI, contractAddress);
    const result = await contract.methods.tokenURI(tokenID).call();
    if (!result) {
      throw { message: "Token URI not found" };
    }

    url = result;
    if (result?.startsWith("ipfs")) {
      let getHash = result.split("ipfs://");
      url = `https://ipfs.io/ipfs/${getHash[1]}`;
    }
    let finalData = await axios.get(url);

    let finalMetaData = finalData.data;
    const nftMetaData = new NftMetaDataSchema({
      name: finalMetaData?.name || "",
      description: finalMetaData?.description || "",
      image: finalMetaData?.image || "",
      tokenId: tokenID,
      contractAddress: contractAddress,
    });

    findIsAlreadyExist = await nftMetaData.save();
    res.status(200).json({ data: findIsAlreadyExist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const {
      cryptocurrencyAddress,
      page = 1,
      offset = 5,
      sort = "desc",
    } = req.body;

    if (!cryptocurrencyAddress) {
      throw { message: "cryptocurrencyAddress  is required" };
    }
    let finalData = await axios.get(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${cryptocurrencyAddress}&page=${page}&offset=${offset}&sort=${sort}&apikey=${API_kEY}`
    );

    let finalResData = finalData?.data;
    let result = finalResData?.result;

    if (result && result.length > 0) {
      // check for not insert duplicate entry based on hash
      const bulkOps = result.map((tx) => {
        return {
          updateOne: {
            filter: { hash: tx.hash },
            update: { $setOnInsert: { ...tx, cryptocurrencyAddress } },
            upsert: true,
          },
        };
      });

      await TransactionSchema.bulkWrite(bulkOps);
    }

    res.status(200).json({ data: finalResData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactionsSearch = async (req, res) => {
  try {
    const {
      cryptocurrencyAddress,
      page = 1,
      offset = 5,
      sort = "desc",
      startDate = null,
      endDate = null,
    } = req.body;

    if (!cryptocurrencyAddress) {
      throw { message: "cryptocurrencyAddress is required" };
    }
    if (!startDate || !endDate) {
      throw { message: "startDate and endDate are required" };
    }

    // Convert startDate and endDate to timestamps if not already in that format
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;

    const skip = (page - 1) * offset;

    const totalTransactions = await TransactionSchema.countDocuments({
      cryptocurrencyAddress: cryptocurrencyAddress,
      timeStamp: {
        $gte: startTimestamp,
        $lte: endTimestamp,
      },
    });

    let result = await TransactionSchema.find({
      cryptocurrencyAddress: cryptocurrencyAddress,
      timeStamp: {
        $gte: startTimestamp,
        $lte: endTimestamp,
      },
    })
      .sort({ timeStamp: sort === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(offset)
      .lean();

    let finalResData = {
      status: "1",
      message: "OK",
      totalTransactions: totalTransactions,
      currentPage: page,
      totalPages: Math.ceil(totalTransactions / offset),
      result: result,
    };

    // Send response
    res.status(200).json({ data: finalResData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const { cryptocurrencyAddress, walletAddress } = req.body;

    if (!cryptocurrencyAddress) {
      throw { message: "cryptocurrencyAddress is required" };
    }
    if (!walletAddress) {
      throw { message: "walletAddress is required" };
    }

    const tokenContract = cryptocurrencyAddress;
    const tokenHolder = walletAddress;
    const contract = new web3.eth.Contract(tokenABI, tokenContract);

    let decimalRes = await contract.methods.decimals(tokenHolder).call();
    let balanceRes = await contract.methods.balanceOf(tokenHolder).call();
    let balanceString = balanceRes?.toString();
    let decimalString = decimalRes?.toString();
    const balance = (balanceString / 10 ** Number(decimalString)).toFixed(
      Number(decimalString)
    );
    res.status(200).json({ data: { balance } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getNftData,
  getTransactions,
  getTokenBalance,
  getTransactionsSearch,
};
