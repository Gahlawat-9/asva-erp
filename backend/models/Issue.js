const mongoose = require("mongoose");

const IssueItemSchema = new mongoose.Schema({
  itemCode: String,
  itemName: String,
  availableStock: Number,
  issueQty: Number,
  unit: String,
});

const IssueSchema = new mongoose.Schema(
  {
    issueNo: String,
    date: String,
    department: String,
    issuedBy: String,

    status: {
      type: String,
      default: "pending",
    },

    items: [IssueItemSchema],

    remarks: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Issue",
  IssueSchema
);