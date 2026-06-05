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