const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../db/roadways.sqlite');
const db = new sqlite3.Database(dbPath);

const tolls = [
  { name: 'Khaniwade Toll Plaza', highway: 'NH48', state: 'Maharashtra', district: 'Palghar', lat: 19.5583, lng: 72.8894, class1_cost: 85, class2_cost: 140 },
  { name: 'Charoti Toll Plaza', highway: 'NH48', state: 'Maharashtra', district: 'Palghar', lat: 19.8767, lng: 72.9833, class1_cost: 75, class2_cost: 125 },
  { name: 'Bhilad Toll Plaza', highway: 'NH48', state: 'Gujarat', district: 'Valsad', lat: 20.2811, lng: 72.8778, class1_cost: 95, class2_cost: 160 },
  { name: 'Sambhapur Toll Plaza', highway: 'NH44', state: 'Haryana', district: 'Panipat', lat: 29.3909, lng: 76.9635, class1_cost: 105, class2_cost: 175 }
];

const checkposts = [
  { name: 'Achad Border Checkpost', state_from: 'Maharashtra', state_to: 'Gujarat', lat: 20.2750, lng: 72.8850, documents_required: 'E-Way Bill, RC, Insurance', entry_tax: 200 },
  { name: 'Bari Checkpost', state_from: 'Rajasthan', state_to: 'Gujarat', lat: 24.4500, lng: 72.4500, documents_required: 'National Permit, E-Way Bill', entry_tax: 150 }
];

db.serialize(() => {
  const insertToll = db.prepare(`
    INSERT INTO india_toll_plazas (name, highway, state, district, lat, lng, class1_cost, class2_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCheckpost = db.prepare(`
    INSERT INTO india_border_checkposts (name, state_from, state_to, lat, lng, documents_required, entry_tax)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  tolls.forEach(t => insertToll.run(t.name, t.highway, t.state, t.district, t.lat, t.lng, t.class1_cost, t.class2_cost));
  checkposts.forEach(c => insertCheckpost.run(c.name, c.state_from, c.state_to, c.lat, c.lng, c.documents_required, c.entry_tax));

  insertToll.finalize();
  insertCheckpost.finalize();
});

db.close(() => console.log('Infrastructure seeded.'));
