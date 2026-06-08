require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const hashed = await bcrypt.hash(
    "admin",
    10
  );

  await User.create({
    username: "admin",
    password: hashed,
    displayName: "Administrator",
    company: "ASVA",
    role: "admin",
    modules: ["all"],
  });

  console.log("Admin created");

  process.exit();
}

run();