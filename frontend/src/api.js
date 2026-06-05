const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function register(username, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function changePassword(oldPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export async function getBooks(query = '') {
  return request(`/books${query}`);
}

export async function getBookById(id) {
  return request(`/books/${id}`);
}

export async function createBook(book) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(book)
  });
}

export async function updateBook(id, book) {
  return request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book)
  });
}

export async function deleteBook(id) {
  return request(`/books/${id}`, {
    method: 'DELETE'
  });
}

export async function borrowBook(bookId) {
  return request(`/transactions/borrow/${bookId}`, {
    method: 'POST'
  });
}

export async function getMyBorrowedBooks() {
  return request('/transactions/my-books');
}

export async function returnBook(transactionId) {
  return request(`/transactions/return/${transactionId}`, {
    method: 'POST'
  });
}

export async function getBorrowedBooksReport() {
  return request('/admin/borrowed-books');
}

export async function getBorrowersReport() {
  return request('/admin/borrowers');
}