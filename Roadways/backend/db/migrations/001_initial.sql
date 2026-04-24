-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  vehicle_type TEXT NOT NULL,
  cargo_type TEXT DEFAULT 'GENERAL',
  load_weight_tons REAL DEFAULT 0,
  fuel_type TEXT DEFAULT 'DIESEL',
  color TEXT DEFAULT '#f0b429',
  created_at TEXT DEFAULT (datetime('now')),
  is_active INTEGER DEFAULT 1,
  lat REAL,
  lng REAL,
  speedKmh REAL,
  heading REAL,
  status TEXT DEFAULT 'MOVING',
  confirmedRoute TEXT,
  timestamp TEXT
);

-- TRIPS (simplified for demo)
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  origin_name TEXT,
  destination_name TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  total_distance_km REAL DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE'
);

-- ROUTE_CHECKPOINTS (optional)
CREATE TABLE IF NOT EXISTS route_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_key TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL
);

-- ALERTS (optional)
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  severity TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  lat REAL,
  lng REAL,
  acknowledged INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
