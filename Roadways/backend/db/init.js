const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../db/roadways.sqlite');

function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);
  
  const schema = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf8');
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.exec(schema, (err) => {
        if (err) {
          console.error('Schema initialization error:', err);
          reject(err);
        } else {
          console.log('Database schema initialized.');
          resolve(db);
        }
      });
    });
  });
}

module.exports = { initializeDatabase, dbPath };
