import { useState } from 'react';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import { gradientFor, initials, minutesFromNow } from '../lib.js';

export default function Wake() {
  const { state, currentUser, setCurrentUser, refresh, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const wakeList = state?.wakeList || [];
  const signups = state?.wakerSignups || []; // array of names
  const assignedWaker = state?.assignedWaker;
  const currentIsWaker = signups.includes(currentUser?.name);
  const isAssigned = assignedWaker?.id === currentUser?.id;

  const wakerUser = (name) => (state?.users || []).find((u) => u.name === name);

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

  // Reject offer (e.g. volunteer is in a meeting during wake up time) -> auto-reassigns to another volunteer
  async function handleRejectOffer(wakerId) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await api.rejectWakerDuty(wakerId);
      await refresh();
      notify();
      if (result.assignedWaker) {
        setNotice({
          kind: 'green',
          icon: '🔄',
          text: `Offer declined. Wake-up duty was automatically reassigned to ${result.assignedWaker.name}!`,
        });
      } else {
        setNotice({
          kind: 'amber',
          icon: 'ℹ️',
          text: 'Offer declined. There are no other volunteers currently in the pool.',
        });
      }
    } catch (err) {
      setNotice({ kind: 'amber', icon: '⚠️', text: err.message });
    } finally {
      setBusy(false);
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
        <h1>Volunteer to Wake Teammates</h1>
        <p>
          Sign up to be a wake-up buddy. One volunteer is <strong>randomly chosen</strong> to wake
          teammates whose nap time is up. If you have a meeting, you can decline to automatically reassign.
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
              <div>
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
                      Selected from {signups.length} volunteer{signups.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Reject the offer (conflict / in a meeting) */}
                <div className="conflict-box mt">
                  {isAssigned ? (
                    <div>
                      <div className="conflict-text">
                        🗓️ <strong>In a meeting during wake time?</strong> You can decline the offer, and Arena Pause will automatically assign duty to another volunteer.
                      </div>
                      <button
                        className="btn btn-coral"
                        style={{ width: '100%', marginTop: 8 }}
                        onClick={() => handleRejectOffer(assignedWaker.id)}
                        disabled={busy}
                      >
                        {busy ? <span className="spin" /> : '🚫 In a meeting — Decline offer & reassign'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="conflict-text">
                        🗓️ <strong>Scheduling conflict?</strong> If {assignedWaker.name} is in a meeting, decline below to automatically reassign:
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-coral btn-sm"
                          onClick={() => handleRejectOffer(assignedWaker.id)}
                          disabled={busy}
                          title={`Decline and auto-reassign to another volunteer`}
                        >
                          {busy ? <span className="spin" /> : `🚫 Decline for ${assignedWaker.name} (in meeting)`}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setCurrentUser(assignedWaker.id)}
                        >
                          Switch to {assignedWaker.name}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty">No waker assigned yet.</div>
            )}
          </div>
          <button
            className="btn btn-primary mt"
            style={{ width: '100%' }}
            onClick={handleAssign}
            disabled={busy || signups.length === 0}
          >
            {busy ? <span className="spin" /> : '🎲 Randomly assign a waker'}
          </button>
          {signups.length === 0 && (
            <div className="muted" style={{ fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              At least one person must sign up first.
            </div>
          )}
        </div>

        <div className="card">
          <div className="pod-head">
            <h3 style={{ margin: 0 }}>Volunteer pool</h3>
            <span className="tag">{signups.length}</span>
          </div>
          <div className="mt list">
            {signups.length === 0 ? (
              <div className="empty">No volunteers yet — be the first!</div>
            ) : (
              signups.map((name) => {
                const u = wakerUser(name);
                const me = u?.id === currentUser?.id;
                return (
                  <div className="row-item" key={name}>
                    <span
                      className="avatar"
                      style={{
                        background: `linear-gradient(140deg, ${gradientFor(name)[0]}, ${gradientFor(name)[1]})`,
                      }}
                    >
                      {initials(name)}
                    </span>
                    <div className="row-main">
                      <strong>
                        {name}
                        {u?.id === assignedWaker?.id && <span className="tag">on duty</span>}
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
            🎉 No one is over their time right now. Nappers who exceed their scheduled time will
            appear here.
          </div>
        </div>
      ) : (
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
                    <span className="tag danger" style={{ background: 'rgba(196,91,58,0.14)', color: 'var(--coral)' }}>
                      time up
                    </span>
                  </strong>
                  <span className="sub">
                    {podName(state, r.podId)} · over by {overFor}
                    {r.note ? ` · “${r.note}”` : ''}
                  </span>
                </div>
                <div className="row-side">
                  {canWake ? (
                    <button
                      className="btn btn-green btn-sm"
                      onClick={() => handleWake(r.id)}
                    >
                      🌅 Wake up
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-green btn-sm"
                        style={{ opacity: 0.4 }}
                        disabled
                        title="Only the assigned waker can wake them"
                      >
                        🌅 Wake up
                      </button>
                      {assignedWaker && (
                        <button
                          className="btn btn-ghost btn-sm mt"
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
      )}
    </div>
  );
}

function podName(state, podId) {
  return state?.pods?.find((p) => p.id === podId)?.name || podId;
}
