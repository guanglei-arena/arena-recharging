import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { api } from './api.js';
import TopBar from './components/TopBar.jsx';
import Home from './pages/Home.jsx';
import Nap from './pages/Nap.jsx';
import Wake from './pages/Wake.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Sleeping from './pages/Sleeping.jsx';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const DEFAULT_USER_ID = 'u-weilin';
const POLL_MS = 5000;

export default function App() {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_USER_ID);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getState();
      setState(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll so statuses (time-up, pod occupancy) stay live.
  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // A lightweight "something changed" signal; the polling loop keeps state fresh.
  const notify = useCallback(() => refresh(), []);

  const currentUser =
    (state?.users || []).find((u) => u.id === currentUserId) || (state?.users || [])[0] || null;

  const value = {
    state,
    error,
    refresh,
    notify,
    currentUser,
    setCurrentUser: setCurrentUserId,
    currentUserId: currentUser?.id,
  };

  return (
    <AppContext.Provider value={value}>
      <div className="app">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nap" element={<Nap />} />
          <Route path="/sleep" element={<Sleeping />} />
          <Route path="/wake" element={<Wake />} />
          <Route path="/how" element={<HowItWorks />} />
        </Routes>
        <div className="footer">
          <div style={{ marginBottom: 6 }}>🌿 Arena Pause · sleep pod recharging for teams</div>
          <div>Request a nap · volunteer to wake a teammate · tap “I'm awake” when you are up</div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
