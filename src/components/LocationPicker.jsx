import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const here = L.divIcon({ className: '', html: '<span class="pin on">Here</span>', iconSize: [0, 0] });

function Clicks({ onPick }) { useMapEvents({ click: e => onPick(e.latlng) }); return null; }
function Fly({ to }) { const map = useMap(); useEffect(() => { if (to) map.flyTo(to, 13); }, [to, map]); return null; }

export default function LocationPicker({ value, onPick, query }) {
  const [fly, setFly] = useState(null);
  const [msg, setMsg] = useState('');

  const locate = async () => {
    setMsg('');
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query + ', India'));
      const [hit] = await res.json();
      if (!hit) return setMsg("Couldn't find that place. Click the map to set the pin instead.");
      const pos = [Number(hit.lat), Number(hit.lon)];
      setFly(pos);
      onPick({ lat: pos[0], lng: pos[1] });
    } catch {
      setMsg('Place search is unavailable. Click the map to set the pin instead.');
    }
  };

  return (
    <div className="picker">
      <div className="picker-bar">
        <span className="muted">Location: click the map to drop a pin</span>
        <button type="button" className="btn ghost" disabled={!query} onClick={locate}>Find city on map</button>
      </div>
      <MapContainer center={value ? [value.lat, value.lng] : [22.5, 79]} zoom={value ? 13 : 4} className="map small">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Clicks onPick={onPick} />
        <Fly to={fly} />
        {value && <Marker position={[value.lat, value.lng]} icon={here} />}
      </MapContainer>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}
