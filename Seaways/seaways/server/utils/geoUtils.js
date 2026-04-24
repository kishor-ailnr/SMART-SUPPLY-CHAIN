import * as turf from '@turf/turf';

export const calculateDistance = (p1, p2) => {
  const from = turf.point([p1.lng, p1.lat]);
  const to = turf.point([p2.lng, p2.lat]);
  return turf.distance(from, to, { units: 'kilometers' });
};

export const calculateBearing = (p1, p2) => {
  const start = turf.point([p1.lng, p1.lat]);
  const end = turf.point([p2.lng, p2.lat]);
  return turf.bearing(start, end);
};

export const projectNextPosition = (lat, lng, speedKnots, heading, hours) => {
  const speedKmh = speedKnots * 1.852;
  const distance = speedKmh * hours;
  const point = turf.point([lng, lat]);
  const destination = turf.destination(point, distance, heading);
  
  return {
    lat: destination.geometry.coordinates[1],
    lng: destination.geometry.coordinates[0]
  };
};

export const getPointOnRoute = (route, distanceKm) => {
  if (!route || route.length < 2) return null;
  const line = turf.lineString(route.map(p => [p.lng, p.lat]));
  const point = turf.along(line, distanceKm, { units: 'kilometers' });
  return {
    lat: point.geometry.coordinates[1],
    lng: point.geometry.coordinates[0]
  };
};

export const getTotalRouteDistance = (route) => {
  if (!route || route.length < 2) return 0;
  const line = turf.lineString(route.map(p => [p.lng, p.lat]));
  return turf.length(line, { units: 'kilometers' });
};
