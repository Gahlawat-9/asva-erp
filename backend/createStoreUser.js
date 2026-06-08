require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function run() {

  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash("store123", 10);

  const exists = await User.findOne({
    username: "store",
  });

  if (exists) {
    console.log("Store user already exists");
    process.exit();
  }

  await User.create({
    username: "store",
    password: hashed,
    displayName: "Store Manager",
    company: "ASVA",
    role: "store",
    modules: ["inventory"],
  });

  console.log("Store user created");

  process.exit();
}

run();