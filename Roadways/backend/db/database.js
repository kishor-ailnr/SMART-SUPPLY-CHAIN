const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'roadways.sqlite');
let dbInstance = null;

function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const execSql = sql => new Promise((resolve, reject) => {
    dbInstance.exec(sql, err => {
      if (err) reject(err);
      else resolve();
    });
  });
  return files.reduce((p, file) => p.then(() => {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    return execSql(sql).then(() => console.log(`Applied migration ${file}`));
  }), Promise.resolve());
}

function initDatabase() {
  return new Promise((resolve, reject) => {
    dbInstance = new sqlite3.Database(dbPath, err => {
      if (err) return reject(err);
      runMigrations()
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function getDb() {
  if (!dbInstance) throw new Error('Database not initialized. Call initDatabase() first.');
  return {
    all: (sql, params = []) => new Promise((resolve, reject) => {
      dbInstance.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    }),
    get: (sql, params = []) => new Promise((resolve, reject) => {
      dbInstance.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
      dbInstance.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }),
    exec: (sql) => new Promise((resolve, reject) => {
      dbInstance.exec(sql, err => err ? reject(err) : resolve());
    }),
    instance: dbInstance
  };
}

module.exports = { initDatabase, getDb };
