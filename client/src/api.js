const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body;
}

export const api = {
  getState: () => request('/state'),
  createReservation: (data) =>
    request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  addUser: (name) => request('/users', { method: 'POST', body: JSON.stringify({ name }) }),
  signupWaker: (userId) =>
    request('/wakers/signup', { method: 'POST', body: JSON.stringify({ userId }) }),
  resignWaker: (userId) =>
    request('/wakers/resign', { method: 'POST', body: JSON.stringify({ userId }) }),
  assignWaker: () => request('/wakers/assign', { method: 'POST' }),
  rejectWakerDuty: (userId) =>
    request('/wakers/reject', { method: 'POST', body: JSON.stringify({ userId }) }),
  wakeUser: (id, userId) =>
    request(`/reservations/${id}/wake`, { method: 'POST', body: JSON.stringify({ userId }) }),
  exitSleep: (id, userId) =>
    request(`/reservations/${id}/exit`, { method: 'POST', body: JSON.stringify({ userId }) }),
  markNotificationsRead: (userId) =>
    request('/notifications/read', { method: 'POST', body: JSON.stringify({ userId }) }),
};
