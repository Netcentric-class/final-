const express = require('express');
const router = express.Router();

const {
  borrowBook,
  returnBook,
  getMyBorrowedBooks
} = require('../controllers/transactionController');

const protect = require('../middleware/authMiddleware');

router.get('/my-books', protect, getMyBorrowedBooks);
router.post('/borrow/:bookId', protect, borrowBook);
router.post('/return/:transactionId', protect, returnBook);

module.exports = router;