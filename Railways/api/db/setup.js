import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'railways.sqlite');

export function setupDB() {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trains (
      id TEXT PRIMARY KEY,
      train_number TEXT NOT NULL UNIQUE,
      train_name TEXT NOT NULL,
      train_type TEXT NOT NULL,
      operator TEXT DEFAULT 'INDIAN_RAILWAYS',
      zone TEXT NOT NULL,
      division TEXT NOT NULL,
      rake_type TEXT NOT NULL,
      loco_type TEXT,
      loco_number TEXT,
      loco_shed TEXT,
      coach_count INTEGER DEFAULT 0,
      total_capacity INTEGER DEFAULT 0,
      max_speed_kmh INTEGER DEFAULT 110,
      is_electrified INTEGER DEFAULT 0,
      kavach_installed INTEGER DEFAULT 0,
      is_freight INTEGER DEFAULT 0,
      is_heritage INTEGER DEFAULT 0,
      is_metro INTEGER DEFAULT 0,
      is_dfc INTEGER DEFAULT 0,
      iot_channel_id TEXT,
      blockchain_address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS train_runs (
      id TEXT PRIMARY KEY,
      train_id TEXT NOT NULL REFERENCES trains(id),
      run_date TEXT NOT NULL,
      origin_station_code TEXT NOT NULL,
      origin_station_name TEXT NOT NULL,
      origin_lat REAL NOT NULL,
      origin_lng REAL NOT NULL,
      destination_station_code TEXT NOT NULL,
      destination_station_name TEXT NOT NULL,
      destination_lat REAL NOT NULL,
      destination_lng REAL NOT NULL,
      route_key TEXT NOT NULL,
      scheduled_departure TEXT NOT NULL,
      actual_departure TEXT,
      scheduled_arrival TEXT NOT NULL,
      estimated_arrival TEXT,
      actual_arrival TEXT,
      total_distance_km REAL DEFAULT 0,
      delay_minutes INTEGER DEFAULT 0,
      delay_reason TEXT,
      delay_category TEXT,
      status TEXT DEFAULT 'SCHEDULED',
      is_diverted INTEGER DEFAULT 0,
      diversion_reason TEXT,
      loco_pilot_name TEXT,
      alp_name TEXT,
      guard_name TEXT,
      passenger_count INTEGER DEFAULT 0,
      freight_weight_tonnes REAL DEFAULT 0,
      wagon_count INTEGER DEFAULT 0,
      fuel_consumed_liters REAL DEFAULT 0,
      electricity_consumed_kwh REAL DEFAULT 0,
      carbon_kg REAL DEFAULT 0,
      peak_risk_level TEXT DEFAULT 'LOW',
      blockchain_run_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS train_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES train_runs(id),
      route_key TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      station_code TEXT NOT NULL,
      station_name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      distance_from_origin_km REAL DEFAULT 0,
      scheduled_arrival TEXT,
      scheduled_departure TEXT,
      actual_arrival TEXT,
      actual_departure TEXT,
      predicted_arrival TEXT,
      predicted_departure TEXT,
      halt_minutes INTEGER DEFAULT 0,
      delay_at_station INTEGER DEFAULT 0,
      platform_number INTEGER,
      status TEXT DEFAULT 'FUTURE',
      weather_at_crossing TEXT,
      track_condition TEXT,
      use_count INTEGER DEFAULT 1,
      last_used_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS train_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id TEXT NOT NULL REFERENCES trains(id),
      run_id TEXT REFERENCES train_runs(id),
      timestamp TEXT DEFAULT (datetime('now')),
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      speed_kmh REAL,
      heading REAL,
      current_section TEXT,
      between_stations TEXT,
      distance_from_origin_km REAL,
      source TEXT DEFAULT 'NTES',
      signal_quality INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS india_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_code TEXT NOT NULL UNIQUE,
      station_name TEXT NOT NULL,
      city TEXT,
      state TEXT NOT NULL,
      zone TEXT NOT NULL,
      division TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      elevation_m REAL DEFAULT 0,
      category TEXT DEFAULT 'D',
      platform_count INTEGER DEFAULT 1,
      track_count INTEGER DEFAULT 2,
      is_junction INTEGER DEFAULT 0,
      is_terminus INTEGER DEFAULT 0,
      has_prs INTEGER DEFAULT 0,
      has_catering INTEGER DEFAULT 0,
      has_retiring_room INTEGER DEFAULT 0,
      has_medical INTEGER DEFAULT 0,
      has_rpf INTEGER DEFAULT 0,
      fog_prone INTEGER DEFAULT 0,
      flood_risk TEXT DEFAULT 'LOW',
      avg_daily_trains INTEGER DEFAULT 10,
      avg_daily_passengers INTEGER DEFAULT 500
    );

    CREATE TABLE IF NOT EXISTS india_track_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_name TEXT NOT NULL,
      from_station TEXT NOT NULL,
      to_station TEXT NOT NULL,
      zone TEXT NOT NULL,
      division TEXT NOT NULL,
      track_type TEXT DEFAULT 'BG',
      is_electrified INTEGER DEFAULT 1,
      electrification_type TEXT DEFAULT 'AC_25KV',
      is_double_line INTEGER DEFAULT 1,
      is_dfc INTEGER DEFAULT 0,
      max_speed_passenger_kmh INTEGER DEFAULT 110,
      max_speed_freight_kmh INTEGER DEFAULT 75,
      distance_km REAL NOT NULL,
      kavach_installed INTEGER DEFAULT 0,
      ctc_section INTEGER DEFAULT 0,
      ei_section INTEGER DEFAULT 0,
      track_quality_index REAL DEFAULT 3.0,
      fog_risk TEXT DEFAULT 'LOW',
      flood_risk TEXT DEFAULT 'LOW',
      landslide_risk TEXT DEFAULT 'LOW',
      psr_active INTEGER DEFAULT 0,
      psr_speed_kmh INTEGER,
      psr_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS india_bridges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bridge_name TEXT NOT NULL,
      section_id INTEGER REFERENCES india_track_sections(id),
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      river_name TEXT,
      span_meters REAL,
      bridge_type TEXT,
      year_built INTEGER,
      last_inspection_date TEXT,
      load_class TEXT,
      flood_threshold_gauge_m REAL,
      bhm_installed INTEGER DEFAULT 0,
      condition TEXT DEFAULT 'FAIR'
    );

    CREATE TABLE IF NOT EXISTS india_level_crossings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lc_number TEXT NOT NULL,
      section_id INTEGER REFERENCES india_track_sections(id),
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      lc_type TEXT DEFAULT 'UNMANNED',
      road_category TEXT,
      avg_road_traffic INTEGER DEFAULT 100,
      accident_count_5yr INTEGER DEFAULT 0,
      lcd_planned INTEGER DEFAULT 0,
      visibility_m INTEGER DEFAULT 200
    );

    CREATE TABLE IF NOT EXISTS crew_hoer (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES train_runs(id),
      crew_name TEXT NOT NULL,
      crew_role TEXT NOT NULL,
      staff_number TEXT,
      home_division TEXT,
      duty_start TEXT NOT NULL,
      duty_accumulated_minutes INTEGER DEFAULT 0,
      max_duty_minutes INTEGER DEFAULT 600,
      last_rest_hours REAL DEFAULT 8,
      weekly_hours REAL DEFAULT 0,
      vcd_compliance_percent REAL DEFAULT 100,
      fatigue_score REAL DEFAULT 0,
      hoer_compliant INTEGER DEFAULT 1,
      crew_change_station TEXT,
      crew_change_due_at TEXT
    );

    CREATE TABLE IF NOT EXISTS iot_wagon_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL REFERENCES train_runs(id),
      wagon_number TEXT NOT NULL,
      wagon_position INTEGER,
      timestamp TEXT DEFAULT (datetime('now')),
      axle_temp_max REAL,
      door_seal_status TEXT DEFAULT 'SEALED',
      cargo_temp REAL,
      cargo_humidity REAL,
      shock_g REAL DEFAULT 0,
      wagon_lat REAL,
      wagon_lng REAL,
      rfid_tag_id TEXT,
      battery_percent REAL,
      blockchain_logged INTEGER DEFAULT 0,
      tx_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS india_fog_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER REFERENCES india_track_sections(id),
      station_code TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      min_visibility_m REAL,
      trains_affected INTEGER DEFAULT 0,
      avg_delay_minutes REAL DEFAULT 0,
      season TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS india_flood_track_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER REFERENCES india_track_sections(id),
      bridge_id INTEGER REFERENCES india_bridges(id),
      river_gauge_m REAL,
      track_submerged INTEGER DEFAULT 0,
      closure_start TEXT,
      closure_end TEXT,
      diversion_available INTEGER DEFAULT 0,
      diversion_route TEXT,
      trains_cancelled INTEGER DEFAULT 0,
      season TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS safety_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id TEXT REFERENCES trains(id),
      run_id TEXT REFERENCES train_runs(id),
      section_id INTEGER REFERENCES india_track_sections(id),
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      lat REAL,
      lng REAL,
      description TEXT NOT NULL,
      source TEXT NOT NULL,
      acknowledged INTEGER DEFAULT 0,
      acknowledged_by TEXT,
      acknowledged_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blockchain_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id TEXT NOT NULL REFERENCES trains(id),
      run_id TEXT,
      event_type TEXT NOT NULL,
      tx_hash TEXT,
      block_number INTEGER,
      ipfs_hash TEXT,
      data_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  
  return db;
}

export { dbPath };
