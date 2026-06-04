const mongoose = require("mongoose");

const borrowTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },

    borrowedAt: {
      type: Date,
      default: Date.now,
      required: true
    },

    returnedAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["borrowed", "returned"],
      default: "borrowed",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "BorrowTransaction",
  borrowTransactionSchema
);