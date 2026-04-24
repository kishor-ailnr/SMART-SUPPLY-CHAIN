import { v4 as uuidv4 } from 'uuid';
import { notifyManager } from '../utils/notifier.js';

export class AlertAgent {
  constructor(broadcast) {
    this.broadcast = broadcast;
  }

  processRiskUpdate(vessel, risk) {
    if (risk.level === 'HIGH' || risk.level === 'CRITICAL') {
      const existingAlert = vessel.alerts.find(a => !a.acknowledged && a.severity === risk.level && a.message.includes(vessel.riskReason));
      
      if (!existingAlert) {
        const alert = {
          id: uuidv4(),
          vesselId: vessel.vesselId,
          vesselName: vessel.name,
          severity: risk.level,
          message: `High risk detected: ${risk.reason}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          managerEscalated: false,
          escalationCount: 0
        };

        vessel.alerts.push(alert);
        vessel.managerNotified = false;
        vessel.lastManagerNotifyTime = null;

        this.broadcast({ type: 'ALERT', data: alert });
        
        // Immediate notification for Critical/High
        notifyManager(alert);
      }
    }
  }

  createDelayAlert(vessel, delayHours) {
    const alert = {
      id: uuidv4(),
      vesselId: vessel.vesselId,
      vesselName: vessel.name,
      severity: delayHours > 5 ? 'HIGH' : 'MEDIUM',
      message: `Significant delay predicted: ${delayHours.toFixed(1)} hours`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    vessel.alerts.push(alert);
    this.broadcast({ type: 'ALERT', data: alert });
  }
}
