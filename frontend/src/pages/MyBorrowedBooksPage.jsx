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