-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  driver_license TEXT,
  driver_license_expiry TEXT,
  vehicle_type TEXT NOT NULL,
  make_model TEXT,
  year_of_manufacture INTEGER,
  gvw_tonnes REAL,
  payload_tonnes REAL,
  fuel_type TEXT DEFAULT 'DIESEL',
  engine_cc INTEGER,
  cargo_type TEXT DEFAULT 'GENERAL',
  load_weight_tons REAL DEFAULT 0,
  color TEXT DEFAULT '#f0b429',
  fastag_id TEXT,
  insurance_expiry TEXT,
  fitness_expiry TEXT,
  puc_expiry TEXT,
  permit_type TEXT,
  permit_expiry TEXT,
  rc_expiry TEXT,
  assigned_user_id TEXT,
  fleet_id TEXT,
  iot_tag_channel_id TEXT,
  blockchain_address TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  last_lat REAL,
  last_lng REAL,
  last_speed REAL,
  last_heading REAL,
  last_update TEXT
);

-- TRIPS
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  origin_name TEXT NOT NULL,
  origin_lat REAL NOT NULL,
  origin_lng REAL NOT NULL,
  origin_state TEXT,
  destination_name TEXT NOT NULL,
  destination_lat REAL NOT NULL,
  destination_lng REAL NOT NULL,
  destination_state TEXT,
  route_key TEXT NOT NULL,
  states_traversed TEXT,
  nh_km REAL DEFAULT 0,
  sh_km REAL DEFAULT 0,
  other_km REAL DEFAULT 0,
  cargo_type TEXT,
  cargo_weight_tonnes REAL,
  eway_bill_number TEXT,
  eway_bill_expiry TEXT,
  lorry_receipt_number TEXT,
  consignor TEXT,
  consignee TEXT,
  declared_value REAL,
  status TEXT DEFAULT 'ACTIVE',
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  scheduled_delivery_at TEXT,
  total_distance_km REAL DEFAULT 0,
  total_toll_cost REAL DEFAULT 0,
  total_carbon_kg REAL DEFAULT 0,
  total_fuel_liters REAL DEFAULT 0,
  delay_hours REAL DEFAULT 0,
  delay_reason TEXT,
  peak_risk_level TEXT DEFAULT 'LOW',
  driver_score REAL DEFAULT 100,
  cargo_integrity_hash TEXT,
  blockchain_trip_id TEXT
);

-- ROUTE_CHECKPOINTS
CREATE TABLE IF NOT EXISTS route_checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_key TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  state TEXT,
  district TEXT,
  checkpoint_type TEXT DEFAULT 'WAYPOINT',
  road_type TEXT DEFAULT 'NH',
  avg_dwell_minutes INTEGER DEFAULT 0,
  toll_cost REAL REAL DEFAULT 0,
  fuel_available INTEGER DEFAULT 0,
  rest_available INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 1,
  last_used_at TEXT DEFAULT (datetime('now'))
);

-- INDIA_TOLL_PLAZAS
CREATE TABLE IF NOT EXISTS india_toll_plazas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  highway TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  class1_cost REAL,
  class2_cost REAL,
  class3_cost REAL,
  class4_cost REAL,
  class5_cost REAL,
  class6_cost REAL,
  class7_cost REAL,
  fastag_lanes INTEGER DEFAULT 1,
  monthly_pass_available INTEGER DEFAULT 0,
  avg_queue_minutes REAL DEFAULT 5
);

-- INDIA_BORDER_CHECKPOSTS
CREATE TABLE IF NOT EXISTS india_border_checkposts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  state_from TEXT NOT NULL,
  state_to TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  documents_required TEXT,
  entry_tax REAL DEFAULT 0,
  operation_hours TEXT DEFAULT '24x7',
  avg_queue_minutes REAL DEFAULT 30,
  note TEXT
);

-- INDIA_FLOOD_ROADS
CREATE TABLE IF NOT EXISTS india_flood_roads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  road_name TEXT NOT NULL,
  highway TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  start_lat REAL NOT NULL,
  start_lng REAL NOT NULL,
  end_lat REAL NOT NULL,
  end_lng REAL NOT NULL,
  flood_threshold_mm REAL DEFAULT 50,
  historical_closure_count INTEGER DEFAULT 0,
  last_flooded TEXT,
  alternative_route TEXT
);

-- INDIA_ACCIDENT_BLACKSPOTS
CREATE TABLE IF NOT EXISTS india_accident_blackspots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  highway TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  accident_count_annual INTEGER DEFAULT 0,
  fatality_count_annual INTEGER DEFAULT 0,
  primary_cause TEXT,
  severity TEXT DEFAULT 'HIGH'
);

-- IOT_TAG_READINGS
CREATE TABLE IF NOT EXISTS iot_tag_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  trip_id TEXT REFERENCES trips(id),
  timestamp TEXT DEFAULT (datetime('now')),
  temperature REAL,
  humidity REAL,
  shock_detected INTEGER DEFAULT 0,
  door_open INTEGER DEFAULT 0,
  tag_lat REAL,
  tag_lng REAL,
  battery_percent REAL,
  blockchain_logged INTEGER DEFAULT 0,
  blockchain_tx_hash TEXT
);

-- DRIVER_FATIGUE_EVENTS
CREATE TABLE IF NOT EXISTS driver_fatigue_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL,
  trip_id TEXT,
  fatigue_score REAL NOT NULL,
  speed_variance REAL,
  continuous_driving_hours REAL,
  time_of_day TEXT,
  recommendation TEXT,
  action_taken TEXT,
  lat REAL,
  lng REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- INTELLIGENCE_EVENTS
CREATE TABLE IF NOT EXISTS intelligence_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT,
  trip_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'LOW',
  lat REAL,
  lng REAL,
  affected_road TEXT,
  affected_state TEXT,
  confidence_score REAL DEFAULT 0.5,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- BLOCKCHAIN_EVENTS
CREATE TABLE IF NOT EXISTS blockchain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id TEXT NOT NULL,
  trip_id TEXT,
  event_type TEXT NOT NULL,
  tx_hash TEXT,
  block_number INTEGER,
  ipfs_hash TEXT,
  data_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
