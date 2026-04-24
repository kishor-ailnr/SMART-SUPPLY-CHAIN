import { BaseAgent } from './BaseAgent.js';
import db from '../utils/db.js';

export class AISAgent extends BaseAgent {
  constructor() {
    super('AIS_INTELLIGENCE', 'Monitors vessel AIS for anomalies, gaps, and spoofing.');
  }

  async process(vesselId) {
    const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId);
    if (!vessel) return;

    const positions = db.prepare('SELECT * FROM ais_positions WHERE vessel_id = ? ORDER BY timestamp DESC LIMIT 2').all(vesselId);
    
    if (positions.length < 1) return [];

    const latest = positions[0];
    const previous = positions[1];
    const alerts = [];

    // 1. GAP Detection
    const now = new Date();
    const lastUpdate = new Date(latest.timestamp);
    const gapMinutes = (now - lastUpdate) / (1000 * 60);

    if (gapMinutes > 45) {
      alerts.push({
        vessel_id: vesselId,
        event_type: 'AIS_GAP_ALERT',
        title: 'AIS Transmission Gap',
        severity: 'CRITICAL',
        description: `${vessel.name} has not transmitted AIS for ${Math.round(gapMinutes)} minutes.`,
        confidence_score: 0.9
      });
    }

    // 2. Speed Anomaly
    if (latest.sog > vessel.max_speed * 1.1) {
      alerts.push({
        vessel_id: vesselId,
        event_type: 'SPEED_ANOMALY_ALERT',
        title: 'Abnormal Speed Detected',
        severity: 'HIGH',
        description: `${vessel.name} current speed (${latest.sog} kn) exceeds registered max speed.`,
        confidence_score: 0.85
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

    return alerts;
  }
}
