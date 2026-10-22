import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import MapView from '../components/MapView.jsx';

const inr = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const day = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [state, setState] = useState('loading');
  const [shot, setShot] = useState(0);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const [inq, setInq] = useState([]);

  const canSee = !!(p && user && (String(p.owner?._id) === String(user.id) || user.role === 'admin'));

  useEffect(() => {
    setState('loading');
    setShot(0);
    api('/properties/' + id).then(d => { setP(d); setState('ok'); }).catch(() => setState('error'));
  }, [id]);

  useEffect(() => {
    if (canSee) api(`/properties/${id}/inquiries`).then(setInq).catch(() => {});
  }, [canSee, id]);

  if (state === 'loading') return <p className="muted pad">Loading property…</p>;
  if (state === 'error') {
    return (
      <div className="panel narrow">
        <h1>Property not found</h1>
        <p className="muted">It may have been removed.</p>
        <Link className="btn solid" to="/">Back to listings</Link>
      </div>
    );
  }

  const send = async e => {
    e.preventDefault();
    setErr('');
    try {
      await api(`/properties/${id}/inquiries`, { method: 'POST', body: { message: msg } });
      setSent(true);
      setMsg('');
    } catch (x) {
      setErr(x.message);
    }
  };

  const imgs = p.images || [];
  const facts = [
    ['Type', p.propertyType], ['Bedrooms', p.bedrooms], ['Bathrooms', p.bathrooms],
    ['Area', p.areaSqft ? `${p.areaSqft} sq ft` : 'Not listed'], ['Furnishing', p.furnished],
    ['Listed on', day(p.createdAt)]
  ];

  return (
    <>
      <Link to="/" className="back">Back to listings</Link>
      <div className="detail">
        <div>
          {imgs.length ? <img className="shot" src={imgs[shot]} alt={`${p.title}, photo ${shot + 1}`} /> : <div className="shot" aria-hidden="true" />}
          {imgs.length > 1 && (
            <div className="thumbs">
              {imgs.map((src, i) => (
                <button key={src} type="button" className={i === shot ? 'on' : ''} aria-label={`Show photo ${i + 1}`} onClick={() => setShot(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
          <h1 style={{ marginTop: 20 }}>{p.title}</h1>
          <p className="muted">{[p.locality, p.city].filter(Boolean).join(', ')}</p>
          <div className="facts">
            {facts.map(([k, v]) => <div className="fact" key={k}><span>{k}</span><b>{v}</b></div>)}
          </div>
          {p.description && (<><h2>About this property</h2><p className="muted" style={{ maxWidth: '65ch', lineHeight: 1.6 }}>{p.description}</p></>)}
          {p.lat != null && p.lng != null && (<><h2 style={{ marginTop: 24 }}>Location</h2><MapView items={[p]} small /></>)}
        </div>

        <aside className="side">
          <div className="panel">
            <b className="price" style={{ fontSize: 30 }}>{inr(p.price)}{p.listingType === 'rent' && ' / mo'}</b>
            <p className="muted">{p.listingType === 'rent' ? 'For rent' : 'For sale'} · Posted by {p.owner?.name || 'the owner'}</p>
            {!user && <p>Sign in to message the owner.</p>}
            {!user && <Link className="btn solid" to="/login">Sign in</Link>}
            {user && canSee && String(p.owner?._id) === String(user.id) && <p className="muted">This is your listing.</p>}
            {user && !(String(p.owner?._id) === String(user.id)) && (
              sent ? <p role="status">Message sent. The owner can read it on this listing.</p> : (
                <form onSubmit={send} className="panel" style={{ padding: 0, border: 0, background: 'none' }}>
                  <label>Message to the owner
                    <textarea rows="4" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Hi, is this still available? I'd like to visit this weekend." required minLength={5} />
                  </label>
                  {err && <p className="error" role="alert">{err}</p>}
                  <button className="btn solid">Send message</button>
                </form>
              )
            )}
          </div>
          {canSee && (
            <div className="panel">
              <h2>Inquiries ({inq.length})</h2>
              {inq.length === 0 && <p className="muted">No messages yet.</p>}
              {inq.map(i => (
                <div className="inq" key={i._id}>
                  <b>{i.sender?.name}</b> <span className="muted">{i.sender?.email} · {day(i.createdAt)}</span>
                  <p style={{ margin: '6px 0 0' }}>{i.message}</p>
                </div>
              ))}
            </div>
          )}
          <p className="muted">{p.views} views</p>
        </aside>
      </div>
    </>
  );
}
