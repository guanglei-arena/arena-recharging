import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getState,
  createReservation,
  addUser,
  signupWaker,
  resignWaker,
  assignWaker,
  rejectWakerDuty,
  wakeUser,
  exitSleep,
  markNotificationsRead,
} from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ---- CORS: allow any origin (used in dev when the client is on a separate port) ----
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const ok = (res, data) => res.json(data);
const fail = (res, err) => res.status(400).json({ error: err.message || 'Something went wrong' });

// ---- API -------------------------------------------------------------------
app.get('/api/state', (req, res) => ok(res, getState()));

app.post('/api/reservations', (req, res) => {
  try {
    const created = createReservation(req.body);
    ok(res, created);
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/users', (req, res) => {
  try {
    ok(res, addUser(req.body.name));
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/wakers/signup', (req, res) => {
  try {
    ok(res, signupWaker(req.body.userId));
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/wakers/resign', (req, res) => {
  try {
    resignWaker(req.body.userId);
    ok(res, { ok: true });
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/wakers/assign', (req, res) => {
  try {
    const assigned = assignWaker();
    ok(res, { assignedWaker: assigned });
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/wakers/reject', (req, res) => {
  try {
    const result = rejectWakerDuty(req.body.userId);
    ok(res, result);
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/reservations/:id/wake', (req, res) => {
  try {
    ok(res, wakeUser(req.params.id, req.body.userId));
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/reservations/:id/exit', (req, res) => {
  try {
    ok(res, exitSleep(req.params.id, req.body.userId));
  } catch (e) {
    fail(res, e);
  }
});

app.post('/api/notifications/read', (req, res) => {
  try {
    markNotificationsRead(req.body.userId);
    ok(res, { ok: true });
  } catch (e) {
    fail(res, e);
  }
});

// ---- Serve the built frontend (single-process deployment) -------------------
const distDir = path.resolve(__dirname, '../client/dist');
app.use(express.static(distDir));
app.get(/^\/(?!api).*/, (req, res) => {
  const index = path.join(distDir, 'index.html');
  res.sendFile(index);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Arena Pause server listening on http://0.0.0.0:${PORT}`);
});
