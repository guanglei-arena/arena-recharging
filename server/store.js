// In-memory data store for Arena Pause.
// State is seeded with demo data and mutated via the functions below.
// Repo is intentionally in-memory so the demo always starts fresh and lively.

let nextId = 1000;
const uid = (prefix) => `${prefix}-${++nextId}`;

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// ---- Seed helpers ----------------------------------------------------------
// Build ISO timestamps relative to "now" so the demo always looks alive.
function at(offsetMs) {
  return new Date(Date.now() + offsetMs).toISOString();
}

// ---- Initial demo data -----------------------------------------------------

const users = [
  { id: 'u-wei-lin', name: 'Wei-lin' },
  { id: 'u-anastasios', name: 'anastasios' },
  { id: 'u-guanglei', name: 'Guanglei' },
  { id: 'u-tony', name: 'Tony' },
];

const pods = [
  { id: 'pod-1', name: 'Pod A', location: 'Cabin 1', color: '#6f7d3b', notes: '' },
  { id: 'pod-2', name: 'Pod B', location: 'Cabin 1', color: '#6f8f7b', notes: '' },
  { id: 'pod-3', name: 'Pod C', location: 'Cabin 2', color: '#c96f4a', notes: '' },
];

// Reservation status lifecycle:
//   'scheduled' -> 'active' (start reached) -> 'timeup' (end passed, still in pod)
//   'timeup' -> 'woke' (waker wakes)  OR  'exited' (sleeper leaves on their own)
const reservations = [
  // An active napper whose time is already up -> should show in the "needs waking" list.
  {
    id: 'res-overdue',
    podId: 'pod-1',
    userId: 'u-wei-lin',
    name: 'Wei-lin',
    start: at(-50 * MIN),
    end: at(-5 * MIN),
    note: 'Recovering from a late night',
    status: 'timeup',
  },
  // An active napper who is still within time, so they are NOT yet due to be woken.
  {
    id: 'res-active-anastasios',
    podId: 'pod-2',
    userId: 'u-anastasios',
    name: 'anastasios',
    start: at(-20 * MIN),
    end: at(30 * MIN),
    note: 'Post-lunch recharge',
    status: 'active',
  },
  // An upcoming scheduled booking.
  {
    id: 'res-upcoming',
    podId: 'pod-3',
    userId: 'u-guanglei',
    name: 'Guanglei',
    start: at(2 * HOUR),
    end: at(2 * HOUR + 45 * MIN),
    note: 'Focus block reset',
    status: 'scheduled',
  },
];

// Users who volunteered to be wake-up duty.
const wakerSignups = ['u-tony', 'u-guanglei'];

// Wakers who declined their wake-up assignment (so we don't re-pick them immediately).
const declinedWakerIds = new Set();

// The randomly-chosen waker for this session (chosen from the signup pool).
let assignedWakerId = 'u-tony';

const notifications = [
  {
    id: uid('notif'),
    userId: 'u-tony',
    type: 'wake-duty',
    title: 'Wake-up duty assigned',
    message: 'You were randomly chosen to help wake teammates whose nap time is up.',
    createdAt: at(-30 * MIN),
    read: false,
  },
  {
    id: uid('notif'),
    userId: 'u-tony',
    type: 'wake-needed',
    title: 'Someone needs waking',
    message: 'Wei-lin\'s nap time is up in Pod A (Cabin 1). Please go wake them.',
    createdAt: at(-3 * MIN),
    read: false,
  },
];

// ---- Derived / helper functions --------------------------------------------

const now = () => Date.now();

function derivePodStatus(podId) {
  // A pod is "occupied" while a person is physically in it: from the moment
  // their booking starts until they are woken or exit (including while over time).
  const occupied = reservations.some((r) => {
    if (r.podId !== podId) return false;
    const refined = refineStatus(r);
    return refined.status === 'active' || refined.status === 'timeup';
  });
  return occupied ? 'occupied' : 'vacant';
}

function refineStatus(r) {
  const s = new Date(r.start).getTime();
  const e = new Date(r.end).getTime();
  let status = r.status;
  if (r.status === 'scheduled' && now() >= s) status = 'active';
  if (status === 'active' && now() >= e) status = 'timeup';
  return { ...r, status };
}

function publicReservation(r) {
  return {
    ...refineStatus(r),
    startMs: new Date(r.start).getTime(),
    endMs: new Date(r.end).getTime(),
  };
}

function getWakeList() {
  return reservations
    .map(refineStatus)
    .filter((r) => r.status === 'timeup')
    .map(publicReservation);
}

function podWithStatus() {
  return pods.map((p) => ({ ...p, status: derivePodStatus(p.id) }));
}

function getState() {
  return {
    pods: podWithStatus(),
    reservations: reservations.map(publicReservation),
    users,
    wakerSignups: wakerSignups.map((id) => users.find((u) => u.id === id)?.name),
    assignedWaker: users.find((u) => u.id === assignedWakerId) || null,
    wakeList: getWakeList(),
    notifications: [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  };
}

// ---- Mutations -------------------------------------------------------------

function createReservation({ podId, userId, start, end, note }) {
  const user = users.find((u) => u.id === userId);
  const pod = pods.find((p) => p.id === podId);
  if (!user || !pod) throw new Error('Invalid user or pod');

  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!(s < e)) throw new Error('End time must be after start time');

  // Overlap check for the same pod.
  const conflict = reservations.some((r) => {
    if (r.podId !== podId) return false;
    const rs = new Date(r.start).getTime();
    const re = new Date(r.end).getTime();
    return s < re && rs < e;
  });
  if (conflict) throw new Error('That time slot is already booked on this pod');

  const reservation = {
    id: uid('res'),
    podId,
    userId,
    name: user.name,
    start: new Date(s).toISOString(),
    end: new Date(e).toISOString(),
    note: note || '',
    status: now() >= s ? 'active' : 'scheduled',
  };
  reservations.push(reservation);
  return publicReservation(reservation);
}

function addUser(name) {
  const user = { id: uid('u'), name };
  users.push(user);
  return user;
}

function signupWaker(userId) {
  if (!wakerSignups.includes(userId)) {
    wakerSignups.push(userId);
  }
  return users.find((u) => u.id === userId) || null;
}

function resignWaker(userId) {
  const i = wakerSignups.indexOf(userId);
  if (i >= 0) wakerSignups.splice(i, 1);
  declinedWakerIds.delete(userId);
}

// Randomly choose one signed-up waker to be on duty.
// Declined wakers are skipped. When an explicit reject happens, the person who just
// declined is excluded too, so they are not immediately re-picked. A manual assign
// still falls back to the whole pool if everyone has declined.
function assignWaker({ excludeId } = {}) {
  const available = wakerSignups.filter(
    (id) => id !== excludeId && !declinedWakerIds.has(id)
  );
  const pool = available.length > 0 ? available : excludeId ? [] : wakerSignups;

  if (pool.length === 0) {
    assignedWakerId = null;
    return null;
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  assignedWakerId = pick;
  const user = users.find((u) => u.id === pick);
  notifications.unshift({
    id: uid('notif'),
    userId: pick,
    type: 'wake-duty',
    title: 'Wake-up duty assigned',
    message: `${user?.name}, you were randomly chosen to help wake teammates whose nap time is up.`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return user;
}

// The on-duty waker declines the assignment (e.g. they are busy).
// They are skipped for the rest of the pool and a new waker is auto-assigned.
function rejectWakerOffer({ userId } = {}) {
  if (assignedWakerId && assignedWakerId !== userId) {
    throw new Error('Only the assigned waker can reject this offer');
  }
  if (assignedWakerId) declinedWakerIds.add(assignedWakerId);

  notifications.unshift({
    id: uid('notif'),
    userId: assignedWakerId,
    type: 'wake-declined',
    title: 'Wake-up duty declined',
    message: `${users.find((u) => u.id === assignedWakerId)?.name || 'You'} turned down this assignment. A new volunteer will be assigned.`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  const next = assignWaker({ excludeId: assignedWakerId });
  return next;
}

// Waker marks a time-up sleeper as woken.
function wakeUser(reservationId, byUserId) {
  const r = reservations.find((x) => x.id === reservationId);
  if (!r) throw new Error('Reservation not found');
  r.status = 'woke';
  const byName = users.find((u) => u.id === byUserId)?.name || 'A teammate';
  notifications.unshift({
    id: uid('notif'),
    userId: r.userId,
    type: 'awake',
    title: 'Time to get up!',
    message: `${byName} came to wake you. Your nap time in Pod ${podName(r.podId)} is up.`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return publicReservation(r);
}

// Sleeper leaves the pod on their own before/after time is up.
function exitSleep(reservationId, userId) {
  const r = reservations.find((x) => x.id === reservationId);
  if (!r) throw new Error('Reservation not found');
  if (r.userId !== userId) throw new Error('Only the sleeper can exit their own nap');
  r.status = 'exited';
  notifications.unshift({
    id: uid('notif'),
    userId: assignedWakerId,
    type: 'wake-duty',
    title: 'Nap exited on its own',
    message: `${r.name} already got up on their own. No need to wake them.`,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return publicReservation(r);
}

function markNotificationsRead(userId) {
  notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
}

function podName(podId) {
  return pods.find((p) => p.id === podId)?.name || podId;
}

export {
  getState,
  createReservation,
  addUser,
  signupWaker,
  resignWaker,
  assignWaker,
  rejectWakerOffer,
  wakeUser,
  exitSleep,
  markNotificationsRead,
};
