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
  { id: 'u-anastasios', name: 'Anastasios' },
  { id: 'u-guanglei', name: 'Guanglei' },
  { id: 'u-tony', name: 'Tony' },
];

const pods = [
  { id: 'pod-1', name: 'Pod A', location: 'Cabin 1', color: '#b4694e', notes: '' },
  { id: 'pod-2', name: 'Pod B', location: 'Cabin 1', color: '#7d9a5e', notes: '' },
  { id: 'pod-3', name: 'Pod C', location: 'Cabin 2', color: '#c9973f', notes: '' },
];

// Reservation status lifecycle:
//   'scheduled' -> 'active' (start reached) -> 'timeup' (end passed, still in pod)
//   'timeup' -> 'woke' (waker wakes)  OR  'exited' (sleeper leaves on their own)
const reservations = [
  // An active napper whose time is already up -> should show in the "needs waking" list.
  {
    id: 'res-overdue',
    podId: 'pod-1',
    userId: 'u-weilin',
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
    name: 'Anastasios',
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
const wakerSignups = ['u-guanglei', 'u-tony'];

// Volunteers who already turned down the duty for this round (e.g. stuck in a
// meeting at the wake-up time). They stay in the pool but are skipped until
// everyone else has had a turn.
let declinedWakerIds = [];

// The randomly-chosen waker for this session (chosen from the signup pool).
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
    message: "Wei-lin's nap time is up in Pod A (Cabin 1). Please go wake them.",
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

function userById(id) {
  return users.find((u) => u.id === id) || null;
}

// Volunteers who can still take the duty this round. If everybody already
// declined, the round restarts so the duty can always be filled.
function eligibleWakers() {
  const remaining = wakerSignups.filter((id) => !declinedWakerIds.includes(id));
  if (remaining.length === 0 && wakerSignups.length > 0) {
    declinedWakerIds = [];
    return { candidates: [...wakerSignups], freshRound: true };
  }
  return { candidates: remaining, freshRound: false };
}

function getState() {
  return {
    pods: podWithStatus(),
    reservations: reservations.map(publicReservation),
    users,
    wakerSignups: wakerSignups.map((id) => ({
      id,
      name: userById(id)?.name || id,
      declined: declinedWakerIds.includes(id),
    })),
    assignedWaker: userById(assignedWakerId),
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
  // Signing back up means they are available again for this round.
  declinedWakerIds = declinedWakerIds.filter((id) => id !== userId);
  return userById(userId);
}

function resignWaker(userId) {
  const i = wakerSignups.indexOf(userId);
  if (i >= 0) wakerSignups.splice(i, 1);
  declinedWakerIds = declinedWakerIds.filter((id) => id !== userId);
  // If the person on duty leaves the pool, hand the duty to someone else.
  if (assignedWakerId === userId) {
    assignedWakerId = null;
    assignWaker();
  }
}

// Randomly choose one signed-up waker to be on duty.
// `passedFrom` lets us word the notification differently when the duty is
// automatically handed over after someone declined.
function assignWaker(passedFrom) {
  const { candidates, freshRound } = eligibleWakers();
  if (candidates.length === 0) {
    assignedWakerId = null;
    return null;
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  assignedWakerId = pick;
  const user = userById(pick);
  const fromName = passedFrom ? userById(passedFrom)?.name : null;

  let message;
  if (!fromName) {
    message = `${user?.name}, you were randomly chosen to help wake teammates whose nap time is up.`;
  } else if (freshRound) {
    message = `Everyone in the pool already had a turn, so the duty came back around to you, ${user?.name}.`;
  } else {
    message = `${fromName} turned the duty down, so it is yours now, ${user?.name}. A teammate needs waking.`;
  }

  notifications.unshift({
    id: uid('notif'),
    userId: pick,
    type: 'wake-duty',
    title: fromName ? 'Wake-up duty handed to you' : 'Wake-up duty assigned',
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  return user;
}

// The assigned volunteer turns the duty down (e.g. they are in a meeting at the
// wake-up time). The duty is immediately offered to another volunteer.
function declineWakerAssignment(userId) {
  if (!assignedWakerId) throw new Error('No one is on wake-up duty right now');
  if (assignedWakerId !== userId) {
    throw new Error('Only the volunteer on duty can decline it');
  }
  const declinedUser = userById(userId);
  if (!declinedWakerIds.includes(userId)) declinedWakerIds.push(userId);
  assignedWakerId = null;

  const next = assignWaker(userId);

  notifications.unshift({
    id: uid('notif'),
    userId,
    type: 'info',
    title: 'Duty passed on',
    message: next
      ? `No problem — the wake-up duty went to ${next.name}.`
      : 'No one else is available, so wake-up duty is currently unassigned.',
    createdAt: new Date().toISOString(),
    read: false,
  });

  if (!next) {
    // Let the whole volunteer pool know nobody is covering.
    wakerSignups.forEach((id) => {
      if (id === userId) return;
      notifications.unshift({
        id: uid('notif'),
        userId: id,
        type: 'info',
        title: 'Wake-up duty needs a volunteer',
        message: `${declinedUser?.name || 'A teammate'} could not take the duty and no one else is available. Please step up if you can.`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    });
  }

  return { declined: declinedUser, assignedWaker: next };
}

// Waker marks a time-up sleeper as woken.
function wakeUser(reservationId, byUserId) {
  const r = reservations.find((x) => x.id === reservationId);
  if (!r) throw new Error('Reservation not found');
  r.status = 'woke';
  const byName = userById(byUserId)?.name || 'A teammate';
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
  declineWakerAssignment,
  wakeUser,
  exitSleep,
  markNotificationsRead,
};
