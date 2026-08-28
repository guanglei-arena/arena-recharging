import { useState } from 'react';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import { gradientFor, initials, minutesFromNow } from '../lib.js';

export default function Wake() {
  const { state, currentUser, setCurrentUser, refresh, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [notice, setNotice] = useState(null);

  const wakeList = state?.wakeList || [];
  const pool = state?.wakerSignups || []; // [{ id, name, declined }]
  const assignedWaker = state?.assignedWaker;
  const currentIsWaker = pool.some((p) => p.id === currentUser?.id);
  const isAssigned = assignedWaker?.id === currentUser?.id;

  async function handleSignup() {
    if (!currentUser) return;
    await api.signupWaker(currentUser.id);
    await refresh();
    notify();
  }

  async function handleResign() {
    if (!currentUser) return;
    await api.resignWaker(currentUser.id);
    await refresh();
    notify();
  }

  async function handleAssign() {
    setBusy(true);
    setNotice(null);
    try {
      const { assignedWaker } = await api.assignWaker();
      await refresh();
      notify();
      setNotice({
        kind: 'green',
        icon: '🎲',
        text: assignedWaker
          ? `Random pick complete — ${assignedWaker.name} is now on wake-up duty.`
          : 'No one has signed up as a waker yet.',
      });
    } catch (err) {
      setNotice({ kind: 'amber', icon: '⚠️', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  // The volunteer on duty turns the offer down; the duty is handed on.
  async function handleDecline() {
    if (!currentUser) return;
    setDeclining(true);
    setNotice(null);
    try {
      const { assignedWaker: next } = await api.declineWaker(currentUser.id);
      await refresh();
      notify();
      setNotice(
        next
          ? { kind: 'green', icon: '🤝', text: `No problem — the duty was handed to ${next.name}.` }
          : {
              kind: 'amber',
              icon: '⚠️',
              text: 'You are off duty, but no other volunteer is available right now.',
            }
      );
    } catch (err) {
      setNotice({ kind: 'amber', icon: '⚠️', text: err.message });
    } finally {
      setDeclining(false);
    }
  }

  async function handleWake(resId) {
    if (!currentUser) return;
    setNotice(null);
    try {
      await api.wakeUser(resId, currentUser.id);
      await refresh();
      notify();
      setNotice({ kind: 'green', icon: '🌅', text: 'Woken! They got the notification to get up.' });
    } catch (err) {
      setNotice({ kind: 'amber', icon: '⚠️', text: err.message });
    }
  }

  return (
    <div>
      <div className="hero" style={{ paddingTop: 24 }}>
        <h1>Volunteer to wake teammates</h1>
        <p>
          Sign up to be a wake-up buddy. One volunteer is <strong>randomly chosen</strong> each
          session to wake teammates whose nap time is up — and can pass the duty on if they are
          tied up.
        </p>
      </div>

      {notice && (
        <div className={`banner ${notice.kind}`}>
          <span className="icon">{notice.icon}</span>
          <p>{notice.text}</p>
        </div>
      )}

      <div className="section-title">Wake-up duty</div>
      <div className="grid grid-2">
        <div className="card">
          <div className="pod-head">
            <h3 style={{ margin: 0 }}>On wake-up duty</h3>
            {assignedWaker ? (
              <span className="badge vacant">
                <span className="dot" />
                active
              </span>
            ) : (
              <span className="badge occupied">
                <span className="dot" />
                unassigned
              </span>
            )}
          </div>
          <div className="mt">
            {assignedWaker ? (
              <div className="row-item">
                <span
                  className="avatar"
                  style={{
                    background: `linear-gradient(140deg, ${gradientFor(assignedWaker.name)[0]}, ${gradientFor(assignedWaker.name)[1]})`,
                  }}
                >
                  {initials(assignedWaker.name)}
                </span>
                <div className="row-main">
                  <strong>
                    {assignedWaker.name} <span className="tag">on duty</span>
                  </strong>
                  <span className="sub">
                    Randomly chosen from {pool.length} volunteer{pool.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty">No waker assigned yet.</div>
            )}
          </div>

          {isAssigned && (
            <div className="banner amber mt" style={{ marginBottom: 0 }}>
              <span className="icon">🫵</span>
              <p>
                <strong>The duty is yours</strong>
                <span className="sub">
                  Stuck in a meeting at the wake-up time? Decline and it goes straight to another
                  volunteer.
                </span>
              </p>
            </div>
          )}

          <button
            className="btn btn-primary mt"
            style={{ width: '100%' }}
            onClick={handleAssign}
            disabled={busy || pool.length === 0}
          >
            {busy ? <span className="spin" /> : '🎲 Randomly assign a waker'}
          </button>
          {pool.length === 0 && (
            <div className="muted" style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              At least one person must sign up first.
            </div>
          )}

          {isAssigned && (
            <button
              className="btn btn-ghost mt"
              style={{ width: '100%' }}
              onClick={handleDecline}
              disabled={declining}
            >
              {declining ? <span className="spin" /> : '🙅 I can’t — pass it on'}
            </button>
          )}
        </div>

        <div className="card">
          <div className="pod-head">
            <h3 style={{ margin: 0 }}>Volunteer pool</h3>
            <span className="tag">{pool.length}</span>
          </div>
          <div className="mt list">
            {pool.length === 0 ? (
              <div className="empty">No volunteers yet — be the first!</div>
            ) : (
              pool.map((v) => {
                const me = v.id === currentUser?.id;
                return (
                  <div className="row-item" key={v.id}>
                    <span
                      className="avatar"
                      style={{
                        background: `linear-gradient(140deg, ${gradientFor(v.name)[0]}, ${gradientFor(v.name)[1]})`,
                      }}
                    >
                      {initials(v.name)}
                    </span>
                    <div className="row-main">
                      <strong>
                        {v.name}
                        {v.id === assignedWaker?.id && <span className="tag">on duty</span>}
                        {v.declined && v.id !== assignedWaker?.id && (
                          <span className="tag danger">declined this round</span>
                        )}
                      </strong>
                    </div>
                    {me && (
                      <button className="btn btn-ghost btn-sm" onClick={handleResign}>
                        Resign
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="mt">
            {currentIsWaker ? (
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleResign}>
                ✌️ Remove me from the pool
              </button>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSignup}>
                🙋 I'll wake a teammate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="section-title">Needs waking (time is up)</div>
      {wakeList.length === 0 ? (
        <div className="card">
          <div className="empty">
            🌿 No one is over their time right now. Nappers who exceed their scheduled time will
            appear here.
          </div>
        </div>
      ) : (
        <>
          <div className="list">
            {wakeList.map((r) => {
              const overFor = minutesFromNow(new Date(r.endMs).getTime());
              const canWake = isAssigned;
              return (
                <div className="row-item" key={r.id}>
                  <span
                    className="avatar"
                    style={{
                      background: `linear-gradient(140deg, ${gradientFor(r.name)[0]}, ${gradientFor(r.name)[1]})`,
                    }}
                  >
                    {initials(r.name)}
                  </span>
                  <div className="row-main">
                    <strong>
                      {r.name}
                      <span className="tag danger">time up</span>
                    </strong>
                    <span className="sub">
                      {podName(state, r.podId)} · over by {overFor}
                      {r.note ? ` · “${r.note}”` : ''}
                    </span>
                  </div>
                  <div className="row-side">
                    {canWake ? (
                      <button className="btn btn-moss btn-sm" onClick={() => handleWake(r.id)}>
                        🌅 Wake up
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-moss btn-sm"
                          style={{ opacity: 0.4 }}
                          disabled
                          title="Only the assigned waker can wake them"
                        >
                          🌅 Wake up
                        </button>
                        {assignedWaker && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 6 }}
                            onClick={() => setCurrentUser(assignedWaker.id)}
                            title={`Switch to ${assignedWaker.name} to wake them`}
                          >
                            👤 Act as {assignedWaker.name}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!assignedWaker && (
            <div className="banner amber mt" style={{ marginBottom: 0 }}>
              <span className="icon">⚠️</span>
              <p>
                <strong>No volunteer is on duty right now</strong>
                <span className="sub">Assign a waker above so someone covers these nappers.</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function podName(state, podId) {
  return state?.pods?.find((p) => p.id === podId)?.name || podId;
}
