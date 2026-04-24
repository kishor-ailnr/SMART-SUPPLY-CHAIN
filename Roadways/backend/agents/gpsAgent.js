const { advanceAlongRoute, getBearing } = require('../utils/geoUtils');

/**
 * Simple GPS simulation – moves each vehicle along its stored `confirmedRoute`
 * every tick (default 10 seconds). It updates position, heading, speed
 * (adds random variation) and writes the new values back to the SQLite DB.
 */
function updateVehicles(vehicleMap) {
  const now = Date.now();
  vehicleMap.forEach(vehicle => {
    console.log(`[GPS] Checking vehicle ${vehicle.id}: Route: ${Array.isArray(vehicle.confirmedRoute)} L:${vehicle.confirmedRoute?.length}`);
    if (!Array.isArray(vehicle.confirmedRoute) || vehicle.confirmedRoute.length === 0) return;

    // Simulate speed variation ±15 km/h, respecting vehicle type caps
    const caps = { LCV: 90, MDT: 80, HDT: 70, VAN: 80, TANKER: 60, REFRIGERATED: 70 };
    const maxSpeed = caps[vehicle.vehicle_type] || 70;
    const baseSpeed = Math.min(vehicle.speedKmh || 30, maxSpeed);
    const variation = (Math.random() * 30) - 15; // -15 to +15
    let newSpeed = Math.max(5, Math.min(maxSpeed, baseSpeed + variation));

    // Distance to travel this tick (speed km/h -> m per 10 s)
    const distanceMeters = (newSpeed * 1000 / 3600) * 10; // 10 s interval
    const { lat, lng, segmentIndex } = advanceAlongRoute(vehicle.lat, vehicle.lng, vehicle.confirmedRoute, distanceMeters);

    // Update heading based on movement direction
    const prev = vehicle.confirmedRoute[segmentIndex] || { lat: vehicle.lat, lng: vehicle.lng };
    const heading = getBearing(prev.lat, prev.lng, lat, lng);

    // Persist changes in memory and DB
    vehicle.lat = lat;
    vehicle.lng = lng;
    vehicle.speedKmh = newSpeed;
    vehicle.heading = heading;
    vehicle.timestamp = new Date().toISOString();
    vehicle.status = 'MOVING';

    console.log(`[GPS] Vehicle ${vehicle.id} moved to ${lat}, ${lng} (Speed: ${newSpeed.toFixed(1)})`);

    // Update DB row (only the live fields)
    const { getDb } = require('../db/database');
    const db = getDb();
    db.run(`UPDATE vehicles SET lat = ?, lng = ?, speedKmh = ?, heading = ?, status = ?, timestamp = ? WHERE id = ?`, 
      [lat, lng, newSpeed, heading, vehicle.status, vehicle.timestamp, vehicle.id])
      .catch(err => console.error('Error updating vehicle in DB:', err));
  });
}

module.exports = { updateVehicles };
