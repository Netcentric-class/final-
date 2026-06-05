const mongoose = require('mongoose');

const borrowTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    returnDate: {
      type: Date,
      default: null
    },
    returned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BorrowTransaction', borrowTransactionSchema);