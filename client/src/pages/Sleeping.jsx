import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import { formatTime, minutesFromNow } from '../lib.js';

// The nap screen: a quiet, single-purpose page for the teammate who is
// currently in a pod. The only action on it is "I'm awake", which ends the nap
// and tells the volunteer on duty that no one needs to come.
export default function Sleeping() {
  const { state, currentUser, refresh, notify } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!state) {
    return <div className="empty">Loading…</div>;
  }

  // Only the teammate with a running (active or time-up) booking gets this page.
  const myNap = (state.reservations || []).find(
    (r) => r.userId === currentUser?.id && ['active', 'timeup'].includes(r.status)
  );

  if (done) {
    return (
      <div className="nap-screen">
        <div className="card nap-card">
          <div className="nap-icon">🌅</div>
          <h1>You're up!</h1>
          <p className="nap-meta">
            Your nap is closed and the volunteer on duty was told not to come get you.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/nap')}>
            Back to the pods
          </button>
        </div>
      </div>
    );
  }

  if (!myNap) {
    return (
      <div className="nap-screen">
        <div className="card nap-card">
          <div className="nap-icon">🌱</div>
          <h1>No nap running</h1>
          <p className="nap-meta">
            {currentUser
              ? `${currentUser.name}, this screen opens once your booked pod time starts.`
              : 'This screen opens once your booked pod time starts.'}
          </p>
          <Link to="/nap" className="btn btn-primary" style={{ width: '100%' }}>
            Request a nap
          </Link>
        </div>
      </div>
    );
  }

  const timeUp = myNap.status === 'timeup';
  const pod = (state.pods || []).find((p) => p.id === myNap.podId);

  async function handleAwake() {
    setBusy(true);
    setError('');
    try {
      await api.exitSleep(myNap.id, currentUser.id);
      await refresh();
      notify();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nap-screen">
      <div className="card nap-card">
        <div className="nap-icon">{timeUp ? '⏰' : '😴'}</div>
        <h1>{timeUp ? 'Your nap time is up' : 'Rest easy'}</h1>
        <p className="nap-meta">
          {currentUser?.name} · {pod?.name || 'Pod'} ({pod?.location || ''})
          <br />
          {timeUp
            ? `Over by ${minutesFromNow(myNap.endMs)} · ended ${formatTime(myNap.endMs)}`
            : `Sleeping until ${formatTime(myNap.endMs)} · ${minutesFromNow(myNap.endMs)}`}
        </p>
        <button className="btn-wake" onClick={handleAwake} disabled={busy}>
          {busy ? <span className="spin" /> : '☀️ I’m awake'}
        </button>
        <div className="nap-hint">
          Ends your nap and lets the volunteer on duty know not to come get you.
        </div>
        {error && (
          <div className="danger" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
