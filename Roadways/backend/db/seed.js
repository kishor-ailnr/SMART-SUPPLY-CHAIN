const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, '../../db/roadways.sqlite');
const db = new sqlite3.Database(dbPath);

const vehicles = [
  { id: 'TRUCK-001', name: 'Mumbai Express', registration_number: 'MH04AB1234', driver_name: 'Rajesh Kumar', driver_phone: '+91-98234-12345', vehicle_type: 'HDT', cargo_type: 'Electronics', load_weight_tons: 18, color: '#f0b429', last_lat: 20.0, last_lng: 74.0, last_speed: 68, last_heading: 45 },
  { id: 'TRUCK-002', name: 'Pune Pharma', registration_number: 'MH12CD5678', driver_name: 'Santosh Yadav', driver_phone: '+91-99876-54321', vehicle_type: 'REFRIGERATED', cargo_type: 'Pharmaceuticals', load_weight_tons: 8, color: '#3b82f6', last_lat: 17.68, last_lng: 75.90, last_speed: 62, last_heading: 120 },
  { id: 'TRUCK-003', name: 'Chennai Tanker', registration_number: 'TN09EF9012', driver_name: 'Murugan Pillai', driver_phone: '+91-94456-78900', vehicle_type: 'TANKER', cargo_type: 'Petroleum', load_weight_tons: 22, color: '#ef4444', last_lat: 12.52, last_lng: 78.21, last_speed: 55, last_heading: 260 },
  { id: 'TRUCK-004', name: 'Delhi Ice Runner', registration_number: 'DL03GH3456', driver_name: 'Harjeet Singh', driver_phone: '+91-98765-43210', vehicle_type: 'REFRIGERATED', cargo_type: 'Perishables', load_weight_tons: 12, color: '#22c55e', last_lat: 29.39, last_lng: 76.97, last_speed: 72, last_heading: 340 },
  { id: 'TRUCK-005', name: 'Kolkata Bulk', registration_number: 'WB23IJ7890', driver_name: 'Bikash Das', driver_phone: '+91-93456-78901', vehicle_type: 'HDT', cargo_type: 'Coal', load_weight_tons: 24, color: '#484f58', last_lat: 23.68, last_lng: 86.98, last_speed: 58, last_heading: 280 },
  { id: 'TRUCK-006', name: 'Ahmedabad Container', registration_number: 'GJ01KL2345', driver_name: 'Ramesh Patel', driver_phone: '+91-97123-45678', vehicle_type: 'HDT', cargo_type: 'Textile', load_weight_tons: 20, color: '#f0b429', last_lat: 23.59, last_lng: 72.39, last_speed: 72, last_heading: 10 },
  { id: 'TRUCK-007', name: 'Ahmedabad Container 2', registration_number: 'GJ01MN6789', driver_name: 'Suresh Mehta', driver_phone: '+91-96234-56789', vehicle_type: 'HDT', cargo_type: 'Textile', load_weight_tons: 20, color: '#f0b429', last_lat: 23.57, last_lng: 72.37, last_speed: 71, last_heading: 10 },
  { id: 'TRUCK-008', name: 'Hyderabad Auto', registration_number: 'TS09OP0123', driver_name: 'Krishna Reddy', driver_phone: '+91-95345-67890', vehicle_type: 'AUTO-CARRIER', cargo_type: 'Vehicles', load_weight_tons: 15, color: '#f97316', last_lat: 17.05, last_lng: 79.27, last_speed: 55, last_heading: 100 },
  { id: 'TRUCK-009', name: 'Nagpur LCV', registration_number: 'MH31QR4567', driver_name: 'Pradeep Bopte', driver_phone: '+91-94567-89012', vehicle_type: 'LCV', cargo_type: 'Electronics', load_weight_tons: 3, color: '#dc2626', last_lat: 21.46, last_lng: 80.19, last_speed: 82, last_heading: 85 },
  { id: 'TRUCK-010', name: 'Cochin Reefer', registration_number: 'KL05ST8901', driver_name: 'Thomas Mathew', driver_phone: '+91-93678-90123', vehicle_type: 'REFRIGERATED', cargo_type: 'Seafood', load_weight_tons: 10, color: '#22c55e', last_lat: 10.52, last_lng: 76.21, last_speed: 60, last_heading: 30 }
];

db.serialize(() => {
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, name, registration_number, driver_name, driver_phone, vehicle_type, cargo_type, load_weight_tons, color, last_lat, last_lng, last_speed, last_heading, last_update)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const insertTrip = db.prepare(`
    INSERT INTO trips (id, vehicle_id, origin_name, origin_lat, origin_lng, destination_name, destination_lat, destination_lng, route_key, status, started_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
  `);

  for (const v of vehicles) {
    insertVehicle.run(v.id, v.name, v.registration_number, v.driver_name, v.driver_phone, v.vehicle_type, v.cargo_type, v.load_weight_tons, v.color, v.last_lat, v.last_lng, v.last_speed, v.last_heading);
    insertTrip.run(uuidv4(), v.id, 'Origin City', v.last_lat - 1, v.last_lng - 1, 'Dest City', v.last_lat + 5, v.last_lng + 5, `route_${v.id}`);
  }

  insertVehicle.finalize();
  insertTrip.finalize();
});

db.close(() => console.log('Database seeded.'));
