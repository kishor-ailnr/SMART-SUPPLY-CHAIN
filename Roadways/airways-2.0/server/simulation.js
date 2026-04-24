const fs = require('fs');
const { db } = require('./db');

function startSimulation(server) {
  const { WebSocketServer } = require('ws');
  // Re-use existing WSS if possible, or bind custom logic
  // For simplicity, we just bind a new generic interval broadcasting to all connected clients
  const wss = new WebSocketServer({ noServer: true });
  
  server.on('upgrade', function upgrade(request, socket, head) {
    // Only handle if true
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      flights: db.prepare('SELECT * FROM flights').all(),
      vehicles: db.prepare('SELECT * FROM vehicles').all(),
      cargo: db.prepare('SELECT * FROM cargo_shipments').all()
    }));
  });

  // Flight Simulation Tick
  setInterval(() => {
    try {
      const activeFlights = db.prepare("SELECT * FROM flights WHERE status='ACTIVE'").all();
      
      activeFlights.forEach(flight => {
        const lastPos = db.prepare("SELECT * FROM adsb_positions WHERE flight_id = ? ORDER BY id DESC LIMIT 1").get(flight.id);
        
        // Mocking movement: just nudging coords slightly for demonstration
        if (lastPos) {
          const newLat = lastPos.lat + (Math.random() - 0.4) * 0.05;
          const newLng = lastPos.lng + (Math.random() - 0.4) * 0.05;
          const newAlt = lastPos.altitude_ft + (Math.random() - 0.5) * 100;
          
          db.prepare("INSERT INTO adsb_positions (flight_id, lat, lng, altitude_ft) VALUES (?, ?, ?, ?)").run(flight.id, newLat, newLng, newAlt);
        } else {
          // If no pos, fake it near origin
          db.prepare("INSERT INTO adsb_positions (flight_id, lat, lng, altitude_ft) VALUES (?, ?, ?, ?)").run(flight.id, 28.55, 77.10, 1000);
        }
      });
      
      // Broadcast flights
      const updatedFlights = db.prepare('SELECT f.*, p.lat, p.lng, p.altitude_ft FROM flights f LEFT JOIN adsb_positions p ON f.id = p.flight_id GROUP BY f.id HAVING MAX(p.id)').all();
      
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({ type: 'FLIGHT_UPDATE', version: '2.0', flights: updatedFlights }));
        }
      });
    } catch(e) { console.error("Sim error", e)}
  }, 2000);

  // Vehicle Simulation Tick
  setInterval(() => {
     try {
       const activeVehicles = db.prepare("SELECT * FROM vehicles WHERE status IN ('EN_ROUTE', 'AT_CHECKPOINT')").all();
       activeVehicles.forEach(v => {
           const newLat = v.current_lat + (Math.random() - 0.4) * 0.01;
           const newLng = v.current_lng + (Math.random() - 0.4) * 0.01;
           db.prepare("UPDATE vehicles SET current_lat=?, current_lng=? WHERE id=?").run(newLat, newLng, v.id);
           db.prepare("UPDATE cargo_shipments SET current_lat=?, current_lng=? WHERE id IN (SELECT cargo_id FROM vehicle_trips WHERE vehicle_id=?)").run(newLat, newLng, v.id);
       });
       
       const updatedVehicles = db.prepare('SELECT * FROM vehicles').all();
       wss.clients.forEach(client => {
         if (client.readyState === 1) {
           client.send(JSON.stringify({ type: 'VEHICLE_UPDATE', version: '2.0', vehicles: updatedVehicles }));
         }
       });
     } catch(e) { console.error("Sim error2", e)}
  }, 3000);
  
  // IoT Simulation Tick
  setInterval(() => {
    const cargos = db.prepare("SELECT id FROM cargo_shipments").all();
    if(cargos.length > 0) {
      const target = cargos[0];
      if (Math.random() > 0.8) {
         const alertMsg = { type: 'IOT_ALERT', version: '2.0', cargo_id: target.id, alert_type: 'TEMP_BREACH', message: 'Temperature spiked to 9.1C' };
         wss.clients.forEach(client => client.readyState === 1 && client.send(JSON.stringify(alertMsg)));
      }
    }
  }, 5000);
}

module.exports = { startSimulation };
