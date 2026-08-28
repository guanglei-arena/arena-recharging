import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div>
      <div className="hero" style={{ paddingTop: 24 }}>
        <h1>How Arena Pause works</h1>
        <p>
          Four steps from booking a pod to being woken up on time — fair, scheduled, and
          always covered by a volunteer.
        </p>
      </div>

      <div className="section-title">The flow</div>
      <div className="grid grid-2">
        <div className="card">
          <div className="action-icon clay">1</div>
          <h3 style={{ marginTop: 0 }}>Book a pod</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            On <Link to="/nap">Request a Nap</Link> pick a pod, check whether it is
            <strong> occupied</strong> or <strong>vacant</strong>, and reserve a block of time on
            its calendar — just like booking a room. The pod shows occupied for your window.
          </p>
        </div>

        <div className="card">
          <div className="action-icon ochre">2</div>
          <h3 style={{ marginTop: 0 }}>Nap &amp; time-up</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            When your planned end time passes, your pod goes into <strong>time up</strong> and you
            appear on the <Link to="/wake">needs waking</Link> list for the volunteer on duty.
          </p>
        </div>

        <div className="card">
          <div className="action-icon moss">3</div>
          <h3 style={{ marginTop: 0 }}>Someone is on duty</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Anyone can volunteer to be a wake-up buddy. One volunteer is <strong>randomly
            chosen</strong> each session and gets a notification. If they are tied up — say, in a
            meeting at your wake-up time — they can <strong>decline the offer</strong> and the duty
            is handed straight to another volunteer.
          </p>
        </div>

        <div className="card">
          <div className="action-icon stone">4</div>
          <h3 style={{ marginTop: 0 }}>Woken, or up on your own</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            The volunteer taps <strong>Wake up</strong> and you get a notification. Already up? Open
            the <Link to="/sleep">nap screen</Link> and tap <strong>I'm awake</strong> — that ends
            your nap and tells the volunteer not to come get you.
          </p>
        </div>
      </div>

      <div className="section-title">Good to know</div>
      <div className="grid grid-3">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>The nap screen</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            The <strong>I'm sleeping</strong> button only opens for the teammate who actually has a
            booking running. It leads to a quiet screen with one button: <strong>I'm awake</strong>.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Volunteer pool</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Declining keeps you in the pool — you are simply skipped this round, and you can be
            picked again later. Leaving the pool entirely is a separate action.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Notifications</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            The bell in the top bar collects everything: duty assigned, duty handed to you, someone
            needs waking, a nap that ended on its own.
          </p>
        </div>
      </div>
    </div>
  );
}
