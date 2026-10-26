const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('gamerig_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('gamerig_token', token);
  } else {
    localStorage.removeItem('gamerig_token');
  }
}

export function getSavedUser() {
  const user = localStorage.getItem('gamerig_user');
  return user ? JSON.parse(user) : null;
}

export function setSavedUser(user) {
  if (user) {
    localStorage.setItem('gamerig_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('gamerig_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Games
  getGames: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/games${query ? `?${query}` : ''}`);
  },
  getGame: (id) => request(`/games/${id}`),
  createGame: (data) => request('/games', { method: 'POST', body: JSON.stringify(data) }),
  updateGame: (id, data) => request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGame: (id) => request(`/games/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Reviews
  getReviews: () => request('/reviews'),
  getGameReviews: (gameId) => request(`/reviews/game/${gameId}`),
  submitReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: () => request('/payments'),
  getUserPayments: (userId) => request(`/payments/user/${userId}`),
  processPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Library
  getUserLibrary: (userId) => request(`/library/user/${userId}`),
  getAllLibrary: () => request('/library'),

  // Admin Dashboard
  getAdminDashboard: () => request('/admin/dashboard')
};
