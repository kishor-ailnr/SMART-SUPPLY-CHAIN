const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// GET all vehicles (live state)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT *, license_plate AS registration_number, speedKmh AS last_speed, lat AS last_lat, lng AS last_lng, heading AS last_heading FROM vehicles');
    const result = rows.map(v => {
      if (v.confirmedRoute) {
        try { v.confirmedRoute = JSON.parse(v.confirmedRoute); } catch(e) { v.confirmedRoute = []; }
      }
      return v;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new vehicle (adds to DB and returns the record)
router.post('/', async (req, res) => {
  try {
    const { name, license_plate, driver_name, driver_phone, vehicle_type, cargo_type, load_weight_tons, fuel_type, color, confirmedRoute } = req.body;
    const id = uuidv4();
    const db = getDb();
    const routeJson = JSON.stringify(confirmedRoute || []);
    await db.run(`INSERT INTO vehicles (id, name, license_plate, driver_name, driver_phone, vehicle_type, cargo_type, load_weight_tons, fuel_type, color, lat, lng, speedKmh, heading, status, confirmedRoute, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'MOVING', ?, ?)`, 
      [id, name, license_plate, driver_name, driver_phone, vehicle_type, cargo_type, load_weight_tons, fuel_type, color, routeJson, new Date().toISOString()]);
    const vehicle = await db.get('SELECT *, license_plate AS registration_number, speedKmh AS last_speed, lat AS last_lat, lng AS last_lng, heading AS last_heading FROM vehicles WHERE id = ?', [id]);
    if (vehicle && vehicle.confirmedRoute) vehicle.confirmedRoute = JSON.parse(vehicle.confirmedRoute);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single vehicle
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const vehicle = await db.get('SELECT *, license_plate AS registration_number, speedKmh AS last_speed, lat AS last_lat, lng AS last_lng, heading AS last_heading FROM vehicles WHERE id = ?', [req.params.id]);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.confirmedRoute) {
      try { vehicle.confirmedRoute = JSON.parse(vehicle.confirmedRoute); } catch(e) { vehicle.confirmedRoute = []; }
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update vehicle metadata (no live position updates here)
router.put('/:id', async (req, res) => {
  try {
    const fields = ['name','license_plate','driver_name','driver_phone','vehicle_type','cargo_type','load_weight_tons','fuel_type','color'];
    const updates = [];
    const values = [];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    const db = getDb();
    await db.run(`UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`, [...values, req.params.id]);
    const vehicle = await db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (soft‑delete) vehicle
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.run('UPDATE vehicles SET is_active = 0, status = "DECOMMISSIONED" WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
