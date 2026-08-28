const PALETTE = [
  ['#c45b3a', '#dd7a5b'], // Terracotta
  ['#4d7c57', '#6f9d78'], // Sage Green
  ['#b87728', '#d69649'], // Warm Ochre
  ['#507684', '#749aa7'], // River Slate
  ['#7d5c48', '#a4806a'], // Warm Clay / Bark
  ['#8a6552', '#b38d77'], // Soft Sandstone
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
