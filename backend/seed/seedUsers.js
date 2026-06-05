require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedUsers() {
  try {
    await connectDB();

    const users = [];

    for (let i = 1; i <= 5; i++) {
      const passwordHash = await bcrypt.hash(`user${i}pass1`, 10);

      users.push({
        username: `user${i}`,
        passwordHash,
        role: 'user'
      });
    }

    await User.deleteMany({ role: 'user', username: /^user/ });
    await User.insertMany(users);

    console.log('Seeded 5 users');
    console.log('Example login: user1 / user1pass1');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers();