import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function short(n) {
  if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(1) + ' L';
  if (n >= 1e4) return '₹' + Math.round(n / 1000) + 'k';
  return '₹' + n;
}

function makeIcon(p, on) {
  return L.divIcon({
    className: '',
    html: '<span class="pin' + (on ? ' on' : '') + '">' + short(p.price) + '</span>',
    iconSize: [0, 0],
  });
}

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

const USE_TEST_DATA = true;

const testItems = [
  { _id: '1', title: '2 BHK near the metro', price: 32000, city: 'Bengaluru', locality: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { _id: '2', title: '3 BHK villa', price: 48000, city: 'Bengaluru', locality: 'Whitefield', lat: 12.9698, lng: 77.75 },
  { _id: '3', title: '2 BHK flat for sale', price: 12000000, city: 'Bengaluru', locality: 'HSR Layout', lat: 12.9116, lng: 77.6474 },
  { _id: '4', title: '1 BHK with lake view', price: 38000, city: 'Mumbai', locality: 'Powai', lat: 19.1176, lng: 72.906 },
  { _id: '5', title: '3 BHK apartment', price: 18500000, city: 'Delhi', locality: 'Dwarka', lat: 28.5921, lng: 77.046 },
  { _id: '6', title: '2 BHK tech corridor', price: 28000, city: 'Hyderabad', locality: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
  { _id: '7', title: '4 BHK house', price: 34000000, city: 'Pune', locality: 'Koregaon Park', lat: 18.5362, lng: 73.8939 },
  { _id: '8', title: '1 BHK flat', price: 14000, city: 'Noida', locality: 'Sector 62', lat: 28.6271, lng: 77.3649 },
  { _id: '9', title: 'Residential plot', price: 4500000, city: 'Jaipur', locality: 'Mansarovar', lat: 26.8512, lng: 75.7634 },
  { _id: '10', title: 'Ground-floor shop', price: 55000, city: 'Chandigarh', locality: 'Sector 17', lat: 30.7416, lng: 76.7841 },
];

export default function MapView({ items = [], activeId, small }) {
  const source = USE_TEST_DATA ? testItems : items;

  const located = useMemo(() => {
    return source.filter(p => p.lat != null && p.lng != null);
  }, [source]);

  const points = useMemo(() => {
    return located.map(p => [Number(p.lat), Number(p.lng)]);
  }, [located]);

  const markers = located.map(p => {
    const on = p._id === activeId;
    return (
      <Marker
        key={p._id}
        position={[Number(p.lat), Number(p.lng)]}
        icon={makeIcon(p, on)}
        zIndexOffset={on ? 1000 : 0}
      >
        <Popup>
          <b>{p.title}</b>
          <br />
          {[p.locality, p.city].filter(Boolean).join(', ')}
        </Popup>
      </Marker>
    );
  });

  return (
    <MapContainer
      center={[22.5, 79]}
      zoom={4}
      className={small ? 'map small' : 'map'}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit points={points} />
      {markers}
    </MapContainer>
  );
}