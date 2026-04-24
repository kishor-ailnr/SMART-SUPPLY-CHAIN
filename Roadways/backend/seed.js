const dbModule = require('./db/database');
const fs = require('fs');
const path = require('path');

async function seedVehicles() {
  await dbModule.initDatabase();
  const db = dbModule.getDb();
  const dataPath = path.join(__dirname, 'data', 'sampleVehicles.json');
  const vehicles = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const insertStmt = `INSERT OR REPLACE INTO vehicles (id, name, license_plate, driver_name, driver_phone, vehicle_type, cargo_type, load_weight_tons, fuel_type, color, lat, lng, speedKmh, heading, status, confirmedRoute, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const insert = async (v) => {
    const routeJson = JSON.stringify(v.confirmedRoute || []);
    const ts = v.timestamp || new Date().toISOString();
    await db.run(insertStmt, [v.id, v.name, v.license_plate, v.driver_name, v.driver_phone, v.vehicle_type, v.cargo_type, v.load_weight_tons, v.fuel_type, v.color, v.lat, v.lng, v.speedKmh, v.heading, v.status, routeJson, ts]);
  };

  for (const v of vehicles) {
    await insert(v);
  }
  console.log(`Seeded ${vehicles.length} vehicles`);
}

seedVehicles().catch(err => console.error('Seeding error:', err));

