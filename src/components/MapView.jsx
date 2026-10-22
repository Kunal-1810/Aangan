import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const short = n => n >= 1e7 ? `₹${+(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${+(n / 1e5).toFixed(1)} L` : n >= 1e4 ? `₹${Math.round(n / 1000)}k` : `₹${n}`;
const icon = (p, on) => L.divIcon({ className: '', html: `<span class="pin${on ? ' on' : ''}">${short(p.price)}</span>`, iconSize: [0, 0] });

function Fit({ points }) {
  const map = useMap();
  useEffect(() => { if (points.length) map.fitBounds(points, { padding: [50, 50], maxZoom: 14 }); }, [points, map]);
  return null;
}

export default function MapView({ items, activeId, small }) {
  const located = useMemo(() => items.filter(p => p.lat != null && p.lng != null), [items]);
  const points = useMemo(() => located.map(p => [p.lat, p.lng]), [located]);
  return (
    <MapContainer center={[22.5, 79]} zoom={4} className={small ? 'map small' : 'map'} scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Fit points={points} />
      {located.map(p => (
        <Marker key={p._id} position={[p.lat, p.lng]} icon={icon(p, p._id === activeId)} zIndexOffset={p._id === activeId ? 1000 : 0}>
          <Popup><b>{p.title}</b><br />{[p.locality, p.city].filter(Boolean).join(', ')}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
