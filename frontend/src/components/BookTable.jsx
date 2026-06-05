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