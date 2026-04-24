import * as turf from '@turf/turf';

// Major global shipping lane waypoints for forced sea-routing around land
export const SEA_WAYPOINTS = {
  MALACCA: { lat: 1.3, lng: 103.8 },
  HORMUZ: { lat: 26.5, lng: 56.3 },
  BAB_EL_MANDEB: { lat: 12.6, lng: 43.4 },
  SUEZ: { lat: 29.9, lng: 32.6 },
  PANAMA: { lat: 9.0, lng: 79.6 },
  GIBRALTAR: { lat: 36.0, lng: -5.3 },
  CAPE_GOOD_HOPE: { lat: -34.4, lng: 18.5 },
  CAPE_HORN: { lat: -55.9, lng: -67.3 },
  LOMBOK: { lat: -8.5, lng: 115.7 },
  SUNDA: { lat: -5.9, lng: 105.8 },
  TAIWAN_STRAIT: { lat: 24.5, lng: 119.5 },
  ENGLISH_CHANNEL: { lat: 50.5, lng: -0.3 },
};

/**
 * Computes a sea-only route by avoiding land and passing through required straits.
 * In a full production system, this would use a graph of navigable sea lanes.
 * Here we implement the user's requested logic with waypoint passthrough.
 */
export function computeSeaRoute(origin, dest) {
  const originPoint = turf.point([origin.lng, origin.lat]);
  const destPoint = turf.point([dest.lng, dest.lat]);
  
  // Logic to determine which straits are needed based on origin/dest quadrants
  // This is a simplified heuristic-based routing for the demo/v2 structure
  let waypoints = [[origin.lng, origin.lat]];
  
  // Example: Routing from India (e.g., JNPT) to Europe
  if (origin.lng > 60 && dest.lng < 40 && dest.lat > 30) {
    waypoints.push([SEA_WAYPOINTS.BAB_EL_MANDEB.lng, SEA_WAYPOINTS.BAB_EL_MANDEB.lat]);
    waypoints.push([SEA_WAYPOINTS.SUEZ.lng, SEA_WAYPOINTS.SUEZ.lat]);
  }
  
  // India to Arabian Sea / Persian Gulf
  if (origin.lng > 60 && dest.lng < 60 && dest.lat > 20) {
    waypoints.push([SEA_WAYPOINTS.HORMUZ.lng, SEA_WAYPOINTS.HORMUZ.lat]);
  }
  
  // Asia to Europe via Malacca
  if (origin.lng > 100 && dest.lng < 60) {
    waypoints.push([SEA_WAYPOINTS.MALACCA.lng, SEA_WAYPOINTS.MALACCA.lat]);
  }

  waypoints.push([dest.lng, dest.lat]);

  // Create segments
  const features = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i+1];
    
    // Create intermediate points to simulate realistic sea tracking
    const line = turf.lineString([from, to]);
    const length = turf.length(line, { units: 'nauticalmiles' });
    const steps = Math.max(2, Math.floor(length / 50)); // One point every 50nm
    
    for (let j = 0; j <= steps; j++) {
      const segment = turf.along(line, (j / steps) * length, { units: 'nauticalmiles' });
      features.push(segment.geometry.coordinates);
    }
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: features
    },
    properties: {
      totalDistanceNm: turf.length(turf.lineString(features), { units: 'nauticalmiles' })
    }
  };
}
