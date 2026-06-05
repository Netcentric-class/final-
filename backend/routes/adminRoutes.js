const express = require('express');
const router = express.Router();

const {
  getAllBorrowedBooks,
  getUsersWhoBorrowedBooks
} = require('../controllers/adminController');

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

router.get('/borrowed-books', protect, adminOnly, getAllBorrowedBooks);
router.get('/borrowers', protect, adminOnly, getUsersWhoBorrowedBooks);

module.exports = router;