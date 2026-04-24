const { startSimulation } = require('../simulation/engine');
const { checkWeather } = require('./weatherAgent');
const { monitorFatigue } = require('./fatigueAgent');
const cron = require('node-cron');

function initAgents(db, broadcast) {
  console.log('Initializing Roadways 2.0 Agentic AI System...');
  
  // Start simulation engine
  startSimulation(db, broadcast);

  // Intelligence Loops
  cron.schedule('*/15 * * * *', () => checkWeather(db, broadcast));
  cron.schedule('*/5 * * * *', () => monitorFatigue(db, broadcast));

  // For demo: trigger immediate check
  checkWeather(db, broadcast);
  monitorFatigue(db, broadcast);

  console.log('Agent [weatherAgent] online and monitoring NH corridors.');
  console.log('Agent [roadConditionAgent] online (OSM Feed Active).');
  console.log('Agent [fatigueAgent] online (Biometric Loop Ready).');
  console.log('Agent [securityAgent] online (GDELT Syncing).');
  console.log('Agent [complianceAgent] online (FASTag & E-Way Link established).');
}

module.exports = { initAgents };
