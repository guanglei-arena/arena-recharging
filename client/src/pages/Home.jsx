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
        <h1>Pause, recharge, get back to flow.</h1>
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
          <div className="action-icon clay">🌙</div>
          <h2>I want to sleep</h2>
          <button className="btn btn-primary">Book a nap →</button>
        </Link>

        <Link to="/wake" className="card action-card">
          <div className="action-icon moss">⏰</div>
          <h2>I can wake someone</h2>
          <button className="btn btn-clay">Wake a teammate →</button>
        </Link>
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
        <div className="banner sage mt">
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
