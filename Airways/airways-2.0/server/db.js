const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../airways.sqlite');
const db = new Database(dbPath);

const schema = `
CREATE TABLE IF NOT EXISTS aircraft (
  id TEXT PRIMARY KEY,
  registration TEXT UNIQUE NOT NULL,
  icao24 TEXT UNIQUE,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  airline TEXT,
  manufacturer TEXT,
  year_manufactured INTEGER,
  seating_capacity INTEGER,
  mtow_kg REAL,
  engine_type TEXT,
  engine_count INTEGER,
  fuel_capacity_liters REAL,
  max_range_km REAL,
  cruise_speed_kmh REAL,
  service_ceiling_ft INTEGER,
  certificate_expiry TEXT,
  maintenance_due TEXT,
  blockchain_address TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  flight_number TEXT NOT NULL,
  aircraft_id TEXT REFERENCES aircraft(id),
  origin_icao TEXT NOT NULL,
  destination_icao TEXT NOT NULL,
  alternate_icao TEXT,
  scheduled_departure TEXT,
  actual_departure TEXT,
  scheduled_arrival TEXT,
  estimated_arrival TEXT,
  actual_arrival TEXT,
  pax_count INTEGER DEFAULT 0,
  cargo_kg REAL DEFAULT 0,
  fuel_onboard_liters REAL,
  fuel_burned_liters REAL DEFAULT 0,
  peak_risk_score REAL DEFAULT 0,
  risk_level TEXT DEFAULT 'LOW',
  delay_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'SCHEDULED',
  corsia_offset_kg REAL DEFAULT 0,
  co2_emissions_kg REAL DEFAULT 0,
  route_string TEXT,
  filed_altitude_ft INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  vehicle_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  operator TEXT NOT NULL,
  registration_plate TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  driver_license TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  year INTEGER,
  fuel_type TEXT,
  payload_capacity_kg REAL,
  status TEXT DEFAULT 'IDLE',
  current_lat REAL,
  current_lng REAL,
  current_speed_kmh REAL DEFAULT 0,
  current_heading REAL DEFAULT 0,
  odometer_km REAL DEFAULT 0,
  fuel_level_pct REAL DEFAULT 100,
  temperature_zone TEXT,
  last_ping TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicle_trips (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT REFERENCES vehicles(id),
  trip_number TEXT UNIQUE NOT NULL,
  origin_name TEXT NOT NULL,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  destination_name TEXT NOT NULL,
  destination_lat REAL NOT NULL,
  destination_lng REAL NOT NULL,
  scheduled_departure TEXT,
  actual_departure TEXT,
  estimated_arrival TEXT,
  actual_arrival TEXT,
  distance_km REAL,
  cargo_id TEXT,
  status TEXT DEFAULT 'SCHEDULED',
  route_geojson TEXT,
  total_checkpoints INTEGER DEFAULT 0,
  checkpoints_cleared INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trip_checkpoints (
  id TEXT PRIMARY KEY,
  trip_id TEXT REFERENCES vehicle_trips(id),
  vehicle_id TEXT REFERENCES vehicles(id),
  sequence_number INTEGER NOT NULL,
  checkpoint_name TEXT NOT NULL,
  checkpoint_type TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  scheduled_eta TEXT,
  actual_arrival TEXT,
  actual_departure TEXT,
  dwell_time_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  distance_from_origin_km REAL,
  notes TEXT,
  geofence_radius_m REAL DEFAULT 200,
  is_mandatory INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cargo_shipments (
  id TEXT PRIMARY KEY,
  awb_number TEXT UNIQUE NOT NULL,
  shipment_type TEXT NOT NULL,
  shipper_name TEXT NOT NULL,
  shipper_address TEXT,
  consignee_name TEXT NOT NULL,
  consignee_address TEXT,
  commodity_description TEXT,
  hs_code TEXT,
  declared_value_usd REAL,
  gross_weight_kg REAL NOT NULL,
  net_weight_kg REAL,
  volume_cbm REAL,
  pieces_count INTEGER DEFAULT 1,
  packaging_type TEXT,
  temperature_min_c REAL,
  temperature_max_c REAL,
  humidity_min_pct REAL,
  humidity_max_pct REAL,
  shock_limit_g REAL DEFAULT 3.0,
  special_handling TEXT,
  dangerous_goods_class TEXT,
  un_number TEXT,
  customs_cleared INTEGER DEFAULT 0,
  insurance_value_usd REAL,
  status TEXT DEFAULT 'PENDING',
  current_lat REAL,
  current_lng REAL,
  blockchain_hash TEXT,
  ipfs_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS iot_cargo_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cargo_id TEXT REFERENCES cargo_shipments(id),
  vehicle_id TEXT REFERENCES vehicles(id),
  sensor_id TEXT,
  reading_time TEXT DEFAULT (datetime('now')),
  temperature_c REAL,
  humidity_pct REAL,
  shock_g REAL DEFAULT 0,
  tilt_degrees REAL DEFAULT 0,
  light_detected INTEGER DEFAULT 0,
  battery_pct REAL DEFAULT 100,
  lat REAL,
  lng REAL,
  altitude_m REAL DEFAULT 0,
  pressure_hpa REAL,
  alert_triggered INTEGER DEFAULT 0,
  alert_type TEXT,
  alert_message TEXT
);

CREATE TABLE IF NOT EXISTS adsb_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT REFERENCES flights(id),
  timestamp TEXT DEFAULT (datetime('now')),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  altitude_ft INTEGER,
  ground_speed_kts REAL,
  heading REAL,
  vertical_rate_fpm REAL,
  squawk TEXT,
  signal_quality INTEGER DEFAULT 100,
  on_ground INTEGER DEFAULT 0,
  track_angle REAL
);

CREATE TABLE IF NOT EXISTS flight_waypoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT REFERENCES flights(id),
  sequence_number INTEGER,
  fix_name TEXT,
  fix_type TEXT,
  lat REAL,
  lng REAL,
  planned_altitude_ft INTEGER,
  actual_altitude_ft INTEGER,
  planned_eta TEXT,
  actual_ata TEXT,
  wind_direction INTEGER,
  wind_speed_kts REAL,
  temperature_c REAL,
  turbulence_level TEXT,
  fuel_remaining_liters REAL
);

CREATE TABLE IF NOT EXISTS weather_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icao TEXT NOT NULL,
  observation_time TEXT DEFAULT (datetime('now')),
  metar_raw TEXT,
  taf_raw TEXT,
  visibility_m INTEGER,
  ceiling_ft INTEGER,
  wind_direction INTEGER,
  wind_speed_kts REAL,
  wind_gust_kts REAL,
  temperature_c REAL,
  dewpoint_c REAL,
  altimeter_hpa REAL,
  weather_phenomena TEXT,
  turbulence_level TEXT,
  icing_level TEXT,
  flight_category TEXT
);

CREATE TABLE IF NOT EXISTS sigmets (
  id TEXT PRIMARY KEY,
  sigmet_type TEXT,
  hazard TEXT,
  severity TEXT,
  polygon_coords TEXT,
  base_fl INTEGER,
  top_fl INTEGER,
  valid_from TEXT,
  valid_to TEXT,
  issuing_center TEXT,
  raw_text TEXT
);

CREATE TABLE IF NOT EXISTS notams (
  id TEXT PRIMARY KEY,
  location TEXT,
  notam_type TEXT,
  subject TEXT,
  condition_code TEXT,
  traffic_type TEXT,
  purpose TEXT,
  scope TEXT,
  lower_limit TEXT,
  upper_limit TEXT,
  lat REAL,
  lng REAL,
  radius_nm REAL,
  valid_from TEXT,
  valid_to TEXT,
  raw_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pireps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_time TEXT,
  aircraft_type TEXT,
  flight_level INTEGER,
  lat REAL,
  lng REAL,
  turbulence_intensity TEXT,
  turbulence_type TEXT,
  icing_intensity TEXT,
  sky_cover TEXT,
  temperature_c REAL,
  wind_direction INTEGER,
  wind_speed_kts REAL,
  raw_text TEXT
);

CREATE TABLE IF NOT EXISTS airport_intelligence (
  icao TEXT PRIMARY KEY,
  iata TEXT,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  lat REAL,
  lng REAL,
  elevation_ft INTEGER,
  runway_count INTEGER,
  longest_runway_ft INTEGER,
  ils_categories TEXT,
  arrival_capacity_hr INTEGER,
  departure_capacity_hr INTEGER,
  current_arrival_rate INTEGER,
  current_departure_rate INTEGER,
  taxi_delay_minutes INTEGER DEFAULT 0,
  ground_delay_minutes INTEGER DEFAULT 0,
  fog_prone INTEGER DEFAULT 0,
  monsoon_risk INTEGER DEFAULT 0,
  bird_strike_risk TEXT,
  risk_score REAL DEFAULT 0,
  atis_frequency REAL,
  tower_frequency REAL,
  ground_frequency REAL,
  approach_frequency REAL
);

CREATE TABLE IF NOT EXISTS crew_fdtl (
  id TEXT PRIMARY KEY,
  crew_name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  role TEXT,
  flight_id TEXT REFERENCES flights(id),
  duty_start TEXT,
  duty_end TEXT,
  flight_start TEXT,
  flight_end TEXT,
  block_minutes INTEGER DEFAULT 0,
  accumulated_7day_hours REAL DEFAULT 0,
  accumulated_28day_hours REAL DEFAULT 0,
  rest_required_hours INTEGER DEFAULT 10,
  rest_taken_hours REAL DEFAULT 0,
  fatigue_score REAL DEFAULT 0,
  compliance_status TEXT DEFAULT 'COMPLIANT'
);

CREATE TABLE IF NOT EXISTS dark_aircraft_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  detection_time TEXT DEFAULT (datetime('now')),
  icao24_reported TEXT,
  lat REAL,
  lng REAL,
  altitude_ft INTEGER,
  spoofed_registration TEXT,
  anomaly_type TEXT,
  risk_score REAL,
  notes TEXT,
  resolved INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blockchain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_time TEXT DEFAULT (datetime('now')),
  event_type TEXT,
  entity_type TEXT,
  entity_id TEXT,
  tx_hash TEXT UNIQUE,
  block_number INTEGER,
  ipfs_hash TEXT,
  data_summary TEXT,
  gas_used INTEGER,
  network TEXT DEFAULT 'sepolia'
);

CREATE TABLE IF NOT EXISTS overpass_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_hash TEXT UNIQUE,
  result_geojson TEXT,
  cached_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT
);
`;

db.exec(schema);

function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as c FROM aircraft').get().c;
  if (count > 0) {
    console.log('[DB] Data already seeded. Skipping.');
    return;
  }
  
  console.log('[DB] Seeding database with demo data...');
  
  // Aircraft List
  const insertAircraft = db.prepare('INSERT INTO aircraft (id, registration, icao24, type, model, airline, manufacturer, seating_capacity, fuel_capacity_liters, cruise_speed_kmh, max_range_km) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  insertAircraft.run('AC001', 'VT-IGX', '84A1C2', 'FIXED_WING', 'Boeing 737-800', 'IndiGo 6E', 'Boeing', 189, 26020, 842, 5765);
  insertAircraft.run('AC002', 'VT-ANA', '80A2D3', 'FIXED_WING', 'Airbus A320neo', 'Air India AI', 'Airbus', 186, 26730, 833, 6300);
  insertAircraft.run('AC003', 'VT-ALX', '80B4E1', 'FIXED_WING', 'Boeing 777-300ER', 'Air India AI', 'Boeing', 342, 181280, 905, 13649);
  insertAircraft.run('AC004', 'VT-SPN', '857C3F', 'FIXED_WING', 'ATR 72-600', 'SpiceJet SG', 'ATR', 70, 6370, 510, 1500);
  insertAircraft.run('AC005', 'VT-BDB', '84C5A0', 'CARGO', 'Boeing 747-8F', 'Blue Dart BZ', 'Boeing', 0, 226118, 902, 8100);
  insertAircraft.run('AC006', 'A6-EVA', '896140', 'FIXED_WING', 'Airbus A380-800', 'Emirates EK', 'Airbus', 489, 320000, 903, 15200);

  // Airports
  const insertAirport = db.prepare('INSERT INTO airport_intelligence (icao, name, lat, lng) VALUES (?,?,?,?)');
  insertAirport.run('VIDP', 'Indira Gandhi International', 28.5562, 77.1000);
  insertAirport.run('VABB', 'Chhatrapati Shivaji Maharaj International', 19.0896, 72.8656);
  insertAirport.run('VOMM', 'Chennai International', 12.9900, 80.1693);
  insertAirport.run('VOBL', 'Kempegowda International', 13.1986, 77.7066);
  insertAirport.run('VECC', 'Netaji Subhas Chandra Bose International', 22.6547, 88.4467);
  insertAirport.run('VOCI', 'Cochin International', 10.1520, 76.4019);
  insertAirport.run('OMDB', 'Dubai International', 25.2532, 55.3657);
  insertAirport.run('EGLL', 'Heathrow', 51.4775, -0.4614);

  // Flights
  const insertFlight = db.prepare('INSERT INTO flights (id, flight_number, aircraft_id, origin_icao, destination_icao, status, pax_count, risk_level, filed_altitude_ft, fuel_onboard_liters) VALUES (?,?,?,?,?,?,?,?,?,?)');
  insertFlight.run('FL001', '6E-101', 'AC001', 'VIDP', 'VABB', 'ACTIVE', 160, 'MEDIUM', 35000, 18500);
  insertFlight.run('FL002', 'AI-130', 'AC003', 'VABB', 'OMDB', 'ACTIVE', 290, 'LOW', 37000, 95000);
  insertFlight.run('FL003', 'BZ-501', 'AC005', 'VECC', 'VOBL', 'ACTIVE', 0, 'LOW', 32000, 120000);
  insertFlight.run('FL004', 'SG-445', 'AC004', 'VOMM', 'VIDP', 'ACTIVE', 68, 'HIGH', 22000, 5000);
  insertFlight.run('FL005', 'EK-502', 'AC006', 'OMDB', 'VIDP', 'ACTIVE', 420, 'LOW', 39000, 145000);

  // Vehicles
  const insertVehicle = db.prepare('INSERT INTO vehicles (id, vehicle_number, type, operator, status, current_lat, current_lng) VALUES (?,?,?,?,?,?,?)');
  insertVehicle.run('VH001', 'KA-01-AC-4521', 'REEFER', 'Blue Dart Logistics', 'EN_ROUTE', 12.9165, 79.1325);
  insertVehicle.run('VH002', 'DL-1C-AB-1234', 'CONTAINER', 'DTDC Freight', 'AT_CHECKPOINT', 29.6857, 76.9905);
  insertVehicle.run('VH003', 'MH-02-BX-7890', 'FLATBED', 'Gati Logistics', 'EN_ROUTE', 18.7827, 73.3417);
  insertVehicle.run('VH004', 'TN-09-BF-3344', 'TANKER', 'Indian Oil Corp Logistics', 'EN_ROUTE', 11.6643, 78.1460);
  insertVehicle.run('VH005', 'TS-09-EA-9988', 'VAN', 'Delhivery', 'DELAYED', 17.0575, 79.2680);

  // Cargo Shipments
  const insertCargo = db.prepare('INSERT INTO cargo_shipments (id, awb_number, shipment_type, shipper_name, consignee_name, gross_weight_kg) VALUES (?,?,?,?,?,?)');
  insertCargo.run('CS001', 'IN-2024-BLR-001', 'PHARMACEUTICAL', 'Biocon Ltd', 'Apollo Hospital Chennai', 450);
  insertCargo.run('CS002', 'IN-2024-DEL-002', 'ELECTRONICS', 'Samsung India', 'Retailer Ludhiana', 2800);
  insertCargo.run('CS003', 'IN-2024-MUM-003', 'STANDARD', 'Tata Motors', 'Bajaj Auto Pune', 8500);
  insertCargo.run('CS004', 'IN-2024-CHE-004', 'HAZMAT', 'IOC Chennai', 'IOC Coimbatore', 24000);
  insertCargo.run('CS005', 'IN-2024-HYD-005', 'PERISHABLE', 'Fresh2Plate', 'Retail Chain Vijayawada', 320);

  // TODO: Add more detailed routing points, trips, and checkpoints as required by spec
  console.log('[DB] Seed complete.');
}

module.exports = { db, seedDatabase };
