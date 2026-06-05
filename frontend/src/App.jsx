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