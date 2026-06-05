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