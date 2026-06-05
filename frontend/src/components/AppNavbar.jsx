function AppNavbar({ currentPage, setCurrentPage, onLogout, role }) {
  const userItems = [
    ['browse', 'Browse Books'],
    ['myBooks', 'My Borrowed Books'],
    ['password', 'Change Password']
  ];

  const adminItems = [
    ['manageBooks', 'Manage Books'],
    ['reports', 'Admin Reports']
  ];

  const navItems = role === 'admin' ? [...userItems, ...adminItems] : userItems;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <span className="navbar-brand">Library Management</span>

        <div className="navbar-nav">
          {navItems.map(([key, label]) => (
            <button
              key={key}
              className={`nav-link btn btn-link ${currentPage === key ? 'active' : ''}`}
              onClick={() => setCurrentPage(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="btn btn-outline-light" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AppNavbar;