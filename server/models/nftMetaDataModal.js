const mongoose = require("mongoose");
const { Schema } = mongoose;

const NftMetaDataSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    contractAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NftMetaData", NftMetaDataSchema);
