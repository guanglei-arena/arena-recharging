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
  { id: 'u-weilin', name: 'Wei-lin' },
  { id: 'u-anastasios', name: 'anastasios' },
  { id: 'u-guanglei', name: 'Guanglei' },
  { id: 'u-tony', name: 'Tony' },
];

const pods = [
  { id: 'pod-1', name: 'Monterey', location: 'Cabin 1', color: '#c45b3a', notes: '' },
  { id: 'pod-2', name: 'Big Sur', location: 'Cabin 1', color: '#4d7c57', notes: '' },
  { id: 'pod-3', name: 'Half Moon Bay', location: 'Cabin 2', color: '#b87728', notes: '' },
];

// Reservation status lifecycle:
//   'scheduled' -> 'active' (start reached) -> 'timeup' (end passed, still in pod)
//   'timeup' -> 'woke' (waker wakes)  OR  'exited' (sleeper leaves on their own)
const reservations = [
  // An active napper currently sleeping (Wei-lin) -> can click "I am sleeping" button to enter Sleep Screen.
  {
    id: 'res-active-weilin',
    podId: 'pod-1',
    userId: 'u-weilin',
    name: 'Wei-lin',
    start: at(-20 * MIN),
    end: at(25 * MIN),
    note: 'Afternoon power recharge',
    status: 'active',
  },
  // An active napper whose time is already up (anastasios) -> should show in the "needs waking" list.
  {
    id: 'res-overdue-anastasios',
    podId: 'pod-2',
    userId: 'u-anastasios',
    name: 'anastasios',
    start: at(-50 * MIN),
    end: at(-5 * MIN),
    note: 'Late night recovery',
    status: 'timeup',
  },
  // An upcoming scheduled booking (Tony).
  {
    id: 'res-upcoming-tony',
    podId: 'pod-3',
    userId: 'u-tony',
    name: 'Tony',
    start: at(2 * HOUR),
    end: at(2 * HOUR + 45 * MIN),
    note: 'Focus block reset',
    status: 'scheduled',
  },
];

// Users who volunteered for wake-up duty.
const wakerSignups = ['u-guanglei', 'u-tony', 'u-anastasios'];

// The randomly-chosen waker for this session (Guanglei).
let assignedWakerId = 'u-guanglei';

const notifications = [
  {
    id: uid('notif'),
    userId: 'u-guanglei',
    type: 'wake-duty',
    title: 'Wake-up duty assigned',
    message: 'You were randomly chosen to help wake teammates whose nap time is up.',
    createdAt: at(-30 * MIN),
    read: false,
  },
  {
    id: uid('notif'),
    userId: 'u-guanglei',
    type: 'wake-needed',
    title: 'Someone needs waking',
    message: "anastasios's nap time is up in Big Sur (Cabin 1). Please go wake them.",
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
    wakerSignups: wakerSignups.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean),
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
  if (assignedWakerId === userId) {
    assignedWakerId = null;
  }
}

// Randomly choose one signed-up waker to be on duty.
function assignWaker() {
  if (wakerSignups.length === 0) {
    assignedWakerId = null;
    return null;
  }
  const pick = wakerSignups[Math.floor(Math.random() * wakerSignups.length)];
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

// Rejection by an assigned volunteer (e.g. they are in a meeting), automatically reassigns to another volunteer
function rejectWakerDuty(userId) {
  const rejectingUser = users.find((u) => u.id === userId);
  const rejectingName = rejectingUser ? rejectingUser.name : 'Assigned volunteer';

  // Find alternative volunteers in the pool
  const candidates = wakerSignups.filter((id) => id !== userId);

  let newAssignedUser = null;
  if (candidates.length > 0) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    assignedWakerId = pick;
    newAssignedUser = users.find((u) => u.id === pick) || null;

    notifications.unshift({
      id: uid('notif'),
      userId: pick,
      type: 'wake-duty',
      title: 'Wake-up duty reassigned to you',
      message: `${newAssignedUser?.name}, ${rejectingName} had a conflict (e.g. in a meeting). You were automatically assigned to wake-up duty.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  } else {
    assignedWakerId = null;
  }

  // Confirmation notification for the rejecting user
  if (userId) {
    notifications.unshift({
      id: uid('notif'),
      userId,
      type: 'info',
      title: 'Wake-up duty declined',
      message: newAssignedUser
        ? `You declined wake-up duty due to a conflict. Automatically reassigned to ${newAssignedUser.name}.`
        : 'You declined wake-up duty. There are no other volunteers currently in the pool.',
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  return {
    ok: true,
    rejectedBy: rejectingName,
    assignedWaker: newAssignedUser,
  };
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
    message: `${byName} came to wake you. Your nap time in ${podName(r.podId)} is up.`,
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
  if (assignedWakerId) {
    notifications.unshift({
      id: uid('notif'),
      userId: assignedWakerId,
      type: 'wake-duty',
      title: 'Nap exited on its own',
      message: `${r.name} already got up on their own. No need to wake them.`,
      createdAt: new Date().toISOString(),
      read: false,
    });
  }
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
  rejectWakerDuty,
  wakeUser,
  exitSleep,
  markNotificationsRead,
};
