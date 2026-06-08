const express = require("express");
const StockLedger = require("../models/StockLedger");

const router = express.Router();

// GET ALL LEDGER ENTRIES

router.get("/", async (req, res) => {
  try {

    const ledger =
      await StockLedger.find().sort({
        createdAt: -1,
      });

    res.json(ledger);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});

// CREATE LEDGER ENTRY

router.post("/", async (req, res) => {

  try {

    const entry =
      await StockLedger.create(req.body);

    res.status(201).json(entry);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }

});

module.exports = router;