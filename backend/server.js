require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const prRoutes = require("./routes/prRoutes");
const poRoutes = require("./routes/poRoutes");
const mrrRoutes = require("./routes/mrrRoutes");
const stockRoutes = require("./routes/stockRoutes");
const stockLedgerRoutes = require("./routes/stockLedgerRoutes");
const issueRoutes = require("./routes/issueRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/pr", prRoutes);
app.use("/api/po", poRoutes);
app.use("/api/mrr", mrrRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/stockledger", stockLedgerRoutes);
app.use("/api/issues", issueRoutes);
app.get("/", (req, res) => {
  res.send("ASVA ERP Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});