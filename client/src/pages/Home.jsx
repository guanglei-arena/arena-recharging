import { Link } from 'react-router-dom';
import { useApp } from '../App.jsx';

export default function Home() {
  const { state, currentUser } = useApp();
  const pods = state?.pods || [];
  const vacant = pods.filter((p) => p.status === 'vacant').length;
  const activeNappers = (state?.wakeList || []).length;
  const waker = state?.assignedWaker;

  return (
    <div>
      <div className="hero">
        <h1>Recharge, then get back to flow.</h1>
        <p>
          Book a quiet sleep pod, catch a nap, and let a teammate wake you when your
          time is up. Everything is fair, scheduled, and on time.
        </p>
      </div>

      <div>
        <div className="mb">
          <span className="pill">🛏 {vacant} of {pods.length} pods free</span>{' '}
          <span className="pill">😴 {activeNappers} napper{activeNappers === 1 ? '' : 's'} over time</span>{' '}
          {waker && <span className="pill">🔔 on wake duty: {waker.name}</span>}
        </div>
      </div>

      <div className="section-title">Choose an action</div>
      <div className="grid grid-2">
        <Link to="/nap" className="card action-card">
          <div className="action-icon violet">🌙</div>
          <h2>Request a sleep pod</h2>
          <p>
            See which of the {pods.length} pods are occupied or vacant, then reserve a block of
            time for a nap — just like booking a room on a calendar.
          </p>
          <button className="btn btn-primary">Book a nap →</button>
        </Link>

        <Link to="/wake" className="card action-card">
          <div className="action-icon coral">⏰</div>
          <h2>Volunteer to wake others</h2>
          <p>
            Sign up as a wake-up buddy. One volunteer is randomly chosen each session to wake
            teammates whose nap time is up — and get notified if they exit on their own.
          </p>
          <button className="btn btn-coral">Wake a teammate →</button>
        </Link>
      </div>

      <div className="section-title">How it works</div>
      <div className="grid grid-3">
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(79,179,217,0.16)' }}>1</div>
          <h3>Book a pod</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Pick a free slot on a pod's calendar. The pod is marked occupied for your window.
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(244,195,106,0.16)' }}>2</div>
          <h3>Nap & time-up</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            When your planned time ends, your pod goes into “time up.” A buddy is notified to come
            wake you.
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(87,213,166,0.16)' }}>3</div>
          <h3>Wake or exit</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            You can tap <strong>Exit</strong> to get up on your own — then no one needs to come wake
            you.
          </p>
        </div>
      </div>

      <div className="section-title">Live status</div>
      <div className="grid grid-3">
        {pods.map((pod) => (
          <div key={pod.id} className="card" style={{ borderLeft: `5px solid ${pod.color}` }}>
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
          </div>
        ))}
      </div>

      {currentUser && (
        <div className="banner blue mt">
          <span className="icon">👋</span>
          <p>
            You are browsing as <strong>{currentUser.name}</strong>. Use the switcher in the top bar
            to act as different teammates (the sleeper or the wake-up buddy).
          </p>
        </div>
      )}
    </div>
  );
}
