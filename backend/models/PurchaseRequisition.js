const mongoose = require("mongoose");

const PRItemSchema = new mongoose.Schema({
  itemCode: String,
  itemName: String,
  quantity: String,
  unit: String,
  remarks: String,
  earliest: String,
  latest: String,
  rate: String,
});

const PurchaseRequisitionSchema = new mongoose.Schema(
  {
    prNo: String,
    date: String,
    dept: String,
    indenter: String,
    closed: String,

    items: [PRItemSchema],

    remarksCond: String,

    status: {
      type: String,
      default: "pending",
    },

    approvedBy: String,
    approvedAt: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PurchaseRequisition",
  PurchaseRequisitionSchema
);