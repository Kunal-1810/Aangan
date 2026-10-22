import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import LocationPicker from '../components/LocationPicker.jsx';

const init = { title: '', listingType: 'rent', propertyType: 'apartment', price: '', bedrooms: 2, bathrooms: 1, areaSqft: '', furnished: 'unfurnished', city: '', locality: '', images: '', description: '', lat: '', lng: '' };

export default function PostProperty() {
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState(init);
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });

  if (!ready) return null;
  if (!user || !['owner', 'admin'].includes(user.role)) {
    return <div className="panel narrow"><h1>Owners only</h1><p className="muted">Sign in with an owner account to post a property.</p></div>;
  }

  const submit = async e => {
    e.preventDefault();
    setErr('');
    try {
      await api('/properties', {
        method: 'POST',
        body: {
          ...f,
          price: Number(f.price),
          bedrooms: Number(f.bedrooms),
          bathrooms: Number(f.bathrooms),
          areaSqft: Number(f.areaSqft) || undefined,
          images: f.images.split(',').map(s => s.trim()).filter(Boolean),
          lat: f.lat === '' ? undefined : f.lat,
          lng: f.lng === '' ? undefined : f.lng
        }
      });
      nav('/');
    } catch (x) {
      setErr(x.message);
    }
  };

  const T = (k, label, props = {}) => <label>{label}<input value={f[k]} onChange={set(k)} {...props} /></label>;

  return (
    <form className="panel" onSubmit={submit}>
      <h1>Post a property</h1>
      <div className="grid2">
        {T('title', 'Title', { required: true, placeholder: '2 BHK apartment near the metro' })}
        <label>Listing type
          <select value={f.listingType} onChange={set('listingType')}><option value="rent">For rent</option><option value="sale">For sale</option></select>
        </label>
        {T('price', f.listingType === 'rent' ? 'Rent per month (₹)' : 'Price (₹)', { type: 'number', min: 0, required: true })}
        <label>Property type
          <select value={f.propertyType} onChange={set('propertyType')}>
            {['apartment', 'villa', 'house', 'plot', 'commercial'].map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        {T('city', 'City', { required: true })}
        {T('locality', 'Locality')}
        {T('bedrooms', 'Bedrooms', { type: 'number', min: 0 })}
        {T('bathrooms', 'Bathrooms', { type: 'number', min: 0 })}
        {T('areaSqft', 'Area (sq ft)', { type: 'number', min: 0 })}
        <label>Furnishing
          <select value={f.furnished} onChange={set('furnished')}><option value="furnished">Furnished</option><option value="semi">Semi-furnished</option><option value="unfurnished">Unfurnished</option></select>
        </label>
      </div>
      <LocationPicker
        value={f.lat === '' ? null : { lat: f.lat, lng: f.lng }}
        onPick={({ lat, lng }) => setF(s => ({ ...s, lat, lng }))}
        query={[f.locality, f.city].filter(Boolean).join(', ')}
      />
      {T('images', 'Image links (comma separated)', { placeholder: 'https://…' })}
      <label>Description<textarea rows="4" value={f.description} onChange={set('description')} /></label>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn solid">Publish listing</button>
    </form>
  );
}
