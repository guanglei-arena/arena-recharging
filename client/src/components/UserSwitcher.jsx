import { useApp } from '../App.jsx';
import { gradientFor, initials } from '../lib.js';

export default function UserSwitcher({ user }) {
  const { state, setCurrentUser, notify } = useApp();
  const users = state?.users || [];

  if (!user) {
    return (
      <div className="user-chip">
        <span className="avatar" style={{ background: gradientFor('?') }}>
          {initials('?')}
        </span>
        <select disabled>
          <option>Loading…</option>
        </select>
      </div>
    );
  }

  return (
    <div className="user-chip">
      <span
        className="avatar"
        style={{
          background: `linear-gradient(140deg, ${gradientFor(user.name)[0]}, ${gradientFor(user.name)[1]})`,
        }}
      >
        {initials(user.name)}
      </span>
      <select
        value={user.id}
        onChange={(e) => {
          setCurrentUser(e.target.value);
          notify();
        }}
        aria-label="Switch current user"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
