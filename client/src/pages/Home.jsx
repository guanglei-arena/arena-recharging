import { Link } from 'react-router-dom';
import { useApp } from '../App.jsx';

export default function Home() {
  const { state, currentUser } = useApp();
  const pods = state?.pods || [];
  const vacant = pods.filter((p) => p.status === 'vacant').length;
  const activeNappers = (state?.wakeList || []).length;
  const waker = state?.assignedWaker;

  // Find if current user is currently scheduled & sleeping (active or timeup)
  const myActiveSleep = (state?.reservations || []).find(
    (r) => r.userId === currentUser?.id && ['active', 'timeup'].includes(r.status)
  );

  return (
    <div>
      <div className="hero">
        <h1>Pause, recharge, and return refreshed.</h1>
        <p>
          Quiet sleep pods for mindful workday recharges. Reserve a pod, relax peacefully, and have a teammate wake you right on time.
        </p>
      </div>

      <div className="mb">
        <span className="pill">🛏 {vacant} of {pods.length} pods free</span>{' '}
        <span className="pill">😴 {activeNappers} napper{activeNappers === 1 ? '' : 's'} over time</span>{' '}
        {waker && <span className="pill">🔔 on wake duty: {waker.name}</span>}
      </div>

      <div className="section-title">Choose an action</div>
      <div className="grid grid-2">
        {/* Sleep button / card: Cleaned up without descriptions (only icon and name) */}
        <div className="card action-card-clean">
          <Link to="/nap" className="action-button-link">
            <div className="action-icon sage">🛏️</div>
            <h2>Request a Sleep Pod</h2>
          </Link>

          {/* Only available to click for the person who is actually scheduled & sleeping */}
          {myActiveSleep && (
            <div className="sleep-button-embed">
              <Link to="/sleep" className="btn btn-sleep-direct">
                😴 I am sleeping (Open Sleep Screen) →
              </Link>
            </div>
          )}
        </div>

        {/* Volunteer button / card: Cleaned up without descriptions (only icon and name) */}
        <div className="card action-card-clean">
          <Link to="/wake" className="action-button-link">
            <div className="action-icon terracotta">⏰</div>
            <h2>Volunteer to Wake Others</h2>
          </Link>
        </div>
      </div>

      <div className="section-title">Live pod status</div>
      <div className="grid grid-3">
        {pods.map((pod) => (
          <div key={pod.id} className="card" style={{ borderLeft: `5px solid ${pod.color}` }}>
            <div className="pod-head">
              <div>
                <h3 style={{ margin: 0 }}>{pod.name}</h3>
              </div>
              <span className={`badge ${pod.status}`}>
                <span className="dot" />
                {pod.status === 'vacant' ? 'Vacant' : 'Occupied'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {currentUser && (
        <div className="banner blue mt">
          <span className="icon">🌿</span>
          <p>
            You are browsing as <strong>{currentUser.name}</strong>. Use the switcher in the top bar
            to switch between teammates.
          </p>
        </div>
      )}
    </div>
  );
}
