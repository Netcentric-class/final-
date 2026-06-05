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