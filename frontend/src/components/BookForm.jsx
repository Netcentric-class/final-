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