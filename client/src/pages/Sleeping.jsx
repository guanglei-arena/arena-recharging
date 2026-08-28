import { useNavigate } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { api } from '../api.js';

export default function Sleeping() {
  const { state, currentUser, refresh, notify } = useApp();
  const navigate = useNavigate();
  const myRes = (state?.reservations || []).find(
    (r) => r.userId === currentUser?.id && ['active', 'timeup'].includes(r.status)
  );

  async function handleAwake() {
    if (!myRes || !currentUser) return;
    try {
      await api.exitSleep(myRes.id, currentUser.id);
      await refresh();
      notify();
      navigate('/nap');
    } catch (e) {
      alert(e.message || 'Something went wrong — please try again.');
    }
  }

  if (!myRes && currentUser) {
    return (
      <div className="sleeping-room">
        <div className="card sleeping-card">
          <div className="sleeping-icon">🌙</div>
          <h1>No active nap</h1>
          <p className="muted">You don't have a sleep pod booking right now.</p>
          <a className="btn btn-primary" href="/nap">
            Back to pods
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="sleeping-room">
      <div className="card sleeping-card">
        <div className="sleeping-icon">😴</div>
        <h1>Take it easy</h1>
        <p className="muted">You're scheduled for a nap right now.</p>
        <button className="btn btn-coral" onClick={handleAwake}>
          I'm awake
        </button>
      </div>
    </div>
  );
}
