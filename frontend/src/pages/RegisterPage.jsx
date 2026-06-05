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