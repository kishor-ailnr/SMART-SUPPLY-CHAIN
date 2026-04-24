import alasql from 'alasql';

// MOCK of better-sqlite3 for systems failing node-gyp builds
class Database {
  constructor() {
    this.db = new alasql.Database();
  }
  
  exec(schema) {
    // alasql doesn't fully support all SQLite constraints like IGNORE or TEXT PRIMARY KEY
    // string replacements to make sqlite schema compatible with alasql
    let compatSchema = schema
      .replace(/TEXT PRIMARY KEY/g, 'STRING PRIMARY KEY')
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INT AUTO_INCREMENT PRIMARY KEY')
      .replace(/REAL/g, 'FLOAT')
      .replace(/TEXT/g, 'STRING')
      .replace(/DEFAULT \(datetime\('now'\)\)/g, 'DEFAULT CURRENT_TIMESTAMP')
      .replace(/UNIQUE/g, '')
      .replace(/ REFERENCES aircraft\(id\)/g, '')
      .replace(/ REFERENCES flights\(id\)/g, '');
    
    // Some constraints might fail in pure alasql, we'll try to execute line by line
    const statements = compatSchema.split(';');
    for(const stmt of statements) {
      if(stmt.trim().length > 0) {
        try {
          this.db.exec(stmt);
        } catch(e) {
          console.warn("Schema parse warning in alasql for: ", stmt.substring(0, 30));
        }
      }
    }
  }

  prepare(sql) {
    // Convert better-sqlite3 (?, ?) style to alasql syntax
    // alasql also uses ? for parameters
    // and alias fixing 
    const isInsert = sql.trim().toUpperCase().startsWith("INSERT");
    const isIgnore = isInsert && sql.toUpperCase().includes("IGNORE");
    const finalSql = sql.replace("OR IGNORE", "");
    
    return {
      run: (...params) => {
        let flatParams = params;
        if(params.length === 1 && Array.isArray(params[0])) {
           flatParams = params[0];
        }
        try {
          this.db.exec(finalSql, flatParams);
          return { changes: 1 };
        } catch(e) {
          if(!isIgnore) throw e;
          console.warn("Ignored insertion error: ", e.message);
          return { changes: 0 };
        }
      },
      all: (...params) => {
        let flatParams = params;
        if(params.length === 1 && Array.isArray(params[0])) flatParams = params[0];
        return this.db.exec(finalSql, flatParams);
      },
      get: (...params) => {
        let flatParams = params;
        if(params.length === 1 && Array.isArray(params[0])) flatParams = params[0];
        const res = this.db.exec(finalSql, flatParams);
        return res.length > 0 ? res[0] : undefined;
      }
    };
  }

  transaction(fn) {
    return () => {
      // no real transations in memory mock
      return fn();
    };
  }
}

const db = new Database();

const schema = `
CREATE TABLE IF NOT EXISTS aircraft (
  id TEXT PRIMARY KEY,
  registration TEXT NOT NULL UNIQUE,
  icao_hex TEXT,
  iata_type TEXT,
  icao_type TEXT NOT NULL,
  airline_iata TEXT,
  airline_icao TEXT,
  airline_name TEXT,
  manufacturer TEXT,
  model TEXT,
  build_year INTEGER,
  delivery_date TEXT,
  engine_type TEXT,
  engine_count INTEGER DEFAULT 2,
  mtow_kg REAL,
  max_payload_kg REAL,
  fuel_capacity_kg REAL,
  service_speed_ktas REAL,
  max_altitude_ft INTEGER DEFAULT 41000,
  range_nm REAL,
  seat_f INTEGER DEFAULT 0,
  seat_j INTEGER DEFAULT 0,
  seat_y INTEGER DEFAULT 0,
  c_of_a_expiry TEXT,
  registration_expiry TEXT,
  noise_cert_expiry TEXT,
  radio_license_expiry TEXT,
  insurance_expiry TEXT,
  last_a_check TEXT,
  next_a_check TEXT,
  last_c_check TEXT,
  next_c_check TEXT,
  engine_tbo_remaining_hours REAL,
  apu_hours_to_overhaul REAL,
  outstanding_mel_items INTEGER DEFAULT 0,
  etops_authorization INTEGER DEFAULT 0,
  etops_minutes INTEGER DEFAULT 0,
  assigned_user_id TEXT,
  iot_channel_id TEXT,
  blockchain_address TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  aircraft_id TEXT NOT NULL REFERENCES aircraft(id),
  flight_number_iata TEXT NOT NULL,
  flight_number_icao TEXT,
  callsign TEXT,
  origin_icao TEXT NOT NULL,
  origin_iata TEXT,
  origin_city TEXT,
  destination_icao TEXT NOT NULL,
  destination_iata TEXT,
  destination_city TEXT,
  alternate_icao TEXT,
  route_string TEXT,
  filed_altitude_ft INTEGER,
  filed_speed_ktas REAL,
  scheduled_departure TEXT,
  actual_departure TEXT,
  estimated_arrival TEXT,
  actual_arrival TEXT,
  flight_type TEXT DEFAULT 'SCHEDULED',
  charter_type TEXT,
  pic_name TEXT,
  fo_name TEXT,
  pax_count INTEGER DEFAULT 0,
  pax_f INTEGER DEFAULT 0,
  pax_j INTEGER DEFAULT 0,
  pax_y INTEGER DEFAULT 0,
  cargo_weight_kg REAL DEFAULT 0,
  dg_on_board INTEGER DEFAULT 0,
  total_fuel_kg REAL DEFAULT 0,
  fuel_burn_actual_kg REAL DEFAULT 0,
  status TEXT DEFAULT 'SCHEDULED',
  delay_minutes INTEGER DEFAULT 0,
  delay_reason TEXT,
  divert_airport TEXT,
  peak_risk_level TEXT DEFAULT 'LOW',
  blockchain_flight_id TEXT,
  co2_kg REAL DEFAULT 0,
  corsia_offset_kg REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flight_waypoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT NOT NULL REFERENCES flights(id),
  route_key TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  fix_name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  waypoint_type TEXT DEFAULT 'ENROUTE',
  airway TEXT,
  planned_altitude_ft INTEGER,
  planned_eta TEXT,
  actual_eta TEXT,
  status TEXT DEFAULT 'FUTURE',
  winds_at_fix TEXT,
  temp_at_fix REAL,
  turbulence_at_fix TEXT,
  fuel_remaining_kg REAL,
  use_count INTEGER DEFAULT 1,
  last_used_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS adsb_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aircraft_id TEXT NOT NULL REFERENCES aircraft(id),
  flight_id TEXT REFERENCES flights(id),
  timestamp TEXT DEFAULT (datetime('now')),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  altitude_ft REAL,
  ground_speed_kts REAL,
  true_heading REAL,
  vertical_rate_fpm REAL,
  squawk TEXT,
  on_ground INTEGER DEFAULT 0,
  adsb_source TEXT,
  signal_quality INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS weather_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT,
  airport_icao TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  lat REAL,
  lng REAL,
  altitude_ft REAL,
  wind_direction INTEGER,
  wind_speed_kts REAL,
  gust_kts REAL,
  temperature_c REAL,
  dewpoint_c REAL,
  qnh_hpa REAL,
  visibility_m INTEGER,
  ceiling_ft INTEGER,
  weather_code TEXT,
  turbulence_intensity TEXT,
  icing_intensity TEXT,
  metar_raw TEXT,
  taf_raw TEXT,
  flight_category TEXT
);

CREATE TABLE IF NOT EXISTS sigmets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sigmet_id TEXT NOT NULL,
  fir TEXT NOT NULL,
  hazard_type TEXT NOT NULL,
  severity TEXT,
  altitude_base_ft INTEGER,
  altitude_top_ft INTEGER,
  polygon_json TEXT,
  valid_from TEXT NOT NULL,
  valid_to TEXT NOT NULL,
  raw_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notam_number TEXT NOT NULL,
  airport_icao TEXT,
  fir TEXT,
  notam_type TEXT,
  subject TEXT,
  condition TEXT,
  description TEXT NOT NULL,
  altitude_base_ft INTEGER,
  altitude_top_ft INTEGER,
  lat REAL,
  lng REAL,
  radius_nm REAL,
  valid_from TEXT NOT NULL,
  valid_to TEXT,
  raw_text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pireps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_time TEXT DEFAULT (datetime('now')),
  aircraft_type TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  altitude_ft INTEGER,
  turbulence_intensity TEXT,
  icing_intensity TEXT,
  sky_condition TEXT,
  weather TEXT,
  temperature_c REAL,
  wind_direction INTEGER,
  wind_speed_kts REAL,
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS airport_intelligence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icao_code TEXT NOT NULL UNIQUE,
  iata_code TEXT,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  elevation_ft INTEGER,
  longest_runway_ft INTEGER,
  runway_count INTEGER,
  ils_cat TEXT,
  airport_category TEXT,
  arr_capacity_per_hour INTEGER DEFAULT 30,
  dep_capacity_per_hour INTEGER DEFAULT 30,
  current_arr_rate INTEGER DEFAULT 0,
  delay_index REAL DEFAULT 0,
  avg_taxi_in_min REAL DEFAULT 15,
  avg_taxi_out_min REAL DEFAULT 20,
  atis_freq REAL,
  tower_freq REAL,
  approach_freq REAL,
  ground_freq REAL,
  slot_coordinated INTEGER DEFAULT 0,
  fog_prone INTEGER DEFAULT 0,
  monsoon_risk TEXT DEFAULT 'LOW',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crew_fdtl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT NOT NULL REFERENCES flights(id),
  crew_name TEXT NOT NULL,
  crew_role TEXT NOT NULL,
  license_number TEXT,
  fdp_start TEXT NOT NULL,
  fdp_accumulated_minutes INTEGER DEFAULT 0,
  max_fdp_minutes INTEGER DEFAULT 720,
  last_rest_hours REAL DEFAULT 12,
  weekly_hours REAL DEFAULT 0,
  fatigue_score REAL DEFAULT 0,
  fdtl_compliant INTEGER DEFAULT 1,
  extension_required INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS iot_cargo_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT NOT NULL REFERENCES flights(id),
  uld_number TEXT,
  awb_number TEXT,
  timestamp TEXT DEFAULT (datetime('now')),
  temperature_c REAL,
  humidity_percent REAL,
  pressure_hpa REAL,
  shock_g REAL DEFAULT 0,
  uld_lat REAL,
  uld_lng REAL,
  battery_percent REAL,
  blockchain_logged INTEGER DEFAULT 0,
  tx_hash TEXT
);

CREATE TABLE IF NOT EXISTS dark_aircraft_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  suspected_registration TEXT,
  suspected_icao_hex TEXT,
  last_known_lat REAL,
  last_known_lng REAL,
  last_known_altitude_ft REAL,
  adsb_gap_minutes REAL,
  anomaly_type TEXT NOT NULL,
  risk_score REAL DEFAULT 0,
  description TEXT,
  source TEXT NOT NULL,
  near_flight_id TEXT REFERENCES flights(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fuel_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airport_icao TEXT NOT NULL,
  fuel_type TEXT DEFAULT 'JET_A1',
  price_inr_per_kl REAL,
  price_usd_per_gal REAL,
  recorded_at TEXT DEFAULT (datetime('now')),
  source TEXT DEFAULT 'MoPNG'
);

CREATE TABLE IF NOT EXISTS blockchain_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  flight_id TEXT NOT NULL REFERENCES flights(id),
  event_type TEXT NOT NULL,
  tx_hash TEXT,
  block_number INTEGER,
  ipfs_hash TEXT,
  data_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS manual_cargo (
  id STRING PRIMARY KEY,
  flight_number STRING NOT NULL,
  aircraft_name STRING,
  origin STRING,
  destination STRING,
  cargo_type STRING,
  weight_kg FLOAT,
  volume_cbm FLOAT,
  sender_details STRING,
  receiver_details STRING,
  departure_time STRING,
  eta STRING,
  status STRING DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS cargo_checkpoints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cargo_id STRING,
  checkpoint_name STRING,
  sequence_order INT,
  lat FLOAT,
  lng FLOAT,
  status STRING DEFAULT 'PENDING',
  actual_time STRING
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type STRING,
  message STRING,
  is_read INT DEFAULT 0,
  created_at STRING DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(schema);

export default db;
