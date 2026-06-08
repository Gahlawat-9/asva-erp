const express = require("express");
const router = express.Router();

const Issue = require("../models/Issue");
const Stock = require("../models/Stock");
const StockLedger = require("../models/StockLedger");

router.get("/", async (req, res) => {
  const issues = await Issue.find().sort({
    createdAt: -1,
  });

  res.json(issues);
});

router.post("/", async (req, res) => {
  const issue = await Issue.create(req.body);

  res.status(201).json(issue);
});

router.put("/:id/complete", async (req, res) => {

  const issue = await Issue.findById(
    req.params.id
  );

  if (!issue) {
    return res.status(404).json({
      message: "Issue not found",
    });
  }

  if (issue.status === "completed") {
    return res.status(400).json({
      message: "Already completed",
    });
  }

  for (const item of issue.items) {

    const qty = Number(item.issueQty);

    const stock = await Stock.findOne({
      itemCode: item.itemCode,
    });

    if (!stock) {
      return res.status(400).json({
        message: `${item.itemName} not found`,
      });
    }

    if (stock.currentStock < qty) {
      return res.status(400).json({
        message:
          "Insufficient stock for " +
          item.itemName,
      });
    }

    stock.currentStock -= qty;

    await stock.save();

    await StockLedger.create({
      date: issue.date,

      itemCode: item.itemCode,

      itemName: item.itemName,

      transactionType: "ISSUE",

      qty: -qty,

      balanceAfter: stock.currentStock,

      referenceNo: issue.issueNo,

      remarks:
        "Issued to " +
        issue.department,
    });
  }

  issue.status = "completed";

  await issue.save();

  res.json(issue);
});

module.exports = router;