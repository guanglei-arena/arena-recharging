import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App.jsx';
import { api } from '../api.js';
import { minutesFromNow } from '../lib.js';

export default function Notifications() {
  const { state, currentUser, refresh } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const myNotifs = (state?.notifications || []).filter((n) => n.userId === currentUser?.id);
  const unread = myNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0 && currentUser) {
      await api.markNotificationsRead(currentUser.id);
      refresh();
    }
  }

  if (!currentUser) return null;

  const icons = {
    'wake-duty': '🔔',
    'wake-needed': '⏰',
    awake: '🌅',
    'wake-declined': '🙅',
    info: '💡',
  };

  return (
    <div className="bell-wrap" ref={wrapRef}>
      <button className="bell" onClick={toggle} aria-label="Notifications">
        🔔
        {unread > 0 && <span className="count">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          {myNotifs.length === 0 ? (
            <div className="empty">No notifications yet.</div>
          ) : (
            myNotifs.map((n) => (
              <div key={n.id} className={`notif ${n.read ? '' : 'unread'}`}>
                <span className="n-icon">{icons[n.type] || icons.info}</span>
                <div>
                  <strong>{n.title}</strong>
                  <div>{n.message}</div>
                  <div className="n-sub">{minutesFromNow(new Date(n.createdAt).getTime())}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
