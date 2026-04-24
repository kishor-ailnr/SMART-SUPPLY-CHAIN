import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../db/seaways.sqlite');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vessels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      imo_number TEXT NOT NULL UNIQUE,
      mmsi TEXT,
      call_sign TEXT,
      flag_state TEXT NOT NULL,
      port_of_registry TEXT,
      vessel_type TEXT NOT NULL,
      classification_society TEXT,
      build_year INTEGER,
      shipyard TEXT,
      grt REAL,
      nrt REAL,
      dwt REAL,
      loa REAL,
      beam REAL,
      depth REAL,
      max_draft REAL,
      service_speed REAL,
      max_speed REAL,
      main_engine_kw REAL,
      fuel_type TEXT DEFAULT 'VLSFO',
      daily_consumption_laden REAL,
      daily_consumption_ballast REAL,
      pi_club TEXT,
      hm_insurer TEXT,
      class_cert_expiry TEXT,
      doc_expiry TEXT,
      smc_expiry TEXT,
      issc_expiry TEXT,
      iopp_expiry TEXT,
      mlc_expiry TEXT,
      assigned_user_id TEXT,
      iot_channel_id TEXT,
      blockchain_address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS voyages (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL REFERENCES vessels(id),
      voyage_number TEXT NOT NULL,
      departure_port TEXT NOT NULL,
      departure_lat REAL NOT NULL,
      departure_lng REAL NOT NULL,
      departure_time TEXT,
      arrival_port TEXT NOT NULL,
      arrival_lat REAL NOT NULL,
      arrival_lng REAL NOT NULL,
      eta TEXT,
      ata TEXT,
      route_key TEXT NOT NULL,
      cargo_type TEXT,
      cargo_quantity REAL,
      cargo_unit TEXT,
      cargo_value REAL,
      charterer TEXT,
      shipper TEXT,
      consignee TEXT,
      bill_of_lading TEXT,
      charter_party_type TEXT,
      laytime_hours REAL DEFAULT 0,
      demurrage_rate_usd REAL DEFAULT 0,
      status TEXT DEFAULT 'ACTIVE',
      total_distance_nm REAL DEFAULT 0,
      total_bunker_consumed REAL DEFAULT 0,
      total_bunker_cost_usd REAL DEFAULT 0,
      total_canal_dues_usd REAL DEFAULT 0,
      total_port_dues_usd REAL DEFAULT 0,
      total_co2_mt REAL DEFAULT 0,
      cii_rating TEXT,
      peak_risk_level TEXT DEFAULT 'LOW',
      blockchain_voyage_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS waypoints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voyage_id TEXT NOT NULL REFERENCES voyages(id),
      route_key TEXT NOT NULL,
      sequence_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      waypoint_type TEXT DEFAULT 'WAYPOINT',
      planned_eta TEXT,
      actual_eta TEXT,
      status TEXT DEFAULT 'FUTURE',
      weather_at_crossing TEXT,
      sea_state_at_crossing TEXT,
      use_count INTEGER DEFAULT 1,
      last_used_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ais_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_id TEXT NOT NULL REFERENCES vessels(id),
      voyage_id TEXT REFERENCES voyages(id),
      timestamp TEXT DEFAULT (datetime('now')),
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      sog REAL,
      cog REAL,
      true_heading REAL,
      rot REAL,
      nav_status TEXT,
      draught REAL,
      ais_source TEXT,
      signal_quality INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS piracy_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_date TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      incident_type TEXT NOT NULL,
      vessel_type_targeted TEXT,
      description TEXT,
      source TEXT DEFAULT 'IMB',
      severity TEXT DEFAULT 'HIGH',
      zone_name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS iot_cargo_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_id TEXT NOT NULL REFERENCES vessels(id),
      voyage_id TEXT REFERENCES voyages(id),
      hold_number INTEGER DEFAULT 1,
      timestamp TEXT DEFAULT (datetime('now')),
      temperature REAL,
      humidity REAL,
      shock_g REAL DEFAULT 0,
      hatch_open INTEGER DEFAULT 0,
      seal_status TEXT DEFAULT 'INTACT',
      tag_lat REAL,
      tag_lng REAL,
      battery_percent REAL,
      blockchain_logged INTEGER DEFAULT 0,
      tx_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS intelligence_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vessel_id TEXT,
      voyage_id TEXT,
      event_type TEXT NOT NULL,
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT DEFAULT 'LOW',
      lat REAL,
      lng REAL,
      affected_zone TEXT,
      confidence_score REAL DEFAULT 0.5,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export default db;
