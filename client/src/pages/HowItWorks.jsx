export default function HowItWorks() {
  return (
    <div>
      <div className="hero" style={{ paddingTop: 24 }}>
        <h1>How it works</h1>
        <p>
          Arena Pause is a simple team nap loop: book a pod, rest, and let a volunteer
          wake you when your time is up. Here is the full picture.
        </p>
      </div>

      <div className="section-title">From booking to waking up</div>
      <div className="grid grid-3">
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(111,125,59,0.18)' }}>1</div>
          <h3>Book a pod</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Pick a free slot on a pod's calendar. The pod is marked occupied for your
            window.
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(201,111,74,0.16)' }}>2</div>
          <h3>Nap & time-up</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            When your planned time ends, your pod goes into “time up.” A buddy is
            notified to come wake you.
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(111,143,123,0.16)' }}>3</div>
          <h3>Wake or exit</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            You can tap <strong>Exit</strong> to get up on your own — then no one needs
            to come wake you.
          </p>
        </div>
      </div>

      <div className="section-title">Wake-up duty</div>
      <div className="grid grid-3">
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(111,125,59,0.18)' }}>1</div>
          <h3>Time runs out</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            When a napper's planned end time passes, they appear on the wake page as
            “time up.”
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(201,111,74,0.16)' }}>2</div>
          <h3>Buddy is notified</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            The assigned waker gets a notification and taps <strong>Wake up</strong> to
            go get them.
          </p>
        </div>
        <div className="card">
          <div className="action-icon" style={{ background: 'rgba(111,143,123,0.16)' }}>3</div>
          <h3>Or they self-exit</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            If the napper taps <strong>Exit</strong> on their nap page, they're marked
            exited and no one is sent to wake them.
          </p>
        </div>
      </div>

      <div className="card mt">
        <div className="section-title" style={{ marginTop: 0 }}>Can a volunteer decline?</div>
        <p className="muted" style={{ marginBottom: 10 }}>
          Yes. If the randomly chosen waker is busy, they can decline the offer from the
          wake page. Arena Pause skips them for this round and automatically assigns a
          new volunteer from the pool.
        </p>
      </div>
    </div>
  );
}
