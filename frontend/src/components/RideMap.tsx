import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export interface MapStop {
  id: string;
  label: string;
  detail?: string;
  lat: number;
  lng: number;
  tone?: 'pickup' | 'clinic' | 'rural' | 'hub';
}

interface RideMapProps {
  title: string;
  subtitle?: string;
  pickup?: MapStop;
  destination?: MapStop;
  extras?: MapStop[];
  confirmed?: boolean;
  height?: number;
}

const TONE_COLOR: Record<NonNullable<MapStop['tone']>, string> = {
  pickup: '#F472B6',
  clinic: '#8B5CF6',
  rural: '#FBBF24',
  hub: '#34D399',
};

const isTestEnv =
  import.meta.env.MODE === 'test' ||
  (typeof process !== 'undefined' && Boolean(process.env.VITEST));

export const RideMap: React.FC<RideMapProps> = (props) => {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || typeof window.IntersectionObserver !== 'function') return undefined;

    let observer: IntersectionObserver | null = null;
    try {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setNearViewport(true);
          observer?.unobserve(entry.target);
        },
        { rootMargin: '250px 0px', threshold: 0.01 },
      );
      observer.observe(boundary);
    } catch {
      observer?.disconnect();
      observer = null;
    }

    return () => observer?.disconnect();
  }, []);

  return (
    <div ref={boundaryRef} className="ride-map-boundary">
      {nearViewport ? <DeferredRideMap {...props} /> : <MapFallback {...props} />}
    </div>
  );
};

const DeferredRideMap: React.FC<RideMapProps> = (props) => {
  const [live, setLive] = useState<null | typeof import('react-leaflet')>(null);

  useEffect(() => {
    if (isTestEnv) return;
    let cancelled = false;
    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const reactLeaflet = await import('react-leaflet');
        if (!cancelled) setLive(reactLeaflet);
      } catch {
        if (!cancelled) setLive(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!live) {
    return <MapFallback {...props} />;
  }

  return <LiveLeafletMap api={live} {...props} />;
};

const LiveLeafletMap: React.FC<RideMapProps & { api: typeof import('react-leaflet') }> = ({
  api,
  title,
  subtitle,
  pickup,
  destination,
  extras = [],
  confirmed = false,
  height = 280,
}) => {
  const { MapContainer, TileLayer, Popup, Polyline, CircleMarker } = api;
  const stops = [pickup, destination, ...extras].filter(Boolean) as MapStop[];
  const center = useMemo<[number, number]>(() => {
    if (!stops.length) return [30.0, -91.2];
    const lat = stops.reduce((sum, stop) => sum + stop.lat, 0) / stops.length;
    const lng = stops.reduce((sum, stop) => sum + stop.lng, 0) / stops.length;
    return [lat, lng];
  }, [stops]);

  return (
    <div className="card-sticker overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-ink bg-sun/40">
        <div>
          <div className="font-heading font-bold text-ink">{title}</div>
          {subtitle && <p className="text-xs text-muted-fg">{subtitle}</p>}
        </div>
        <span className="icon-bubble w-8 h-8 bg-white">
          <Navigation className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </div>
      <div style={{ height }} className="relative">
        <MapContainer
          center={center}
          zoom={stops.length > 3 ? 6.4 : 12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pickup && destination && (
            <Polyline
              positions={[[pickup.lat, pickup.lng], [destination.lat, destination.lng]]}
              pathOptions={{
                color: confirmed ? '#34D399' : '#FBBF24',
                weight: 5,
                dashArray: confirmed ? undefined : '8 8',
              }}
            />
          )}
          {stops.map((stop) => (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lng]}
              radius={10}
              pathOptions={{
                color: '#1E293B',
                weight: 3,
                fillColor: TONE_COLOR[stop.tone || 'hub'],
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>{stop.label}</strong>
                {stop.detail && <div>{stop.detail}</div>}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

const MapFallback: React.FC<RideMapProps> = ({
  title,
  subtitle,
  pickup,
  destination,
  extras = [],
  confirmed = false,
  height = 280,
}) => {
  const stops = [pickup, destination, ...extras].filter(Boolean) as MapStop[];

  return (
    <div className="card-sticker overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-ink bg-sun/40">
        <div>
          <div className="font-heading font-bold text-ink">{title}</div>
          {subtitle && <p className="text-xs text-muted-fg">{subtitle}</p>}
        </div>
        <span className="icon-bubble w-8 h-8 bg-white">
          <MapPin className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </div>
      <div className="relative bg-[#E8F4F0]" style={{ height }}>
        <svg viewBox="0 0 640 320" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <path d="M40 220 C 120 140, 220 260, 320 180 S 500 80, 600 140" fill="none" stroke="#94A3B8" strokeWidth="18" />
          <path d="M80 80 C 180 40, 240 160, 360 90 S 520 40, 600 90" fill="none" stroke="#CBD5E1" strokeWidth="10" />
          {pickup && destination && (
            <path
              d="M160 210 C 240 160, 320 150, 470 120"
              fill="none"
              stroke={confirmed ? '#34D399' : '#FBBF24'}
              strokeWidth="6"
              strokeDasharray={confirmed ? '0' : '10 8'}
              strokeLinecap="round"
            />
          )}
          <circle cx="160" cy="210" r="14" fill="#F472B6" stroke="#1E293B" strokeWidth="3" />
          <circle cx="470" cy="120" r="14" fill="#8B5CF6" stroke="#1E293B" strokeWidth="3" />
          <circle cx="280" cy="250" r="10" fill="#FBBF24" stroke="#1E293B" strokeWidth="3" />
        </svg>
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {stops.slice(0, 4).map((stop) => (
            <span key={stop.id} className="px-2.5 py-1 rounded-full bg-white border-2 border-ink text-[11px] font-heading font-bold">
              {stop.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NEW_ORLEANS_PICKUP: MapStop = {
  id: 'pickup',
  label: 'Pickup area',
  detail: '1420 St. Charles Ave',
  lat: 29.9418,
  lng: -90.0782,
  tone: 'pickup',
};

export const BENSON_CENTER: MapStop = {
  id: 'clinic',
  label: 'Benson Cancer Center',
  detail: 'Infusion Suite B',
  lat: 29.9608,
  lng: -90.1458,
  tone: 'clinic',
};

export const LOUISIANA_SITES: MapStop[] = [
  { id: 'nola', label: 'New Orleans hub', lat: 29.9511, lng: -90.0715, tone: 'hub' },
  { id: 'br', label: 'Baton Rouge', lat: 30.4515, lng: -91.1871, tone: 'hub' },
  { id: 'lafayette', label: 'Lafayette', lat: 30.2241, lng: -92.0198, tone: 'hub' },
  { id: 'houma', label: 'Houma / Terrebonne', lat: 29.5958, lng: -90.7195, tone: 'rural' },
  { id: 'monroe', label: 'Monroe', lat: 32.5093, lng: -92.1193, tone: 'rural' },
  { id: 'lake', label: 'Lake Charles', lat: 30.2266, lng: -93.2174, tone: 'rural' },
];
