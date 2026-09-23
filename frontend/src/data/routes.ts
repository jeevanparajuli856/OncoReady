/**
 * Street route from 1420 St. Charles Ave to Benson Cancer Center (about 8.3 km, about 13 minutes).
 * Routed once with OSRM on OpenStreetMap data (© OpenStreetMap contributors, ODbL) and stored here,
 * so the app never calls a routing service at runtime. [lat, lng] pairs.
 */
export const ST_CHARLES_TO_BENSON: ReadonlyArray<readonly [number, number]> = [
  [29.94167, -90.0783], [29.94237, -90.07955], [29.94244, -90.08125], [29.9431, -90.08244],
  [29.94371, -90.08354], [29.94455, -90.08502], [29.94544, -90.0866], [29.94632, -90.08816],
  [29.947, -90.08935], [29.94803, -90.09121], [29.949, -90.09296], [29.9496, -90.09403],
  [29.95062, -90.09583], [29.95121, -90.09689], [29.95186, -90.098], [29.95184, -90.09922],
  [29.95116, -90.10021], [29.95063, -90.10137], [29.94998, -90.10242], [29.94915, -90.10392],
  [29.94945, -90.10516], [29.95032, -90.10672], [29.95091, -90.10802], [29.9513, -90.10959],
  [29.9518, -90.11081], [29.95227, -90.11195], [29.95278, -90.11305], [29.95373, -90.1138],
  [29.95465, -90.11533], [29.95549, -90.11638], [29.95409, -90.11789], [29.95528, -90.11953],
  [29.95605, -90.12046], [29.95683, -90.12143], [29.95815, -90.12305], [29.95945, -90.12468],
  [29.96058, -90.12607], [29.96144, -90.12713], [29.96273, -90.12871], [29.96374, -90.12998],
  [29.9644, -90.1311], [29.96475, -90.1324], [29.96491, -90.13378], [29.96511, -90.13555],
  [29.96528, -90.13701], [29.96545, -90.1384], [29.96408, -90.13945], [29.96291, -90.13993],
  [29.9623, -90.14127], [29.9625, -90.1425], [29.96214, -90.14368], [29.96028, -90.14429],
  [29.96067, -90.14544], [29.96078, -90.14581],
];

export const ST_CHARLES_TO_BENSON_SUMMARY = { distanceMiles: 5.2, driveMinutes: 13 } as const;

/** Point at `progress` (0–1) along a route, measured by distance. */
export function pointAlongRoute(route: ReadonlyArray<readonly [number, number]>, progress: number): [number, number] {
  const clamped = Math.min(1, Math.max(0, progress));
  const lengths = route.slice(1).map((point, index) => Math.hypot(point[0] - route[index][0], point[1] - route[index][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = clamped * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const ratio = lengths[index] === 0 ? 0 : remaining / lengths[index];
      const [lat1, lng1] = route[index];
      const [lat2, lng2] = route[index + 1];
      return [lat1 + (lat2 - lat1) * ratio, lng1 + (lng2 - lng1) * ratio];
    }
    remaining -= lengths[index];
  }
  const last = route[route.length - 1];
  return [last[0], last[1]];
}
