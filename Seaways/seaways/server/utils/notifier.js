export const notifyManager = (alert, escalationCount = 0) => {
  const timestamp = new Date().toISOString();
  console.log(`\n--- [MANAGER NOTIFICATION] ---`);
  console.log(`[TIME]: ${timestamp}`);
  console.log(`[ESCALATION]: ${escalationCount}`);
  console.log(`[VESSEL]: ${alert.vesselName}`);
  console.log(`[SEVERITY]: ${alert.severity}`);
  console.log(`[MESSAGE]: ${alert.message}`);
  console.log(`------------------------------\n`);
  
  // Mock email/SMS
  if (escalationCount > 0) {
    console.log(`[LOG] Sending priority SMS to Operations Manager...`);
  } else {
    console.log(`[LOG] Dispatching initial risk alert email...`);
  }
};

export const checkEscalations = (vessels, activeAlerts, broadcast) => {
  const now = Date.now();
  
  vessels.forEach(vessel => {
    vessel.alerts.forEach(alert => {
      if (!alert.acknowledged && (alert.severity === 'HIGH' || alert.severity === 'CRITICAL')) {
        const lastNotify = vessel.lastManagerNotifyTime ? new Date(vessel.lastManagerNotifyTime).getTime() : 0;
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - lastNotify > tenMinutes) {
          alert.escalationCount = (alert.escalationCount || 0) + 1;
          vessel.lastManagerNotifyTime = new Date().toISOString();
          vessel.managerNotified = true;
          
          notifyManager(alert, alert.escalationCount);
          
          broadcast({
            type: 'MANAGER_NOTIFY',
            data: {
              alert,
              escalationCount: alert.escalationCount
            }
          });
        }
      }
    });
  });
};
