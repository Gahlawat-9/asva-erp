const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
{
  itemCode: {
    type: String,
    unique: true,
  },

  itemName: String,

  unit: String,

  category: String,

  currentStock: {
    type: Number,
    default: 0,
  },

  minStock: {
    type: Number,
    default: 0,
  },
},
{
  timestamps: true,
}
);

module.exports = mongoose.model(
  "Stock",
  StockSchema
);