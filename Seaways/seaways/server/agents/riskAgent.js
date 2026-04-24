import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class RiskAgent {
  constructor(broadcast) {
    this.broadcast = broadcast;
    this.riskZones = [];
    this.loadRiskZones();
  }

  loadRiskZones() {
    try {
      const data = fs.readFileSync(path.join(__dirname, '../data/riskZones.json'), 'utf8');
      this.riskZones = JSON.parse(data);
    } catch (error) {
      console.error('Failed to load risk zones', error);
    }
  }

  evaluateRisk(vessel, weather) {
    let geoRisk = 'LOW';
    let geoReason = '';
    
    const point = turf.point([vessel.lng, vessel.lat]);

    for (const zone of this.riskZones) {
      if (zone.status !== 'ACTIVE') continue;
      
      const polygon = turf.polygon([zone.polygon]);
      const isInside = turf.booleanPointInPolygon(point, polygon);
      
      if (isInside) {
        geoRisk = zone.severity;
        geoReason = `${zone.name} (${zone.riskType})`;
        break;
      }

      const distance = turf.distance(point, turf.centroid(polygon), { units: 'kilometers' });
      const distanceNM = distance / 1.852;

      if (distanceNM < 50 && (zone.severity === 'CRITICAL' || zone.severity === 'HIGH')) {
        geoRisk = 'HIGH';
        geoReason = `Proximal to ${zone.name}`;
      } else if (distanceNM < 100 && geoRisk === 'LOW') {
        geoRisk = 'MEDIUM';
        geoReason = `Approaching ${zone.name}`;
      }
    }

    let weatherRisk = 'LOW';
    let weatherReason = '';

    if (weather) {
      if (weather.waveHeight >= 7 || weather.windSpeed >= 70) {
        weatherRisk = 'CRITICAL';
        weatherReason = 'Extreme weather conditions';
      } else if (weather.waveHeight >= 5 || weather.windSpeed >= 55) {
        weatherRisk = 'HIGH';
        weatherReason = 'Severe weather conditions';
      } else if (weather.waveHeight >= 3 || weather.windSpeed >= 40) {
        weatherRisk = 'MEDIUM';
        weatherReason = 'Moderate weather conditions';
      }
    }

    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const finalRiskIndex = Math.max(levels.indexOf(geoRisk), levels.indexOf(weatherRisk));
    const finalRisk = levels[finalRiskIndex];
    const finalReason = [geoReason, weatherReason].filter(Boolean).join(' | ');

    if (vessel.riskLevel !== finalRisk) {
      vessel.riskLevel = finalRisk;
      vessel.riskReason = finalReason;
      this.broadcast({
        type: 'RISK_UPDATE',
        data: { vesselId: vessel.vesselId, riskLevel: finalRisk, riskReason: finalReason }
      });
    }

    return { level: finalRisk, reason: finalReason };
  }
}
