require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');
const connectDB = require('../config/db');

const genres = ['Fantasy', 'Science Fiction', 'Mystery', 'History', 'Biography', 'Technology', 'Romance', 'Horror'];
const authors = [
  'James Carter',
  'Maria Lewis',
  'David Brooks',
  'Sophia Adams',
  'Daniel Green',
  'Linda Scott',
  'Michael Turner',
  'Grace Walker'
];

const bookNames = [
  'The Silent Library',
  'Code of Tomorrow',
  'Shadows in the Hall',
  'The Last Archive',
  'Journey Through Time',
  'Digital Dreams',
  'The Forgotten Map',
  'Beyond the River',
  'The Hidden Chapter',
  'Learning the Future'
];

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function makeBook(index) {
  const actualCount = Math.floor(Math.random() * 8) + 2;
  const quantity = Math.floor(Math.random() * (actualCount + 1));

  return {
    name: `${pick(bookNames)} ${index}`,
    year: 1980 + (index % 45),
    genre: pick(genres),
    authors: [pick(authors)],
    actualCount,
    quantity
  };
}

async function seedBooks() {
  try {
    await connectDB();

    await Book.deleteMany({});

    const books = [];

    for (let i = 1; i <= 100; i++) {
      books.push(makeBook(i));
    }

    await Book.insertMany(books);

    console.log('Inserted 100 book records');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedBooks();