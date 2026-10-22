import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { AuthCtx } from './auth.js';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import PostProperty from './pages/PostProperty.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => {}).finally(() => setReady(true));
  }, []);

  const logout = async () => {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
    nav('/');
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, ready }}>
      <header className="nav">
        <Link to="/" className="brand"><span className="mark"><i /></span>Aangan</Link>
        <nav>
          {user ? (
            <>
              <span className="muted">Hi, {user.name.split(' ')[0]}</span>
              {['owner', 'admin'].includes(user.role) && <Link to="/post" className="btn solid">Post property</Link>}
              <button className="btn ghost" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost">Sign in</Link>
              <Link to="/register" className="btn solid">Create account</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/post" element={<PostProperty />} />
        </Routes>
      </main>
    </AuthCtx.Provider>
  );
}
