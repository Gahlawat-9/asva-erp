const mongoose = require("mongoose");

const StockLedgerSchema = new mongoose.Schema(
{
  date: String,

  itemCode: String,

  itemName: String,

  transactionType: String,

  qty: Number,

  balanceAfter: Number,

  referenceNo: String,

  remarks: String,
},
{
  timestamps: true,
}
);

module.exports = mongoose.model(
  "StockLedger",
  StockLedgerSchema
);