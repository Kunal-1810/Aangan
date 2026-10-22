import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MapView from '../components/MapView.jsx';

const inr = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const blank = { city: '', listingType: '', maxPrice: '', bedrooms: '', furnished: '', sort: 'newest' };

export default function Home() {
  const [q, setQ] = useState(blank);
  const [applied, setApplied] = useState(blank);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [state, setState] = useState('loading');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    setState('loading');
    const params = Object.fromEntries(Object.entries(applied).filter(([, v]) => v));
    api('/properties?' + new URLSearchParams({ ...params, page, limit: 6 }))
      .then(d => { setData(d); setState('ok'); })
      .catch(() => setState('error'));
  }, [applied, page]);

  const set = k => e => setQ({ ...q, [k]: e.target.value });
  const search = e => { e.preventDefault(); setPage(1); setApplied(q); };

  return (
    <>
      <section className="hero">
        <h1>Find a place to rent or buy.</h1>
        <p className="muted">Browse homes posted directly by their owners.</p>
        <form className="search" onSubmit={search}>
          <input aria-label="City" placeholder="City" value={q.city} onChange={set('city')} />
          <select aria-label="Listing type" value={q.listingType} onChange={set('listingType')}>
            <option value="">Rent or buy</option><option value="rent">For rent</option><option value="sale">For sale</option>
          </select>
          <input aria-label="Maximum price" type="number" min="0" placeholder="Max price (₹)" value={q.maxPrice} onChange={set('maxPrice')} />
          <button className="btn solid">Search</button>
        </form>
        <div className="filters">
          <select aria-label="Bedrooms" value={q.bedrooms} onChange={set('bedrooms')}>
            <option value="">Any bedrooms</option><option value="1">1+ beds</option><option value="2">2+ beds</option><option value="3">3+ beds</option>
          </select>
          <select aria-label="Furnishing" value={q.furnished} onChange={set('furnished')}>
            <option value="">Any furnishing</option><option value="furnished">Furnished</option><option value="semi">Semi-furnished</option><option value="unfurnished">Unfurnished</option>
          </select>
          <select aria-label="Sort" value={q.sort} onChange={set('sort')}>
            <option value="newest">Newest first</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option>
          </select>
          <span className="muted">Press Search to apply filters</span>
        </div>
      </section>

      <section className="results layout">
        <div>
          {state === 'loading' && <p className="muted">Loading listings…</p>}
          {state === 'error' && <p className="error">Couldn't load listings. Check that the API is running and MONGODB_URI is set.</p>}
          {state === 'ok' && data.items.length === 0 && <p className="muted">No properties match yet. Try a wider budget or another city.</p>}
          {state === 'ok' && data.items.length > 0 && <p className="muted">{data.total} {data.total === 1 ? 'property' : 'properties'}. The map shows this page.</p>}
          <div className="cards">
            {data.items.map(p => (
              <article className="card" key={p._id} onMouseEnter={() => setHover(p._id)} onMouseLeave={() => setHover(null)}>
                <Link to={`/property/${p._id}`} aria-label={p.title}>
                  {p.images?.[0] ? <img className="photo" src={p.images[0]} alt="" /> : <div className="photo" aria-hidden="true" />}
                </Link>
                <div className="body">
                  <b className="price">{inr(p.price)}{p.listingType === 'rent' && ' / mo'}</b>
                  <h2><Link to={`/property/${p._id}`}>{p.title}</Link></h2>
                  <p className="muted">{[p.locality, p.city].filter(Boolean).join(', ')}</p>
                  <p className="meta">
                    <span>{p.bedrooms} bed</span><span>{p.bathrooms} bath</span>
                    {p.areaSqft && <span>{p.areaSqft} sq ft</span>}<span>{p.furnished}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="muted">Page {page} of {data.pages}</span>
              <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
        <aside className="mapwrap">
          <MapView items={data.items} activeId={hover} />
        </aside>
      </section>
    </>
  );
}
