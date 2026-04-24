import { BaseAgent } from './BaseAgent.js';
import db from '../utils/db.js';

export class CargoAgent extends BaseAgent {
  constructor() {
    super('CARGO_INTEGRITY', 'Monitors reefer holds, hatch sensors, and blockchain integrity.');
  }

  async process(vesselId) {
    const readings = db.prepare(`
      SELECT * FROM iot_cargo_readings 
      WHERE vessel_id = ? AND blockchain_logged = 0 
      ORDER BY timestamp DESC LIMIT 1
    `).get(vesselId);

    if (!readings) return [];

    const alerts = [];

    // 1. Temperature Excursion
    if (readings.temperature > 5 || readings.temperature < -1) {
      alerts.push({
        vessel_id: vesselId,
        event_type: 'TEMP_EXCURSION_ALERT',
        title: 'Reefer Temperature Alert',
        severity: 'HIGH',
        description: `Sub-optimal temperature detected in hold: ${readings.temperature}°C`,
        confidence_score: 1.0
      });
    }

    // 2. Tamper Detection (Hatch Open in open sea)
    if (readings.hatch_open === 1) {
      alerts.push({
        vessel_id: vesselId,
        event_type: 'CARGO_TAMPER_ALERT',
        title: 'Unauthorized Hatch Access',
        severity: 'CRITICAL',
        description: `Hatch sensor triggered at open sea coordinates.`,
        confidence_score: 0.95
      });
    }

    // Save alerts to DB
    const insertAlert = db.prepare(`
      INSERT INTO intelligence_events (vessel_id, event_type, source, title, description, severity, confidence_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const alert of alerts) {
      insertAlert.run(alert.vessel_id, alert.event_type, this.name, alert.title, alert.description, alert.severity, alert.confidence_score);
    }

    // Mock blockchain logging
    db.prepare('UPDATE iot_cargo_readings SET blockchain_logged = 1, tx_hash = ? WHERE id = ?')
      .run('0x' + Math.random().toString(16).slice(2, 66), readings.id);

    return alerts;
  }
}
