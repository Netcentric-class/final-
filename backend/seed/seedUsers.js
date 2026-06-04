require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const connectDB = require("../config/db");

async function seedUsers() {
  try {
    await connectDB();

    const users = [];

    for (let i = 1; i <= 5; i++) {
      const passwordHash = await bcrypt.hash(
        `password${i}`,
        10
      );

      users.push({
        username: `user${i}`,
        passwordHash,
        role: "user"
      });
    }

    await User.deleteMany({
      role: "user"
    });

    await User.insertMany(users);

    console.log("Seeded 5 users");

    console.log("user1 / password1");
    console.log("user2 / password2");
    console.log("user3 / password3");
    console.log("user4 / password4");
    console.log("user5 / password5");
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers();