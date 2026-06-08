const mongoose = require("mongoose");

const POItemSchema = new mongoose.Schema({
  itemCode: String,
  itemName: String,
  quantity: String,
  unit: String,
  rate: String,
});

const PurchaseOrderSchema = new mongoose.Schema(
  {
    poNo: String,

    prId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequisition",
    },

    vendor: String,

    items: [POItemSchema],

    status: {
      type: String,
      default: "open",
    },

    createdBy: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PurchaseOrder",
  PurchaseOrderSchema
);