# Library Management System Final Project

## Netcentric Computing Final Project: Node + Express + MongoDB + React + Bootstrap + Heroku

In this project you will build a full-stack web application for managing a library.

The application will use:

- Node.js
- Express
- MongoDB
- Mongoose
- React with Vite
- Bootstrap
- JSON Web Tokens for authentication
- Docker Compose for local development
- MongoDB Atlas for production data
- Heroku for deployment
- GitHub for source control

The app will manage three main data models:

- `Book`
- `User`
- `BorrowTransaction`

Each book has:

```text
name
year
genre
[authors]
actualCount
quantity
```

The app will also include:

- A seeded admin user
- 5 seeded regular users
- At least 100 seeded books
- User registration
- Login and logout
- Password change
- Admin-only book creation
- Admin-only book modification
- Admin-only book deletion
- Book browsing
- Book filtering
- Borrowing books
- Returning books
- Admin report of all borrowed books
- Admin report of all users who borrowed books
- A React frontend with Bootstrap

---

# Phase 0: Create the GitHub Repository

## 0.1 Create the repository on GitHub

Go to GitHub and create a new repository.

Suggested repository name:

```text
library-management-system
```

When creating the repository, select these options:

- Add a `README.md`
- Add `.gitignore`
- Select the `Node` template for `.gitignore`
- Choose Public or Private depending on your instructor's directions

Do not add a license unless your instructor tells you to.

## 0.2 Clone the repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/library-management-system.git
cd library-management-system
code .
```

---

# Phase 1: Project Structure and Dev Container Files

## 1.1 Create the project folders

From the root of the repository, run:

```bash
mkdir backend frontend
mkdir .devcontainer
```

Your project should now look like this:

```text
library-management-system/
  README.md
  .gitignore
  backend/
  frontend/
  .devcontainer/
```

## 1.2 Create `docker-compose.yml`

Create a file named `docker-compose.yml` in the root of the project.

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: library_backend
    ports:
      - "3000:3000"
    volumes:
      - .:/workspaces/library-management-system
    working_dir: /workspaces/library-management-system/backend
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGO_URL=mongodb://db:27017/library_management
      - JWT_SECRET=YOUR_OWN_SECRET_HERE
    depends_on:
      - db
    command: sleep infinity
    stdin_open: true
    tty: true

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: library_frontend
    ports:
      - "5173:5173"
    volumes:
      - .:/workspaces/library-management-system
    working_dir: /workspaces/library-management-system/frontend
    environment:
      - VITE_API_URL=http://localhost:3000/api
    depends_on:
      - backend
    command: sleep infinity
    stdin_open: true
    tty: true

  db:
    image: mongo:7
    container_name: library_db
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 1.3 Create `.devcontainer/devcontainer.json`

Create `.devcontainer/devcontainer.json`.

```json
{
  "name": "Library Management System",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "backend",
  "workspaceFolder": "/workspaces/library-management-system",
  "shutdownAction": "stopCompose",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-docker",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

---

# Phase 2: Create the Backend Application

## 2.1 Create the backend `Dockerfile`

Create `backend/Dockerfile`.

```dockerfile
FROM node:20-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" > /etc/apt/sources.list.d/mongodb-org-7.0.list \
    && apt-get update \
    && apt-get install -y vim \
    && apt-get install -y mongodb-mongosh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["sleep", "infinity"]
```

## 2.2 Initialize the backend app

From the project root, run:

```bash
cd backend
npm init -y
```

Install dependencies:

```bash
npm install express mongoose cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon
```

Update `backend/package.json` so that the scripts section looks like this:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed:admin": "node seed/seedAdmin.js",
  "seed:users": "node seed/seedUsers.js",
  "seed:books": "node seed/seedBooks.js"
}
```

## 2.3 Create backend folders

From inside `backend`, run:

```bash
mkdir config models controllers routes middleware seed
```

The backend folder should look like this:

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  seed/
  Dockerfile
  package.json
  server.js
```

## 2.4 Create `server.js`

Create `backend/server.js`.

```js
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

## 2.5 Create `app.js`

Create `backend/app.js`.

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

module.exports = app;
```

## 2.6 Create the database connection

Create `backend/config/db.js`.

```js
const mongoose = require('mongoose');

async function connectDB() {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('Missing MongoDB connection string');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
```

---

# Phase 3: Create the Models

## 3.1 Create the Book model

Create `backend/models/Book.js`.

```js
const mongoose = require('mongoose');

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
    authors: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: 'At least one author is required'
      }
    },
    actualCount: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
```

## 3.2 Create the User model

Create `backend/models/User.js`.

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

## 3.3 Create the BorrowTransaction model

Create `backend/models/BorrowTransaction.js`.

```js
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
```

---

# Phase 4: Create Authentication Middleware

## 4.1 Create `authMiddleware.js`

Create `backend/middleware/authMiddleware.js`.

```js
const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Your login expired or is invalid. Please log in again.' });
  }
}

module.exports = protect;
```

## 4.2 Create `adminMiddleware.js`

Create `backend/middleware/adminMiddleware.js`.

```js
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only an admin can do this action.' });
  }

  next();
}

module.exports = adminOnly;
```

---

# Phase 5: Create Authentication Controller and Routes

## 5.1 Create `authController.js`

Create `backend/controllers/authController.js`.

```js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'That username is already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      role: 'user'
    });

    const token = createToken(user);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not register user. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful.',
      token,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not log in. Please try again.' });
  }
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required.' });
    }

    if (newPassword.length < 6 || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 6 characters and include at least one number.' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not change password. Please try again.' });
  }
}

module.exports = {
  register,
  login,
  changePassword
};
```

## 5.2 Create `authRoutes.js`

Create `backend/routes/authRoutes.js`.

```js
const express = require('express');
const router = express.Router();

const { register, login, changePassword } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);

module.exports = router;
```

---

# Phase 6: Create Book Controller and Routes

## 6.1 Create `bookController.js`

Create `backend/controllers/bookController.js`.

```js
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
```

## 6.2 Create `bookRoutes.js`

Create `backend/routes/bookRoutes.js`.

```js
const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

router.get('/', protect, getBooks);
router.get('/:id', protect, getBookById);
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
```

---

# Phase 7: Create Borrowing Transaction Controller and Routes

## 7.1 Create `transactionController.js`

Create `backend/controllers/transactionController.js`.

```js
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
```

## 7.2 Create `transactionRoutes.js`

Create `backend/routes/transactionRoutes.js`.

```js
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
```

---

# Phase 8: Create Admin Reports

## 8.1 Create `adminController.js`

Create `backend/controllers/adminController.js`.

```js
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
```

## 8.2 Create `adminRoutes.js`

Create `backend/routes/adminRoutes.js`.

```js
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
```

---

# Phase 9: Seed the Database

## 9.1 Create `seedAdmin.js`

Create `backend/seed/seedAdmin.js`.

```js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedAdmin() {
  try {
    await connectDB();

    const username = 'admin';
    const password = 'secret321';
    const passwordHash = await bcrypt.hash(password, 10);

    await User.deleteMany({ username });

    await User.create({
      username,
      passwordHash,
      role: 'admin'
    });

    console.log('Seeded admin: admin / secret321');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedAdmin();
```

## 9.2 Create `seedUsers.js`

Create `backend/seed/seedUsers.js`.

```js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seedUsers() {
  try {
    await connectDB();

    const users = [];

    for (let i = 1; i <= 5; i++) {
      const passwordHash = await bcrypt.hash(`user${i}pass1`, 10);

      users.push({
        username: `user${i}`,
        passwordHash,
        role: 'user'
      });
    }

    await User.deleteMany({ role: 'user', username: /^user/ });
    await User.insertMany(users);

    console.log('Seeded 5 users');
    console.log('Example login: user1 / user1pass1');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedUsers();
```

## 9.3 Create `seedBooks.js`

Create `backend/seed/seedBooks.js`.

```js
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
```

## 9.4 Run the seed scripts

Make sure Docker containers are running.

From the backend container terminal:

```bash
npm run seed:admin
npm run seed:users
npm run seed:books
```

---

# Phase 10: Test the Backend with Postman

## 10.1 Start backend

```bash
npm run dev
```

## 10.2 Health check

```text
GET http://localhost:3000/api/health
```

## 10.3 Register user

```text
POST http://localhost:3000/api/auth/register
```

Body:

```json
{
  "username": "newuser",
  "password": "newpass1"
}
```

## 10.4 Login admin

```text
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "secret321"
}
```

Copy the token.

## 10.5 Get all books

```text
GET http://localhost:3000/api/books
```

Header:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

## 10.6 Filter books

```text
GET http://localhost:3000/api/books?genre=Fantasy
GET http://localhost:3000/api/books?author=James
GET http://localhost:3000/api/books?available=true
GET http://localhost:3000/api/books?name=Library
```

## 10.7 Add book as admin

```text
POST http://localhost:3000/api/books
```

Headers:

```text
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

Body:

```json
{
  "name": "The Great Library",
  "year": 2024,
  "genre": "Technology",
  "authors": ["David Burns"],
  "actualCount": 5,
  "quantity": 5
}
```

## 10.8 Update book as admin

```text
PUT http://localhost:3000/api/books/BOOK_ID_HERE
```

Body:

```json
{
  "name": "The Updated Library Book",
  "year": 2025,
  "genre": "Technology",
  "authors": ["David Burns"],
  "actualCount": 8,
  "quantity": 7
}
```

## 10.9 Delete book as admin

```text
DELETE http://localhost:3000/api/books/BOOK_ID_HERE
```

## 10.10 Borrow book as user

Login as:

```text
user1 / user1pass1
```

Then send:

```text
POST http://localhost:3000/api/transactions/borrow/BOOK_ID_HERE
```

## 10.11 View my borrowed books

```text
GET http://localhost:3000/api/transactions/my-books
```

## 10.12 Return book

```text
POST http://localhost:3000/api/transactions/return/TRANSACTION_ID_HERE
```

## 10.13 Admin borrowed books report

```text
GET http://localhost:3000/api/admin/borrowed-books
```

## 10.14 Admin borrowers report

```text
GET http://localhost:3000/api/admin/borrowers
```

## 10.15 Test no token

Send:

```text
GET http://localhost:3000/api/books
```

without Authorization header.

## 10.16 Test wrong token

Send:

```text
Authorization: Bearer wrongtokenhere
```

---

# Phase 11: Create the React Frontend

## 11.1 Create the frontend app

From the project root:

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install bootstrap
```

## 11.2 Create the frontend Dockerfile

Create `frontend/Dockerfile`.

```dockerfile
FROM node:20-bookworm

WORKDIR /app

COPY . .

EXPOSE 5173

CMD ["sleep", "infinity"]
```

## 11.3 Import Bootstrap

Replace `frontend/src/main.jsx`.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 11.4 Create frontend folders

From inside `frontend/src`, create:

```bash
mkdir pages components
```

---

# Phase 12: Add Frontend API Helper

Create `frontend/src/api.js`.

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function register(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function changePassword(oldPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export async function getBooks(query = '') {
  return request(`/books${query}`);
}

export async function getBookById(id) {
  return request(`/books/${id}`);
}

export async function createBook(book) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(book)
  });
}

export async function updateBook(id, book) {
  return request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book)
  });
}

export async function deleteBook(id) {
  return request(`/books/${id}`, {
    method: 'DELETE'
  });
}

export async function borrowBook(bookId) {
  return request(`/transactions/borrow/${bookId}`, {
    method: 'POST'
  });
}

export async function getMyBorrowedBooks() {
  return request('/transactions/my-books');
}

export async function returnBook(transactionId) {
  return request(`/transactions/return/${transactionId}`, {
    method: 'POST'
  });
}

export async function getBorrowedBooksReport() {
  return request('/admin/borrowed-books');
}

export async function getBorrowersReport() {
  return request('/admin/borrowers');
}
```

---

# Phase 13: Build Frontend Components

## 13.1 Create `AppNavbar.jsx`

Create `frontend/src/components/AppNavbar.jsx`.

```jsx
function AppNavbar({ currentPage, setCurrentPage, onLogout, role }) {
  const userItems = [
    ['browse', 'Browse Books'],
    ['myBooks', 'My Borrowed Books'],
    ['password', 'Change Password']
  ];

  const adminItems = [
    ['manageBooks', 'Manage Books'],
    ['reports', 'Admin Reports']
  ];

  const navItems = role === 'admin' ? [...userItems, ...adminItems] : userItems;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <span className="navbar-brand">Library Management</span>

        <div className="navbar-nav">
          {navItems.map(([key, label]) => (
            <button
              key={key}
              className={`nav-link btn btn-link ${currentPage === key ? 'active' : ''}`}
              onClick={() => setCurrentPage(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="btn btn-outline-light" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AppNavbar;
```

## 13.2 Create `BookForm.jsx`

Create `frontend/src/components/BookForm.jsx`.

```jsx
function BookForm({ form, setForm, onSubmit, buttonText }) {
  function updateField(event) {
    const { name, value } = event.target;

    if (name === 'authors') {
      setForm({
        ...form,
        authors: value.split(',').map((author) => author.trim())
      });
      return;
    }

    setForm({
      ...form,
      [name]: name === 'year' || name === 'actualCount' || name === 'quantity' ? Number(value) : value
    });
  }

  return (
    <form onSubmit={onSubmit} className="card card-body">
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input name="name" className="form-control" value={form.name} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Year</label>
        <input name="year" type="number" className="form-control" value={form.year} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Genre</label>
        <input name="genre" className="form-control" value={form.genre} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Authors</label>
        <input
          name="authors"
          className="form-control"
          value={form.authors.join(', ')}
          onChange={updateField}
          required
        />
        <div className="form-text">Separate multiple authors with commas.</div>
      </div>

      <div className="mb-3">
        <label className="form-label">Actual Count</label>
        <input name="actualCount" type="number" className="form-control" value={form.actualCount} onChange={updateField} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Quantity Available</label>
        <input name="quantity" type="number" className="form-control" value={form.quantity} onChange={updateField} required />
      </div>

      <button className="btn btn-primary" type="submit">{buttonText}</button>
    </form>
  );
}

export default BookForm;
```

## 13.3 Create `BookTable.jsx`

Create `frontend/src/components/BookTable.jsx`.

```jsx
function BookTable({ books, onBorrow }) {
  if (!books.length) {
    return <p>No books found.</p>;
  }

  return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Year</th>
          <th>Genre</th>
          <th>Authors</th>
          <th>Actual Count</th>
          <th>Available</th>
          {onBorrow && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book._id}>
            <td>{book._id}</td>
            <td>{book.name}</td>
            <td>{book.year}</td>
            <td>{book.genre}</td>
            <td>{book.authors.join(', ')}</td>
            <td>{book.actualCount}</td>
            <td>{book.quantity}</td>
            {onBorrow && (
              <td>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => onBorrow(book._id)}
                  disabled={book.quantity <= 0}
                >
                  Borrow
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default BookTable;
```

---

# Phase 14: Build Frontend Pages

## 14.1 Create `LoginPage.jsx`

Create `frontend/src/pages/LoginPage.jsx`.

```jsx
import { useState } from 'react';
import { login } from '../api';

function LoginPage({ onLogin, goToRegister }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('secret321');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      onLogin();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h1 className="mb-4">Library Login</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit">Login</button>
      </form>

      <button className="btn btn-link mt-3" onClick={goToRegister}>
        Register a new account
      </button>
    </div>
  );
}

export default LoginPage;
```

## 14.2 Create `RegisterPage.jsx`

Create `frontend/src/pages/RegisterPage.jsx`.

```jsx
import { useState } from 'react';
import { register } from '../api';

function RegisterPage({ onRegister, goToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const data = await register(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      onRegister();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h1 className="mb-4">Register</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="form-text">Password must be at least 6 characters.</div>
        </div>

        <button className="btn btn-primary" type="submit">Register</button>
      </form>

      <button className="btn btn-link mt-3" onClick={goToLogin}>
        Back to login
      </button>
    </div>
  );
}

export default RegisterPage;
```

## 14.3 Create `BrowseBooksPage.jsx`

Create `frontend/src/pages/BrowseBooksPage.jsx`.

```jsx
import { useEffect, useState } from 'react';
import { getBooks, borrowBook } from '../api';
import BookTable from '../components/BookTable';

function BrowseBooksPage() {
  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState('');
  const [author, setAuthor] = useState('');
  const [name, setName] = useState('');
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadBooks(query = '') {
    setError('');

    try {
      const data = await getBooks(query);
      setBooks(data);
    } catch (error) {
      setBooks([]);
      setError(error.message);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleFilter(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (genre) params.append('genre', genre);
    if (author) params.append('author', author);
    if (name) params.append('name', name);
    if (available) params.append('available', 'true');

    loadBooks(`?${params.toString()}`);
  }

  async function handleBorrow(bookId) {
    setMessage('');
    setError('');

    try {
      await borrowBook(bookId);
      setMessage('Book borrowed successfully.');
      loadBooks();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Browse Books</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleFilter} className="card card-body mb-3">
        <div className="row">
          <div className="col-md-3 mb-3">
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Book name" />
          </div>

          <div className="col-md-3 mb-3">
            <input className="form-control" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" />
          </div>

          <div className="col-md-3 mb-3">
            <input className="form-control" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" />
          </div>

          <div className="col-md-3 mb-3 form-check">
            <input className="form-check-input" type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            <label className="form-check-label">Available only</label>
          </div>
        </div>

        <button className="btn btn-primary" type="submit">Filter Books</button>
      </form>

      <BookTable books={books} onBorrow={handleBorrow} />
    </div>
  );
}

export default BrowseBooksPage;
```

## 14.4 Create `MyBorrowedBooksPage.jsx`

Create `frontend/src/pages/MyBorrowedBooksPage.jsx`.

```jsx
import { useEffect, useState } from 'react';
import { getMyBorrowedBooks, returnBook } from '../api';

function MyBorrowedBooksPage() {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadTransactions() {
    setError('');

    try {
      const data = await getMyBorrowedBooks();
      setTransactions(data);
    } catch (error) {
      setTransactions([]);
      setError(error.message);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function handleReturn(transactionId) {
    setMessage('');
    setError('');

    try {
      await returnBook(transactionId);
      setMessage('Book returned successfully.');
      loadTransactions();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>My Borrowed Books</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!transactions.length ? (
        <p>You have no borrowed books.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Book</th>
              <th>Borrow Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.book?.name}</td>
                <td>{new Date(transaction.borrowDate).toLocaleString()}</td>
                <td>
                  <button className="btn btn-sm btn-warning" onClick={() => handleReturn(transaction._id)}>
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyBorrowedBooksPage;
```

## 14.5 Create `ChangePasswordPage.jsx`

Create `frontend/src/pages/ChangePasswordPage.jsx`.

```jsx
import { useState } from 'react';
import { changePassword } from '../api';

function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await changePassword(oldPassword, newPassword);
      setMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Change Password</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="mb-3">
          <label className="form-label">Old Password</label>
          <input className="form-control" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <div className="form-text">The new password must be at least 6 characters and contain at least one number.</div>
        </div>

        <button className="btn btn-primary" type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ChangePasswordPage;
```

## 14.6 Create `ManageBooksPage.jsx`

Create `frontend/src/pages/ManageBooksPage.jsx`.

```jsx
import { useState } from 'react';
import { createBook, getBookById, updateBook, deleteBook } from '../api';
import BookForm from '../components/BookForm';

const emptyBook = {
  name: '',
  year: 2024,
  genre: '',
  authors: [''],
  actualCount: 1,
  quantity: 1
};

function ManageBooksPage() {
  const [addForm, setAddForm] = useState(emptyBook);
  const [editId, setEditId] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [deleteId, setDeleteId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleAdd(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const book = await createBook(addForm);
      setMessage(`Book created with ID: ${book._id}`);
      setAddForm(emptyBook);
    } catch (error) {
      setError(error.message);
    }
  }

  async function loadBook(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const book = await getBookById(editId);
      setEditForm({
        name: book.name,
        year: book.year,
        genre: book.genre,
        authors: book.authors,
        actualCount: book.actualCount,
        quantity: book.quantity
      });
    } catch (error) {
      setEditForm(null);
      setError(error.message);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateBook(editId, editForm);
      setMessage('Book updated successfully.');
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDelete(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await deleteBook(deleteId);
      setMessage('Book deleted successfully.');
      setDeleteId('');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Manage Books</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <h4>Add Book</h4>
          <BookForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} buttonText="Add Book" />
        </div>

        <div className="col-md-4">
          <h4>Modify Book</h4>
          <form onSubmit={loadBook} className="card card-body mb-3">
            <label className="form-label">Book ID</label>
            <input className="form-control mb-3" value={editId} onChange={(e) => setEditId(e.target.value)} required />
            <button className="btn btn-primary" type="submit">Load Book</button>
          </form>

          {editForm && <BookForm form={editForm} setForm={setEditForm} onSubmit={handleUpdate} buttonText="Update Book" />}
        </div>

        <div className="col-md-4">
          <h4>Delete Book</h4>
          <form onSubmit={handleDelete} className="card card-body">
            <label className="form-label">Book ID</label>
            <input className="form-control mb-3" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required />
            <button className="btn btn-danger" type="submit">Delete Book</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageBooksPage;
```

## 14.7 Create `AdminReportsPage.jsx`

Create `frontend/src/pages/AdminReportsPage.jsx`.

```jsx
import { useState } from 'react';
import { getBorrowedBooksReport, getBorrowersReport } from '../api';

function AdminReportsPage() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [error, setError] = useState('');

  async function loadBorrowedBooks() {
    setError('');

    try {
      const data = await getBorrowedBooksReport();
      setBorrowedBooks(data);
    } catch (error) {
      setError(error.message);
    }
  }

  async function loadBorrowers() {
    setError('');

    try {
      const data = await getBorrowersReport();
      setBorrowers(data);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div>
      <h2>Admin Reports</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={loadBorrowedBooks}>Load Borrowed Books Report</button>
        <button className="btn btn-secondary" onClick={loadBorrowers}>Load Borrowers Report</button>
      </div>

      <h4>All Borrowed Books</h4>
      {!borrowedBooks.length ? (
        <p>No borrowed books loaded.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Book</th>
              <th>Borrow Date</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction._id}</td>
                <td>{transaction.user?.username}</td>
                <td>{transaction.book?.name}</td>
                <td>{new Date(transaction.borrowDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h4>Users Who Borrowed Books</h4>
      {!borrowers.length ? (
        <p>No borrowers loaded.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>User</th>
              <th>Books Borrowed</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((item) => (
              <tr key={item.userId}>
                <td>{item.username}</td>
                <td>
                  {item.borrowedBooks.map((book) => (
                    <div key={book.transactionId}>
                      {book.bookName} - {book.returned ? 'Returned' : 'Borrowed'}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminReportsPage;
```

## 14.8 Replace `App.jsx`

Replace `frontend/src/App.jsx`.

```jsx
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BrowseBooksPage from './pages/BrowseBooksPage';
import MyBorrowedBooksPage from './pages/MyBorrowedBooksPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ManageBooksPage from './pages/ManageBooksPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AppNavbar from './components/AppNavbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')));
  const [authPage, setAuthPage] = useState('login');
  const [currentPage, setCurrentPage] = useState('browse');
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');

  function handleLogin() {
    setIsLoggedIn(true);
    setRole(localStorage.getItem('role') || 'user');
    setCurrentPage('browse');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setAuthPage('login');
    setRole('user');
  }

  if (!isLoggedIn) {
    if (authPage === 'register') {
      return <RegisterPage onRegister={handleLogin} goToLogin={() => setAuthPage('login')} />;
    }

    return <LoginPage onLogin={handleLogin} goToRegister={() => setAuthPage('register')} />;
  }

  return (
    <>
      <AppNavbar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} role={role} />

      <main className="container">
        {currentPage === 'browse' && <BrowseBooksPage />}
        {currentPage === 'myBooks' && <MyBorrowedBooksPage />}
        {currentPage === 'password' && <ChangePasswordPage />}
        {role === 'admin' && currentPage === 'manageBooks' && <ManageBooksPage />}
        {role === 'admin' && currentPage === 'reports' && <AdminReportsPage />}
      </main>
    </>
  );
}

export default App;
```

---

# Phase 15: Run the Full App Locally

## 15.1 Run Backend

In the VS Code backend container terminal:

```bash
cd backend
npm run dev
```

You should see:

```text
Connected to MongoDB
Server running on port 3000
```

## 15.2 Run Frontend

From your Mac Terminal, from the project root:

```bash
docker compose exec frontend bash
```

Then run:

```bash
npm run dev -- --host 0.0.0.0
```

Open:

```text
http://localhost:5173
```

## 15.3 Login

Admin login:

```text
username: admin
password: secret321
```

Regular user login:

```text
username: user1
password: user1pass1
```

---

# Phase 16: Prepare for Heroku Deployment

## 16.1 Update backend `app.js` for production

Replace `backend/app.js` with this version.

```js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Library Management API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

module.exports = app;
```

## 16.2 Create root `package.json`

From the root of the repository, create `package.json`.

```json
{
  "scripts": {
    "build": "cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install && rm -rf public && mkdir public && cp -r ../frontend/dist/* public/",
    "start": "cd backend && npm start",
    "seed:admin": "cd backend && npm run seed:admin",
    "seed:users": "cd backend && npm run seed:users",
    "seed:books": "cd backend && npm run seed:books"
  },
  "engines": {
    "node": "20.x"
  }
}
```

## 16.3 Update frontend API URL for production

Update the first line of `frontend/src/api.js`:

```js
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

---

# Phase 17: Deploy to Heroku

## 17.1 Login to Heroku

```bash
heroku login
```

## 17.2 Create Heroku app

```bash
heroku create YOUR-HEROKU-APP-NAME
```

Example:

```bash
heroku create library-management-demo
```

## 17.3 Set environment variables

```bash
heroku config:set MONGODB_URI="YOUR_ATLAS_CONNECTION_STRING"
heroku config:set JWT_SECRET="use-a-long-random-secret-here"
heroku config:set NODE_ENV=production
```

## 17.4 Commit your files

```bash
git status
git add .
git commit -m "Build library management final project"
```

## 17.5 Push to GitHub

```bash
git push origin main
```

If your branch is named `master`, use:

```bash
git push origin master
```

## 17.6 Deploy to Heroku

```bash
git push heroku main
```

If your branch is named `master`, use:

```bash
git push heroku master
```

## 17.7 Seed Heroku production database

```bash
heroku run "npm run seed:admin"
heroku run "npm run seed:users"
heroku run "npm run seed:books"
```

## 17.8 Open app

```bash
heroku open
```

---

# Phase 18: README Requirements for Submission

At the very beginning of your final README, include:

```text
Deployed App URL: YOUR_DEPLOYED_APP_URL_HERE
```

Then include:

```text
Admin login:
username: admin
password: secret321
```

Also include screenshots of testing all backend routes in Postman.

Required screenshots:

- Register user
- Login
- Change password
- Get all books
- Filter books
- Add book as admin
- Modify book as admin
- Delete book as admin
- Borrow book as user
- Return book as user
- Admin borrowed books report
- Admin borrowers report
- Request with no token
- Request with bad token

---

# Final Project Structure

At the end, your project should look similar to this:

```text
library-management-system/
  README.md
  .gitignore
  package.json
  docker-compose.yml
  .devcontainer/
    devcontainer.json
  backend/
    Dockerfile
    package.json
    server.js
    app.js
    config/
      db.js
    controllers/
      adminController.js
      authController.js
      bookController.js
      transactionController.js
    middleware/
      adminMiddleware.js
      authMiddleware.js
    models/
      Book.js
      BorrowTransaction.js
      User.js
    routes/
      adminRoutes.js
      authRoutes.js
      bookRoutes.js
      transactionRoutes.js
    seed/
      seedAdmin.js
      seedBooks.js
      seedUsers.js
  frontend/
    Dockerfile
    package.json
    index.html
    src/
      main.jsx
      App.jsx
      api.js
      components/
        AppNavbar.jsx
        BookForm.jsx
        BookTable.jsx
      pages/
        AdminReportsPage.jsx
        BrowseBooksPage.jsx
        ChangePasswordPage.jsx
        LoginPage.jsx
        ManageBooksPage.jsx
        MyBorrowedBooksPage.jsx
        RegisterPage.jsx
```

---

# Final Rubric Checklist

Before submitting, check every item:

```text
✓ App authenticates users
✓ App logs users in
✓ App logs users out
✓ App allows users to register
✓ App allows registered users to change passwords
✓ App reports errors nicely
✓ Admin can only add books
✓ Admin can only modify books
✓ Admin can only delete books
✓ Users can borrow books
✓ Users can return books
✓ Program has a way to seed the admin
✓ Program has a way to seed at least 100 books
✓ Program has a way to seed 5 users
✓ Users can GET all books
✓ Users can filter books
✓ Admin can see a report of all borrowed books
✓ Admin can see a report of users who borrowed books
✓ Frontend uses Bootstrap
✓ README includes deployed URL
✓ README explains what was easy, hard, and learned
✓ README includes Postman screenshots
```

---

# Troubleshooting

## Problem: `Missing MongoDB connection string`

Make sure `docker-compose.yml` has:

```text
MONGO_URL=mongodb://db:27017/library_management
```

## Problem: `getaddrinfo ENOTFOUND db`

You are probably running backend outside Docker.

Inside Docker use:

```text
mongodb://db:27017/library_management
```

Outside Docker use:

```text
mongodb://localhost:27017/library_management
```

## Problem: Login fails

Run:

```bash
npm run seed:admin
```

Then login with:

```text
admin / secret321
```

## Problem: User routes return 401

Make sure Postman or frontend sends:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

## Problem: Admin routes return 403

You are logged in as a normal user.

Login as:

```text
admin / secret321
```

## Problem: Book cannot be borrowed

Check if:

```text
quantity is greater than 0
```

A book cannot be borrowed if there are no copies available.

