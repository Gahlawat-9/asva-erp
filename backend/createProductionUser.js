require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function run() {

  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash("production123", 10);

  const exists = await User.findOne({
    username: "production",
  });

  if (exists) {
    console.log("Production user already exists");
    process.exit();
  }

  await User.create({
    username: "production",
    password: hashed,
    displayName: "Production Manager",
    company: "ASVA",
    role: "production",
    modules: ["manufacturing"],
  });

  console.log("Production user created");

  process.exit();
}

run();