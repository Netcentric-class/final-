const Book = require('../models/Book');
const BorrowTransaction = require('../models/BorrowTransaction');

async function borrowBook(req, res) {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (book.quantity <= 0) {
      return res.status(400).json({ message: 'No copies available.' });
    }

    const alreadyBorrowed = await BorrowTransaction.findOne({
      user: req.user.id,
      book: book._id,
      returned: false
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'You already borrowed this book. Please return it before borrowing it again.' });
    }

    book.quantity -= 1;
    await book.save();

    const transaction = await BorrowTransaction.create({
      user: req.user.id,
      book: book._id
    });

    const populatedTransaction = await BorrowTransaction.findById(transaction._id)
      .populate('user', 'username role')
      .populate('book');

    res.status(201).json({
      message: 'Book borrowed successfully.',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(400).json({ message: 'Could not borrow book.' });
  }
}

async function returnBook(req, res) {
  try {
    const transaction = await BorrowTransaction.findById(req.params.transactionId).populate('book');

    if (!transaction) {
      return res.status(404).json({ message: 'Borrowing transaction not found.' });
    }

    if (transaction.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only return your own borrowed books.' });
    }

    if (transaction.returned) {
      return res.status(400).json({ message: 'This book was already returned.' });
    }

    transaction.returned = true;
    transaction.returnDate = new Date();
    await transaction.save();

    const book = await Book.findById(transaction.book._id);
    book.quantity += 1;
    await book.save();

    const updatedTransaction = await BorrowTransaction.findById(transaction._id)
      .populate('user', 'username role')
      .populate('book');

    res.json({
      message: 'Book returned successfully.',
      transaction: updatedTransaction
    });
  } catch (error) {
    res.status(400).json({ message: 'Could not return book.' });
  }
}

async function getMyBorrowedBooks(req, res) {
  try {
    const transactions = await BorrowTransaction.find({
      user: req.user.id,
      returned: false
    })
      .populate('book')
      .sort({ borrowDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Could not get your borrowed books.' });
  }
}

module.exports = {
  borrowBook,
  returnBook,
  getMyBorrowedBooks
};