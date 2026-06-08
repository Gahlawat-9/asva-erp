require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function run() {

  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash("purchase123", 10);

  const exists = await User.findOne({
    username: "purchase",
  });

  if (exists) {
    console.log("Purchase user already exists");
    process.exit();
  }

  await User.create({
    username: "purchase",
    password: hashed,
    displayName: "Purchase Manager",
    company: "ASVA",
    role: "purchase",
    modules: ["purchase"],
  });

  console.log("Purchase user created");

  process.exit();
}

run();