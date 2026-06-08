const mongoose = require("mongoose");

const MRRItemSchema = new mongoose.Schema({
  itemCode: String,
  itemName: String,
  orderedQty: String,
  receivedQty: String,
  acceptedQty: String,
  rejectedQty: String,
  unit: String,
  remarks: String,
});

const MRRSchema = new mongoose.Schema(
{
  mrrNo: String,

  date: String,

  vendor: String,

  poNo: String,

  receivedBy: String,

  status: {
    type: String,
    default: "pending",
  },

  items: [MRRItemSchema],

  remarks: String,
},
{
  timestamps: true,
}
);

module.exports = mongoose.model(
  "MRR",
  MRRSchema
);