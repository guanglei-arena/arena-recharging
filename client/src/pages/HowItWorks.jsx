import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="how-it-works-page">
      <div className="hero" style={{ paddingTop: 24 }}>
        <h1>How Arena Pause Works</h1>
        <p>
          A balanced, mindful system for workday recharging. Book a sleep pod, rest
          peacefully, and rely on teammates to wake you right on time.
        </p>
      </div>

      <div className="section-title">The Five-Step Flow</div>
      <div className="how-steps-grid">
        <div className="card step-card">
          <div className="step-num">01</div>
          <div className="step-icon-wrap">🛏️</div>
          <h3>Book a Sleep Pod</h3>
          <p>
            Choose any available pod (Monterey, Big Sur, or Half Moon Bay) and select your time slot on the calendar.
            The pod automatically reflects as <strong>Occupied</strong> during your booked window.
          </p>
        </div>

        <div className="card step-card">
          <div className="step-num">02</div>
          <div className="step-icon-wrap">😴</div>
          <h3>Enter Sleep Mode</h3>
          <p>
            When your nap begins, enter the dedicated distraction-free <strong>Sleep Screen</strong>.
            It provides a tranquil screen with an <strong>“I am awake”</strong> button.
          </p>
        </div>

        <div className="card step-card">
          <div className="step-num">03</div>
          <div className="step-icon-wrap">🤝</div>
          <h3>Volunteer Wake Buddy</h3>
          <p>
            Teammates volunteer for wake-up duty. The system randomly selects one volunteer to help
            wake teammates whose nap duration has ended.
          </p>
        </div>

        <div className="card step-card">
          <div className="step-num">04</div>
          <div className="step-icon-wrap">📅</div>
          <h3>Conflict? Auto-Reassign</h3>
          <p>
            If the assigned volunteer is in a meeting during wake-up time, they can simply
            <strong> reject the offer</strong>. Arena Pause instantly reassigns duty to another volunteer from the pool.
          </p>
        </div>

        <div className="card step-card">
          <div className="step-num">05</div>
          <div className="step-icon-wrap">🌅</div>
          <h3>Wake Up or Self-Exit</h3>
          <p>
            When time is up, your buddy is alerted to wake you. If you wake up beforehand,
            simply tap <strong>I am awake</strong> to exit on your own — saving your buddy a trip.
          </p>
        </div>
      </div>

      <div className="section-title">Recharge Lounge Principles</div>
      <div className="grid grid-3 mt">
        <div className="card">
          <div className="action-icon sage">🌿</div>
          <h3 style={{ marginTop: 0 }}>Mindful Quiet</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Pods are quiet rest zones. Please mute notifications, use sleep masks if desired, and maintain a whisper atmosphere.
          </p>
        </div>
        <div className="card">
          <div className="action-icon terracotta">⏱️</div>
          <h3 style={{ marginTop: 0 }}>Strict Punctuality</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Short naps (20–30 minutes) optimize alertness without sleep inertia. Scheduling ensures fairness for every teammate.
          </p>
        </div>
        <div className="card">
          <div className="action-icon ochre">🤝</div>
          <h3 style={{ marginTop: 0 }}>Shared Responsibility</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Every teammate who takes a nap is encouraged to join the volunteer pool to wake others when available.
          </p>
        </div>
      </div>

      <div className="card mt" style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--panel-2)' }}>
        <h2 style={{ margin: '0 0 10px' }}>Ready to recharge?</h2>
        <p className="muted" style={{ maxWidth: 500, margin: '0 auto 20px' }}>
          Check pod availability or volunteer to support your team.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/nap" className="btn btn-primary">
            Request a Pod →
          </Link>
          <Link to="/wake" className="btn btn-secondary">
            Volunteer as Waker →
          </Link>
        </div>
      </div>
    </div>
  );
}
