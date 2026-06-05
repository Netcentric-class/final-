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