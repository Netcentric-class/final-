const Book = require('../models/Book');

async function getBooks(req, res) {
  try {
    const filter = {};

    if (req.query.genre) {
      filter.genre = new RegExp(req.query.genre, 'i');
    }

    if (req.query.author) {
      filter.authors = new RegExp(req.query.author, 'i');
    }

    if (req.query.year) {
      filter.year = Number(req.query.year);
    }

    if (req.query.available === 'true') {
      filter.quantity = { $gt: 0 };
    }

    if (req.query.name) {
      filter.name = new RegExp(req.query.name, 'i');
    }

    const books = await Book.find(filter).sort({ name: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Could not get books. Please try again.' });
  }
}

async function getBookById(req, res) {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: 'Invalid book ID.' });
  }
}

async function createBook(req, res) {
  try {
    const { name, year, genre, authors, actualCount, quantity } = req.body;

    if (!name || !year || !genre || !authors || actualCount === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Please provide all required book fields.' });
    }

    if (quantity > actualCount) {
      return res.status(400).json({ message: 'Available quantity cannot be greater than the actual count.' });
    }

    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not create book.' });
  }
}

async function updateBook(req, res) {
  try {
    if (req.body.quantity !== undefined && req.body.actualCount !== undefined) {
      if (req.body.quantity > req.body.actualCount) {
        return res.status(400).json({ message: 'Available quantity cannot be greater than the actual count.' });
      }
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Could not update book.' });
  }
}

async function deleteBook(req, res) {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json({ message: 'Book deleted successfully.', book });
  } catch (error) {
    res.status(400).json({ message: 'Could not delete book.' });
  }
}

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};