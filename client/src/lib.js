const PALETTE = [
  ['#6f7d3b', '#8a9650'],
  ['#c96f4a', '#a9502f'],
  ['#3f7d5c', '#6f8f7b'],
  ['#dda95a', '#b9813f'],
  ['#6f8f7b', '#3f7d5c'],
  ['#8a6a3f', '#6f4a2f'],
];

export function gradientFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatTime(ms) {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatRange(startMs, endMs) {
  return `${formatTime(startMs)} – ${formatTime(endMs)}`;
}

export function formatDay(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function minutesFromNow(targetMs) {
  const diff = targetMs - Date.now();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return diff >= 0 ? 'now' : 'just now';
  if (mins < 0) return `${Math.abs(mins)}m ago`;
  return `in ${mins}m`;
}

export function localDayKey(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Returns [startOfDayMs, endOfDayMs) for given day key.
export function dayBounds(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const start = new Date(y, m - 1, d).getTime();
  return [start, start + 24 * 60 * 60 * 1000];
}

export function todayKey() {
  return localDayKey(Date.now());
}

export function shiftDayKey(dayKey, delta) {
  const date = new Date(...dayKey.split('-').map(Number).map((v, i) => (i === 1 ? v - 1 : v)));
  date.setDate(date.getDate() + delta);
  return localDayKey(date.getTime());
}

// Round a Date to the next half hour, useful as default booking start.
export function nextHalfHour(ms = Date.now()) {
  const d = new Date(ms);
  d.setSeconds(0, 0);
  const targetMin = Math.ceil((d.getMinutes() + 1) / 30) * 30;
  d.setMinutes(targetMin);
  return d;
}
