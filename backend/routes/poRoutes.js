const express = require("express");
const PurchaseOrder = require("../models/PurchaseOrder");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({
      createdAt: -1,
    });

    res.json(pos);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const po = await PurchaseOrder.create(
      req.body
    );

    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;