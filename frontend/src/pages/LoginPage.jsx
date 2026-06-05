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