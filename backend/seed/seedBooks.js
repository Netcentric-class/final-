require("dotenv").config();

const mongoose = require("mongoose");

const Book = require("../models/Book");
const connectDB = require("../config/db");

const genres = [
  "Fantasy",
  "Science Fiction",
  "History",
  "Biography",
  "Mystery",
  "Programming",
  "Business"
];

const authors = [
  "J.R.R. Tolkien",
  "George Orwell",
  "Isaac Asimov",
  "Walter Isaacson",
  "Robert Martin",
  "Agatha Christie",
  "Stephen King",
  "Yuval Noah Harari",
  "James Clear",
  "Andrew Hunt",
  "David Thomas",
  "Mark Twain"
];

const titlePrefixes = [
  "The Lost",
  "The Hidden",
  "The Great",
  "The Final",
  "The Modern",
  "The Ultimate",
  "The Practical"
];

const titleSuffixes = [
  "Journey",
  "Empire",
  "Code",
  "Mystery",
  "Adventure",
  "Guide",
  "Library"
];

function pick(array) {
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

function randomInt(min, max) {
  return (
    Math.floor(
      Math.random() * (max - min + 1)
    ) + min
  );
}

function makeBook(index) {
  const actualCount = randomInt(1, 20);

  const quantity =
    Math.random() < 0.15
      ? 0
      : randomInt(0, actualCount);

  return {
    name: `${pick(titlePrefixes)} ${pick(
      titleSuffixes
    )} ${index}`,

    year: randomInt(1950, 2025),

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

    console.log(
      "Inserted 100 books successfully."
    );
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedBooks();