const BorrowTransaction = require('../models/BorrowTransaction');

async function getAllBorrowedBooks(req, res) {
  try {
    const transactions = await BorrowTransaction.find({ returned: false })
      .populate('user', 'username role')
      .populate('book')
      .sort({ borrowDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Could not get borrowed books report.' });
  }
}

async function getUsersWhoBorrowedBooks(req, res) {
  try {
    const transactions = await BorrowTransaction.find()
      .populate('user', 'username role')
      .populate('book')
      .sort({ borrowDate: -1 });

    const report = {};

    transactions.forEach((transaction) => {
      if (!transaction.user) return;

      const userId = transaction.user._id.toString();

      if (!report[userId]) {
        report[userId] = {
          userId,
          username: transaction.user.username,
          borrowedBooks: []
        };
      }

      report[userId].borrowedBooks.push({
        transactionId: transaction._id,
        bookName: transaction.book ? transaction.book.name : 'Deleted book',
        borrowDate: transaction.borrowDate,
        returnDate: transaction.returnDate,
        returned: transaction.returned
      });
    });

    res.json(Object.values(report));
  } catch (error) {
    res.status(500).json({ message: 'Could not get users report.' });
  }
}

module.exports = {
  getAllBorrowedBooks,
  getUsersWhoBorrowedBooks
};