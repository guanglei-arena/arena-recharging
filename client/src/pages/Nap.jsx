import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import {
  formatRange,
  formatTime,
  todayKey,
  shiftDayKey,
  dayBounds,
  formatDay,
  gradientFor,
  initials,
  nextHalfHour,
  minutesFromNow,
} from '../lib.js';

function PodCalendar({ pod }) {
  const { state, currentUser, refresh, notify } = useApp();
  const [dayKey, setDayKey] = useState(todayKey());
  const [start, setStart] = useState(() => {
    const d = nextHalfHour();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [end, setEnd] = useState(() => {
    const d = nextHalfHour(Date.now() + 30 * 60000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const [dayStart, dayEnd] = dayBounds(dayKey);
  const dayRes = (state?.reservations || []).filter(
    (r) => r.podId === pod.id && r.startMs < dayEnd && r.endMs > dayStart
  );

  const floorH = useMemo(() => {
    const mins = dayRes.map((r) => new Date(r.startMs).getHours());
    return Math.max(6, Math.min(...(mins.length ? mins : [8]), 12));
  }, [dayRes]);
  const ceilH = useMemo(() => {
    const maxs = dayRes.map((r) => new Date(r.endMs).getHours() + (new Date(r.endMs).getMinutes() > 0 ? 1 : 0));
    return Math.max(22, Math.min(24, ...(maxs.length ? maxs : [22])));
  }, [dayRes]);

  const hours = [];
  for (let h = floorH; h <= ceilH; h++) hours.push(h);
  const totalH = (ceilH - floorH) * 52;
  const pixelPerHour = 52;

  function msToTop(ms) {
    const hour = (ms - dayStart) / 3600000; // fractional hour since midnight
    return (hour - floorH) * pixelPerHour;
  }

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    if (!currentUser) {
      setFormError('Select a user first.');
      return;
    }
    const startMs = combine(dayKey, start);
    const endMs = combine(dayKey, end);
    if (endMs <= startMs) {
      setFormError('End time must be after start time.');
      return;
    }
    if (endMs > dayEnd) {
      setFormError('Times must be within the selected day.');
      return;
    }
    setBusy(true);
    try {
      await api.createReservation({
        podId: pod.id,
        userId: currentUser.id,
        start: new Date(startMs).toISOString(),
        end: new Date(endMs).toISOString(),
        note,
      });
      setNote('');
      await refresh();
      notify();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 18, borderLeft: `5px solid ${pod.color}` }}>
      <div className="pod-head">
        <div>
          <h3 style={{ margin: 0 }}>
            {pod.name} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>· {pod.location}</span>
          </h3>
        </div>
        <span className={`badge ${pod.status}`}>
          <span className="dot" />
          {pod.status === 'vacant' ? 'Vacant' : 'Occupied'}
        </span>
      </div>

      <div className="cal-row mt">
        <div className="cal-main">
          <div className="day-picker">
            <button type="button" onClick={() => setDayKey(shiftDayKey(dayKey, -1))} aria-label="Previous day">
              ‹
            </button>
            <span className="date">{formatDay(dayStart)}</span>
            <button type="button" onClick={() => setDayKey(shiftDayKey(dayKey, 1))} aria-label="Next day">
              ›
            </button>
            {dayKey !== todayKey() && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDayKey(todayKey())}>
                Today
              </button>
            )}
          </div>

          <div className="timeline" style={{ height: totalH + 20 }}>
            {hours.map((h, i) => (
              <div className="hour" key={h} style={{ height: pixelPerHour }}>
                <span className="hour-label">{formatHour(h)}</span>
              </div>
            ))}
            {dayRes.map((r) => {
              const top = msToTop(r.startMs);
              const height = ((r.endMs - r.startMs) / 3600000) * pixelPerHour;
              const mine = r.userId === currentUser?.id;
              return (
                <div
                  key={r.id}
                  className={`block ${mine ? 'mine' : ''}`}
                  style={{
                    top: top + 2,
                    height: Math.max(28, height - 6),
                    background: mine ? pod.color : 'rgba(111,125,59,0.25)',
                  }}
                  title={`${r.name} · ${formatRange(r.startMs, r.endMs)}`}
                >
                  <span className="time">{formatRange(r.startMs, r.endMs)}</span>
                  {r.name}
                  {r.status && (
                    <span className="tag" style={{ marginLeft: 5, fontSize: 10 }}>
                      {statLabel(r.status)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="cal-form">
          <form onSubmit={submit}>
            <div className="field">
              <label>Book as</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="avatar"
                  style={{
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    background: `linear-gradient(140deg, ${gradientFor(currentUser?.name || '?')[0]}, ${gradientFor(currentUser?.name || '?')[1]})`,
                  }}
                >
                  {initials(currentUser?.name || '?')}
                </span>
                <strong>{currentUser?.name || 'No user selected'}</strong>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Start</label>
                <input type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} required />
              </div>
              <div className="field">
                <label>End</label>
                <input type="time" className="input" value={end} onChange={(e) => setEnd(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <label>Note (optional)</label>
              <input
                className="input"
                value={note}
                placeholder="e.g. recovering from a late night"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
              {busy ? <span className="spin" /> : `Reserve ${pod.name}`}
            </button>
            {formError && (
              <div className="danger" style={{ marginTop: 10, fontSize: 13 }}>
                {formError}
              </div>
            )}
          </form>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
            Reservations are live for everyone. The pod shows <strong>occupied</strong> during any
            booked window and <strong>vacant</strong> otherwise.
          </div>
        </div>
      </div>
    </div>
  );
}

function combine(dayKey, time) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function statLabel(status) {
  return {
    scheduled: 'booked',
    active: 'sleeping',
    timeup: 'time up',
    woke: 'woken',
    exited: 'exited',
  }[status] || status;
}

export default function Nap() {
  const { state, currentUser, refresh, notify } = useApp();
  const [selectedPodId, setSelectedPodId] = useState(state?.pods?.[0]?.id);
  const [notice, setNotice] = useState(null);

  const pods = state?.pods || [];
  const selectedPod = pods.find((p) => p.id === selectedPodId) || pods[0];

  // The current user's sitting reservation (active or time-up).
  const myRes = (state?.reservations || []).find((r) => r.userId === currentUser?.id && ['active', 'timeup'].includes(r.status));

  const podCount = (podId) =>
    (state?.reservations || []).filter((r) => r.podId === podId && ['active', 'timeup', 'scheduled'].includes(r.status)).length;

  async function handleExit() {
    if (!myRes) return;
    setNotice(null);
    try {
      await api.exitSleep(myRes.id, currentUser.id);
      await refresh();
      notify();
      setNotice({ kind: 'green', icon: '🌅', text: 'You exited the nap. No one will be sent to wake you.' });
    } catch (err) {
      setNotice({ kind: 'amber', icon: '⚠️', text: err.message });
    }
  }

  return (
    <div>
      <div className="hero" style={{ paddingTop: 24 }}>
        <h1>Request a sleep pod</h1>
        <p>
          Pick a pod, check its status, and reserve a block of time for your nap. Pods show
          <strong> occupied</strong> or <strong>vacant</strong> based on real bookings.
        </p>
      </div>

      <div className="section-title">Pods</div>
      <div className="grid grid-3">
        {pods.map((pod) => {
          return (
            <div
              key={pod.id}
              className="card"
              style={{ borderLeft: `5px solid ${pod.color}`, cursor: 'pointer', outline: selectedPod?.id === pod.id ? '2px solid var(--accent)' : 'none' }}
              onClick={() => setSelectedPodId(pod.id)}
            >
              <div className="pod-head">
                <div>
                  <h3 style={{ margin: 0 }}>{pod.name}</h3>
                  <div className="loc">{pod.location}</div>
                </div>
                <span className={`badge ${pod.status}`}>
                  <span className="dot" />
                  {pod.status === 'vacant' ? 'Vacant' : 'Occupied'}
                </span>
              </div>
              <div className="pod-data">
                <div className="row">
                  <span>Today's bookings</span>
                  <span style={{ color: 'var(--text)' }}>{podCount(pod.id)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {myRes && (
        <div className={`banner ${myRes.status === 'timeup' ? 'amber' : 'blue'}`}>
          <span className="icon">{myRes.status === 'timeup' ? '⏰' : '😴'}</span>
          <p>
            <strong>
              {myRes.status === 'timeup'
                ? 'Your nap time is up!'
                : `You are napping in the pod until ${formatTime(myRes.endMs)}`}
            </strong>
            <span className="sub">
              {myRes.status === 'timeup'
                ? 'Tap Exit to get up on your own — then a teammate is not sent to wake you.'
                : `Scheduled to end ${minutesFromNow(myRes.endMs)} · Pod ${podName(state, myRes.podId)}`}
            </span>
          </p>
          {myRes.userId === currentUser?.id && (
            <>
              <Link to="/sleeping" className="btn btn-green" style={{ whiteSpace: 'nowrap' }}>
                😴 I'm in the pod
              </Link>
              <button className="btn btn-coral" onClick={handleExit}>
                Exit nap
              </button>
            </>
          )}
        </div>
      )}

      {notice && (
        <div className={`banner ${notice.kind}`}>
          <span className="icon">{notice.icon}</span>
          <p>{notice.text}</p>
        </div>
      )}

      <div className="section-title">Schedule on the calendar</div>
      {selectedPod ? (
        <PodCalendar pod={selectedPod} />
      ) : (
        <div className="empty">Select a pod to open its calendar.</div>
      )}
    </div>
  );
}

function podName(state, podId) {
  return state?.pods?.find((p) => p.id === podId)?.name || podId;
}
