import { getPointOnRoute, getTotalRouteDistance } from '../utils/geoUtils.js';

export class TwinAgent {
  constructor(weatherAgent, riskAgent, broadcast) {
    this.weatherAgent = weatherAgent;
    this.riskAgent = riskAgent;
    this.broadcast = broadcast;
    this.simulations = new Map();
  }

  async runSimulation(vessel) {
    if (!vessel.confirmedRoute || vessel.confirmedRoute.length < 2) return null;

    const simulatedPath = [];
    const totalDist = getTotalRouteDistance(vessel.confirmedRoute);
    const avgSpeed = vessel.speed || 14; // knots
    const avgSpeedKmh = avgSpeed * 1.852;
    
    // Project next 48 hours, every 2 hours
    for (let h = 0; h <= 48; h += 2) {
      const distToCover = avgSpeedKmh * h;
      if (distToCover > totalDist) break;
      
      const pos = getPointOnRoute(vessel.confirmedRoute, distToCover);
      if (!pos) continue;

      const weather = await this.weatherAgent.getMarineWeather(pos.lat, pos.lng);
      // Mock risk evaluation for twin
      const dummyVessel = { ...vessel, lat: pos.lat, lng: pos.lng };
      const risk = this.riskAgent.evaluateRisk(dummyVessel, weather);
      
      simulatedPath.push({
        lat: pos.lat,
        lng: pos.lng,
        hoursFromNow: h,
        estimatedTime: new Date(Date.now() + h * 3600000).toISOString(),
        weather,
        danger: risk.level,
        riskZone: risk.reason
      });
    }

    const result = {
      vesselId: vessel.vesselId,
      generatedAt: new Date().toISOString(),
      simulatedPath,
      twinCurrentIndex: 0,
      predictedETA: new Date(Date.now() + (totalDist / avgSpeedKmh) * 3600000).toISOString()
    };

    this.simulations.set(vessel.vesselId, result);
    this.broadcast({ type: 'TWIN_UPDATE', data: result });
    return result;
  }
}
