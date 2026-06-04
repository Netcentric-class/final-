const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: Number,
      required: true,
      min: 0
    },

    genre: {
      type: String,
      required: true,
      trim: true
    },

    authors: [
      {
        type: String,
        required: true,
        trim: true
      }
    ],

    actualCount: {
      type: Number,
      required: true,
      min: 0
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.actualCount;
        },
        message: "Available quantity cannot exceed total copies owned."
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Book", bookSchema);