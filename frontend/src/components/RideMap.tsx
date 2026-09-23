import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { pointAlongRoute } from '../data/routes';

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
  staticOnly?: boolean;
  /** Street-following path as [lat, lng] pairs; falls back to a straight pickup–destination line. */
  route?: ReadonlyArray<readonly [number, number]>;
  /** Short route facts shown under the subtitle, e.g. distance and drive time. */
  summary?: string;
  /** 0–1 position of the vehicle along the route; omit to hide the vehicle. */
  vehicleProgress?: number | null;
  vehicleLabel?: string;
}

const TONE_COLOR: Record<NonNullable<MapStop['tone']>, string> = {
  pickup: '#D6451B',
  clinic: '#0C3C34',
  rural: '#B4740A',
  hub: '#2F7D6A',
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

  if (props.staticOnly) return <MapFallback {...props} />;

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

type LatLng = readonly [number, number];

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ROUTE_COLOR = '#0C3C34';
const CONFIRMED_ROUTE_COLOR = '#2F7D6A';

const routePath = ({ route, pickup, destination }: RideMapProps): LatLng[] => {
  if (route && route.length > 1) return route.map(([lat, lng]) => [lat, lng] as const);
  if (pickup && destination) return [[pickup.lat, pickup.lng], [destination.lat, destination.lng]];
  return [];
};

const vehiclePosition = (path: LatLng[], progress: number | null | undefined): LatLng | null =>
  progress === null || progress === undefined || path.length < 2 ? null : pointAlongRoute(path, progress);

const MapHeader: React.FC<Pick<RideMapProps, 'title' | 'subtitle' | 'summary'> & { live: boolean }> = ({ title, subtitle, summary, live }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b-2 border-ink bg-sun/40">
    <div className="min-w-0">
      <div className="font-heading font-bold text-ink">{title}</div>
      {subtitle && <p className="text-xs text-muted-fg">{subtitle}</p>}
      {summary && <p className="text-[11px] font-semibold text-ink/80 mt-0.5">{summary}</p>}
    </div>
    <span className="icon-bubble w-8 h-8 bg-white shrink-0">
      {live ? <Navigation className="w-4 h-4" strokeWidth={2.5} /> : <MapPin className="w-4 h-4" strokeWidth={2.5} />}
    </span>
  </div>
);

const LiveLeafletMap: React.FC<RideMapProps & { api: typeof import('react-leaflet') }> = (props) => {
  const { api, title, subtitle, summary, pickup, destination, extras = [], confirmed = false, height = 280, vehicleProgress, vehicleLabel } = props;
  const { MapContainer, TileLayer, Popup, Polyline, CircleMarker, Tooltip } = api;
  const stops = [pickup, destination, ...extras].filter(Boolean) as MapStop[];
  const path = routePath(props);
  const vehicle = vehiclePosition(path, vehicleProgress);
  const bounds = useMemo<[number, number][]>(() => {
    const points = path.length > 1 ? path : stops.map((stop) => [stop.lat, stop.lng] as const);
    return points.map(([lat, lng]) => [lat, lng]);
  }, [path, stops]);
  const lineColor = confirmed ? CONFIRMED_ROUTE_COLOR : ROUTE_COLOR;

  return (
    <div className="card-sticker overflow-hidden">
      <MapHeader title={title} subtitle={subtitle} summary={summary} live />
      <div style={{ height }} className="relative">
        <MapContainer
          bounds={bounds.length > 1 ? bounds : undefined}
          center={bounds.length > 1 ? undefined : [30.0, -91.2]}
          zoom={bounds.length > 1 ? undefined : 6.4}
          boundsOptions={{ padding: [28, 28] }}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer attribution={MAP_ATTRIBUTION} url={TILE_URL} maxZoom={19} className="ride-map-tiles" />
          {path.length > 1 && (
            <>
              <Polyline positions={path.map(([lat, lng]) => [lat, lng])} pathOptions={{ color: '#FFFFFF', weight: 9, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
              <Polyline positions={path.map(([lat, lng]) => [lat, lng])} pathOptions={{ color: lineColor, weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }} />
            </>
          )}
          {stops.map((stop) => (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lng]}
              radius={stops.length > 3 ? 8 : 9}
              pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: TONE_COLOR[stop.tone || 'hub'], fillOpacity: 1 }}
            >
              {stops.length <= 3 && <Tooltip permanent direction="top" offset={[0, -10]} className="ride-map-label">{stop.label}</Tooltip>}
              <Popup>
                <strong>{stop.label}</strong>
                {stop.detail && <div>{stop.detail}</div>}
              </Popup>
            </CircleMarker>
          ))}
          {vehicle && (
            <CircleMarker center={[vehicle[0], vehicle[1]]} radius={8} pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: '#17211E', fillOpacity: 1 }}>
              <Tooltip permanent direction="right" offset={[10, 0]} className="ride-map-label">{vehicleLabel ?? 'Vehicle'}</Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

const FALLBACK_WIDTH = 640;
const FALLBACK_HEIGHT = 320;
const FALLBACK_PADDING = 48;

/** Projects lat/lng points into the fallback SVG, keeping the route's real shape. */
const projectToFallback = (points: LatLng[]) => {
  if (points.length === 0) return () => [FALLBACK_WIDTH / 2, FALLBACK_HEIGHT / 2] as const;
  const lats = points.map(([lat]) => lat);
  const lngs = points.map(([, lng]) => lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const spanLng = Math.max(maxLng - minLng, 1e-6);
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min((FALLBACK_WIDTH - FALLBACK_PADDING * 2) / spanLng, (FALLBACK_HEIGHT - FALLBACK_PADDING * 2) / spanLat);
  const offsetX = (FALLBACK_WIDTH - spanLng * scale) / 2;
  const offsetY = (FALLBACK_HEIGHT - spanLat * scale) / 2;
  return ([lat, lng]: LatLng) => [offsetX + (lng - minLng) * scale, offsetY + (maxLat - lat) * scale] as const;
};

const MapFallback: React.FC<RideMapProps> = (props) => {
  const { title, subtitle, summary, pickup, destination, extras = [], confirmed = false, height = 280, vehicleProgress } = props;
  const stops = [pickup, destination, ...extras].filter(Boolean) as MapStop[];
  const path = routePath(props);
  const project = projectToFallback(path.length > 1 ? path : stops.map((stop) => [stop.lat, stop.lng] as const));
  const routeD = path.map((point, index) => `${index === 0 ? 'M' : 'L'}${project(point).map((value) => value.toFixed(1)).join(' ')}`).join(' ');
  const vehicle = vehiclePosition(path, vehicleProgress);
  const lineColor = confirmed ? CONFIRMED_ROUTE_COLOR : ROUTE_COLOR;

  return (
    <div className="card-sticker overflow-hidden">
      <MapHeader title={title} subtitle={subtitle} summary={summary} live={false} />
      <div className="relative bg-[#F2EFE9]" style={{ height }}>
        <svg viewBox={`0 0 ${FALLBACK_WIDTH} ${FALLBACK_HEIGHT}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <pattern id="ride-map-blocks" width="36" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
              <rect width="36" height="28" fill="#F2EFE9" />
              <path d="M0 0H36M0 0V28" stroke="#FFFFFF" strokeWidth="3" />
            </pattern>
          </defs>
          <rect width={FALLBACK_WIDTH} height={FALLBACK_HEIGHT} fill="url(#ride-map-blocks)" />
          <path d="M-20 300 C 120 250, 220 330, 360 290 S 560 250, 660 300 L 660 340 L -20 340 Z" fill="#AAD3DF" />
          <path d="M-20 40 C 140 70, 300 20, 460 60 S 620 70, 660 50" fill="none" stroke="#FFFFFF" strokeWidth="7" />
          <path d="M-20 40 C 140 70, 300 20, 460 60 S 620 70, 660 50" fill="none" stroke="#F8D38D" strokeWidth="3" />
          {routeD && (
            <>
              <path d={routeD} fill="none" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
              <path d={routeD} fill="none" stroke={lineColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {stops.map((stop) => {
            const [x, y] = project([stop.lat, stop.lng]);
            return <circle key={stop.id} cx={x} cy={y} r="10" fill={TONE_COLOR[stop.tone || 'hub']} stroke="#FFFFFF" strokeWidth="3" />;
          })}
          {vehicle && (() => {
            const [x, y] = project(vehicle);
            return <circle cx={x} cy={y} r="9" fill="#17211E" stroke="#FFFFFF" strokeWidth="3" data-testid="ride-map-vehicle" />;
          })()}
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
