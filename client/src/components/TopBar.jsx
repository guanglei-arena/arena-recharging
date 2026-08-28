import { NavLink } from 'react-router-dom';
import { useApp } from '../App.jsx';
import Notifications from './Notifications.jsx';
import UserSwitcher from './UserSwitcher.jsx';

export default function TopBar() {
  const { state, currentUser } = useApp();
  const podsVacant = (state?.pods || []).filter((p) => p.status === 'vacant').length;

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="logo">🌿</span>
        <span>Arena Pause</span>
      </NavLink>

      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/nap">Request a Nap</NavLink>
        <NavLink to="/wake">Wake a Teammate</NavLink>
        <NavLink to="/how-it-works">How It Works</NavLink>
      </nav>

      <div className="topbar-right">
        <span className="pill">🛏 {podsVacant} pod{podsVacant === 1 ? '' : 's'} free</span>
        <Notifications />
        <UserSwitcher user={currentUser} />
      </div>
    </header>
  );
}
