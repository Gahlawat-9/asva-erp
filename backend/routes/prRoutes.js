const express = require("express");
const PurchaseRequisition = require("../models/PurchaseRequisition");

const router = express.Router();

/*
GET ALL PRs
*/
router.get("/", async (req, res) => {
  try {
    const prs = await PurchaseRequisition.find().sort({
      createdAt: -1,
    });

    res.json(prs);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.get("/approved", async (req, res) => {
  try {
    const prs = await PurchaseRequisition.find({
      status: "approved",
    });

    res.json(prs);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
GET SINGLE PR
*/
router.get("/:id", async (req, res) => {
  try {
    const pr = await PurchaseRequisition.findById(
      req.params.id
    );

    if (!pr) {
      return res.status(404).json({
        message: "PR not found",
      });
    }

    res.json(pr);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
CREATE PR
*/
router.post("/", async (req, res) => {
  try {
    const pr = await PurchaseRequisition.create(
      req.body
    );

    res.status(201).json(pr);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
UPDATE PR
*/
router.put("/:id", async (req, res) => {
  try {
    const pr =
      await PurchaseRequisition.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!pr) {
      return res.status(404).json({
        message: "PR not found",
      });
    }

    res.json(pr);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
DELETE PR
*/
router.delete("/:id", async (req, res) => {
  try {
    const pr =
      await PurchaseRequisition.findByIdAndDelete(
        req.params.id
      );

    if (!pr) {
      return res.status(404).json({
        message: "PR not found",
      });
    }

    res.json({
      message: "PR deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.put("/:id/approve", async (req, res) => {
  try {
    const pr =
      await PurchaseRequisition.findByIdAndUpdate(
        req.params.id,
        {
          status: "approved",
          approvedBy: req.body.approvedBy,
          approvedAt: new Date(),
        },
        {
          new: true,
        }
      );

    if (!pr) {
      return res.status(404).json({
        message: "PR not found",
      });
    }

    res.json(pr);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;