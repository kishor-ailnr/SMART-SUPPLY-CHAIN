const turf = require('@turf/turf');

/**
 * Calculate bearing (degrees) from point A to point B.
 */
function getBearing(lat1, lng1, lat2, lng2) {
  const from = turf.point([lng1, lat1]);
  const to = turf.point([lng2, lat2]);
  return turf.bearing(from, to);
}

/**
 * Haversine distance in meters between two lat/lng points.
 */
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const from = turf.point([lng1, lat1]);
  const to = turf.point([lng2, lat2]);
  return turf.distance(from, to, { units: 'meters' });
}

/**
 * Advance along a polyline (array of {lat,lng}) by a given distance (meters).
 * Returns the new lat/lng and the index of the segment reached.
 */
function advanceAlongRoute(currentLat, currentLng, route, distanceMeters) {
  const line = turf.lineString(route.map(p => [p.lng, p.lat]));
  const currentPoint = turf.point([currentLng, currentLat]);
  const snapped = turf.nearestPointOnLine(line, currentPoint);
  const distanceTraveled = snapped.properties.dist; // distance from start of line in km? No, snapped.properties might have it.
  
  // Actually, turf.lineSlice and turf.length are better
  const totalLength = turf.length(line, { units: 'meters' });
  const startToCurrent = turf.lineSlice(turf.point(line.geometry.coordinates[0]), snapped, line);
  const currentDist = turf.length(startToCurrent, { units: 'meters' });
  
  const newDist = currentDist + distanceMeters;
  if (newDist >= totalLength) {
    const last = route[route.length - 1];
    return { lat: last.lat, lng: last.lng, segmentIndex: route.length - 1 };
  }
  
  const destination = turf.along(line, newDist, { units: 'meters' });
  const [lng, lat] = destination.geometry.coordinates;
  return { lat, lng, segmentIndex: snapped.properties.index };
}

module.exports = { getBearing, getDistanceMeters, advanceAlongRoute };
