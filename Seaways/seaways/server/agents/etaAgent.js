import { getTotalRouteDistance } from '../utils/geoUtils.js';

export class ETAAgent {
  constructor(alertAgent, broadcast) {
    this.alertAgent = alertAgent;
    this.broadcast = broadcast;
  }

  calculateETA(vessel) {
    if (!vessel.confirmedRoute) return;

    const remainingRoute = vessel.confirmedRoute.slice(vessel.crossedWaypoints.length || 0);
    if (remainingRoute.length === 0) return;

    const distanceKm = getTotalRouteDistance([
      { lat: vessel.lat, lng: vessel.lng },
      ...remainingRoute
    ]);
    
    const speedKnots = vessel.speed || 12;
    const speedKmh = speedKnots * 1.852;
    
    let baseHours = distanceKm / speedKmh;
    let delayHours = 0;
    
    // Simple delay factors
    if (vessel.riskLevel === 'HIGH') delayHours += 2;
    if (vessel.riskLevel === 'CRITICAL') delayHours += 5;

    vessel.etaHours = baseHours + delayHours;
    vessel.delayHours = delayHours;
    vessel.delayReason = delayHours > 0 ? `Reduced speed due to ${vessel.riskLevel} risk zone` : '';

    if (delayHours > 2) {
      this.alertAgent.createDelayAlert(vessel, delayHours);
    }

    this.broadcast({
      type: 'ETA_UPDATE',
      data: {
        vesselId: vessel.vesselId,
        etaHours: vessel.etaHours,
        delayHours: vessel.delayHours,
        delayReason: vessel.delayReason
      }
    });
  }
}
