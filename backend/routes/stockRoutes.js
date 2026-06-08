const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");

// GET ALL
router.get("/", async (req, res) => {
  const stock = await Stock.find().sort({ itemName: 1 });
  res.json(stock);
});

// UPSERT
router.post("/upsert", async (req, res) => {
  try {
    const data = req.body;

    let existing = await Stock.findOne({ itemCode: data.itemCode });

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return res.json(existing);
    }

    const created = await Stock.create(data);
    res.json(created);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Stock.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;