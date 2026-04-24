import db, { initDb } from './utils/db.js';
import { computeSeaRoute } from './utils/routeEngine.js';
import { v4 as uuidv4 } from 'uuid';

initDb();

// Clear existing tables for fresh seed with safety
db.exec('PRAGMA foreign_keys = OFF;');
db.prepare('DELETE FROM ais_positions').run();
db.prepare('DELETE FROM intelligence_events').run();
db.prepare('DELETE FROM iot_cargo_readings').run();
db.prepare('DELETE FROM waypoints').run();
db.prepare('DELETE FROM voyages').run();
db.prepare('DELETE FROM vessels').run();
db.exec('PRAGMA foreign_keys = ON;');

const fleets_data = [
  {
    id: "ship_1",
    name: "EVER ALOT",
    imo_number: '9876501',
    mmsi: '419100101',
    vessel_type: "Ultra Large Container",
    flag_state: "Panama",
    dwt: 240000,
    loa: 399,
    service_speed: 18.5,
    origin: { name: "Hong Kong", lat: 22.3, lng: 114.2 },
    dest: { name: "Rotterdam", lat: 51.9, lng: 4.14 },
    cargo: "Consumer Goods",
    cargo_value: 500000000,
    waypoints: [
      [114.2, 22.3], [105.0, 10.0], [101.3, 2.8],
      [80.0, 5.0], [50.0, 12.0], [43.0, 12.5], 
      [39.0, 21.0], [32.3, 30.6], [15.0, 35.0],
      [-5.35, 36.14], [-10.0, 42.0], [4.14, 51.9]
    ]
  },
  {
    id: "ship_2",
    name: "OOCL HONG KONG",
    imo_number: '9876502',
    mmsi: '419100102',
    vessel_type: "Container Ship",
    flag_state: "Hong Kong",
    dwt: 210000,
    loa: 399,
    service_speed: 21.0,
    origin: { name: "Shanghai", lat: 31.2, lng: 121.5 },
    dest: { name: "Los Angeles", lat: 34.0, lng: -118.2 },
    cargo: "Electronics & Textiles",
    cargo_value: 400000000,
    waypoints: [
      [121.5, 31.2], [140.0, 35.0], [160.0, 40.0],
      [180.0, 45.0], [-160.0, 45.0], [-140.0, 40.0],
      [-118.2, 34.0]
    ]
  },
  {
    id: "ship_3",
    name: "FRONT ALTAIR",
    imo_number: '9876503',
    mmsi: '419100103',
    vessel_type: "Oil Tanker",
    flag_state: "Marshall Islands",
    dwt: 300000,
    loa: 330,
    service_speed: 14.2,
    origin: { name: "Ras Tanura", lat: 26.6, lng: 50.1 },
    dest: { name: "Houston", lat: 29.7, lng: -95.2 },
    cargo: "Crude Oil",
    cargo_value: 120000000,
    waypoints: [
      [50.1, 26.6], [56.2, 26.5], [60.0, 15.0],
      [40.0, -10.0], [18.4, -34.3], [0.0, -20.0],
      [-40.0, 0.0], [-70.0, 15.0], [-85.0, 25.0],
      [-95.2, 29.7]
    ]
  },
  {
    id: "ship_4",
    name: "MSC OSCAR",
    imo_number: '9876504',
    mmsi: '419100104',
    vessel_type: "Container Ship",
    flag_state: "Panama",
    dwt: 197000,
    loa: 395,
    service_speed: 19.5,
    origin: { name: "Hamburg", lat: 53.5, lng: 9.9 },
    dest: { name: "New York", lat: 40.6, lng: -74.0 },
    cargo: "Machinery",
    cargo_value: 200000000,
    waypoints: [
      [9.9, 53.5], [0.0, 50.0], [-10.0, 50.0],
      [-30.0, 45.0], [-50.0, 42.0], [-70.0, 40.0],
      [-74.0, 40.6]
    ]
  },
  {
    id: "ship_5",
    name: "CMA CGM ANTOINE",
    imo_number: '9876505',
    mmsi: '419100105',
    vessel_type: "Container Ship",
    flag_state: "France",
    dwt: 160000,
    loa: 365,
    service_speed: 20.1,
    origin: { name: "Sydney", lat: -33.8, lng: 151.2 },
    dest: { name: "Tokyo", lat: 35.6, lng: 139.7 },
    cargo: "Agricultural Goods",
    cargo_value: 80000000,
    waypoints: [
      [151.2, -33.8], [153.0, -20.0], [145.0, 0.0],
      [140.0, 20.0], [139.7, 35.6]
    ]
  }
];

const insertVessel = db.prepare(`
  INSERT OR IGNORE INTO vessels (id, name, imo_number, mmsi, flag_state, vessel_type, dwt, loa, service_speed)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertVoyage = db.prepare(`
  INSERT OR IGNORE INTO voyages (id, vessel_id, voyage_number, departure_port, departure_lat, departure_lng, arrival_port, arrival_lat, arrival_lng, route_key, cargo_type, cargo_value, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertWaypoint = db.prepare(`
  INSERT INTO waypoints (voyage_id, route_key, sequence_order, name, lat, lng, waypoint_type)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const v of fleets_data) {
  insertVessel.run(v.id, v.name, v.imo_number, v.mmsi, v.flag_state, v.vessel_type, v.dwt, v.loa, v.service_speed);
  
  const voyageId = uuidv4();
  // Instead of computeSeaRoute, use the provided accurate waypoints for complex navigation visualization
  const routeKey = JSON.stringify(v.waypoints);

  insertVoyage.run(
    voyageId, 
    v.id, 
    'VYG-' + v.imo_number, 
    v.origin.name, v.origin.lat, v.origin.lng, 
    v.dest.name, v.dest.lat, v.dest.lng, 
    routeKey, 
    v.cargo, v.cargo_value, 
    'ACTIVE'
  );

  // Seed waypoints
  v.waypoints.forEach((coord, idx) => {
    insertWaypoint.run(voyageId, routeKey, idx, 'WP-' + idx, coord[1], coord[0], 'ROUTE_POINT');
  });
}

console.log('Database seeded with 5 mock ships successfully.');
process.exit(0);
