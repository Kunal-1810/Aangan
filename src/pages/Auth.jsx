import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';

export default function Auth({ mode }) {
  const isReg = mode === 'register';
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'user' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      setUser(await api(isReg ? '/auth/register' : '/auth/login', { method: 'POST', body: f }));
      nav('/');
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>{isReg ? 'Create your account' : 'Sign in'}</h1>
      {isReg && <label>Full name<input value={f.name} onChange={set('name')} required /></label>}
      <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
      <label>Password<input type="password" minLength={6} value={f.password} onChange={set('password')} required /></label>
      {isReg && (
        <label>I want to
          <select value={f.role} onChange={set('role')}>
            <option value="user">Find a property</option>
            <option value="owner">List my property</option>
          </select>
        </label>
      )}
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn solid" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Sign in'}</button>
      <p className="muted">
        {isReg ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
      </p>
    </form>
  );
}
