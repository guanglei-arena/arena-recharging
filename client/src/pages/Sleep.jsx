import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import { formatTime, minutesFromNow } from '../lib.js';

export default function Sleep() {
  const { state, currentUser, refresh, notify } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  // Find the active or time-up reservation belonging strictly to the current scheduled user
  const myRes = (state?.reservations || []).find(
    (r) => r.userId === currentUser?.id && ['active', 'timeup'].includes(r.status)
  );

  // If someone else is sleeping
  const otherRes = !myRes
    ? (state?.reservations || []).find((r) => ['active', 'timeup'].includes(r.status))
    : null;

  async function handleAwake() {
    if (!myRes || !currentUser) return;
    setBusy(true);
    setError(null);
    try {
      await api.exitSleep(myRes.id, currentUser.id);
      await refresh();
      notify();
      setDone(true);
      setTimeout(() => {
        navigate('/');
      }, 1400);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  // If no reservation for the current user
  if (!myRes) {
    return (
      <div className="sleep-screen">
        <div className="sleep-card">
          <div className="sleep-icon">🌿</div>
          <h2>No Active Sleep Session</h2>
          <p className="sleep-sub">
            {currentUser ? (
              <>
                <strong>{currentUser.name}</strong> does not have an active nap session right now.
              </>
            ) : (
              'Please select a user to access sleep mode.'
            )}
          </p>
          {otherRes && (
            <div className="sleep-note">
              Note: <strong>{otherRes.name}</strong> is currently scheduled in{' '}
              {podName(state, otherRes.podId)}. Only the scheduled person can access their sleep session.
            </div>
          )}
          <div className="sleep-actions" style={{ marginTop: 24 }}>
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
            <Link to="/nap" className="btn btn-ghost">
              Book a Pod
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pod = (state?.pods || []).find((p) => p.id === myRes.podId);
  const isTimeUp = myRes.status === 'timeup';

  if (done) {
    return (
      <div className="sleep-screen">
        <div className="sleep-card">
          <div className="sleep-icon">🌅</div>
          <h2>Welcome back!</h2>
          <p className="sleep-sub">
            You are now awake and marked exited. Returning to Arena Pause...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-screen">
      <div className="sleep-ambient-ring" />
      <div className="sleep-card">
        <div className="sleep-badge">
          <span className="dot" />
          {isTimeUp ? 'Time is up' : 'Sleeping in progress'}
        </div>

        <div className="sleep-pulse">
          <span className="sleep-moon">🌙</span>
        </div>

        <h1 className="sleep-title">Rest peacefully, {currentUser.name}</h1>
        <div className="sleep-info">
          <span>{pod?.name || 'Pod'} · {pod?.location || 'Cabin'}</span>
          <span className="sleep-divider">•</span>
          <span>
            {isTimeUp
              ? `Time was up ${minutesFromNow(myRes.endMs)}`
              : `Wake scheduled for ${formatTime(myRes.endMs)} (${minutesFromNow(myRes.endMs)})`}
          </span>
        </div>

        {error && <div className="sleep-error">{error}</div>}

        {/* A single, clear button to end the nap and return home */}
        <div className="sleep-actions">
          <button
            className="btn btn-awake"
            onClick={handleAwake}
            disabled={busy}
          >
            {busy ? <span className="spin" /> : '🌅 I am awake'}
          </button>
        </div>
      </div>
    </div>
  );
}

function podName(state, podId) {
  return state?.pods?.find((p) => p.id === podId)?.name || podId;
}
