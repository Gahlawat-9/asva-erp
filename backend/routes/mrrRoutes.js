const express = require("express");

const router = express.Router();

const MRR = require("../models/MRR");
const Stock = require("../models/Stock");
const StockLedger = require("../models/StockLedger");

router.get("/", async (req, res) => {

  const mrrs = await MRR.find().sort({
    createdAt: -1,
  });

  res.json(mrrs);

});

router.post("/", async (req, res) => {

  const mrr = await MRR.create(req.body);

  res.status(201).json(mrr);

});

router.put("/:id/complete", async (req, res) => {

  const mrr = await MRR.findById(req.params.id);

  if (!mrr) {
    return res.status(404).json({
      message: "MRR not found",
    });
  }

  if (mrr.status === "completed") {
    return res.status(400).json({
      message: "Already completed",
    });
  }

  for (const item of mrr.items) {

    const qty = parseFloat(item.acceptedQty);

if (isNaN(qty)) {
  console.log("Invalid qty skipped:", item);
  continue;
}

    let stock = await Stock.findOne({
      itemCode: item.itemCode,
    });

    if (stock) {

      stock.currentStock += qty;

      await stock.save();

    } else {

      stock = await Stock.create({
        itemCode: item.itemCode,
        itemName: item.itemName,
        unit: item.unit,
        category: "RAW MATERIAL",
        currentStock: qty,
        minStock: 0,
      });

    }

    await StockLedger.create({

      date: mrr.date,

      itemCode: item.itemCode,

      itemName: item.itemName,

      transactionType: "MRR",

      qty,

      balanceAfter: stock.currentStock,

      referenceNo: mrr.mrrNo,

      remarks: "Material Receipt",
    });

  }

  mrr.status = "completed";

  await mrr.save();

  res.json(mrr);

});

module.exports = router;