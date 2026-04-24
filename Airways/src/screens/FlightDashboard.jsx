import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MessageSquare, Shield, Activity, Users, Box, Cpu, ChevronRight, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icon for the aircraft
const createAircraftIcon = (type, heading, risk) => {
  let color = '#2dc653'; 
  if (risk === 'CAUTION') color = '#ffd60a';
  if (risk === 'HIGH') color = '#ff6b35';
  if (risk === 'CRITICAL' || risk === 'EMERGENCY') color = '#d00000';

  const svg = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="${color}" transform="rotate(${heading})" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-none',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function FlightDashboard() {
  const { currentFlightId, setScreen } = useStore();
  const [flightData, setFlightData] = useState(null);
  const [activeTab, setActiveTab] = useState('INTELLIGENCE');

  useEffect(() => {
    if (!currentFlightId) return;
    
    // Fetch detailed flight info
    fetch(`http://localhost:6002/api/flights/${currentFlightId}`)
      .then(res => res.json())
      .then(data => setFlightData(data))
      .catch(console.error);
      
    // Poll for updates every 5s
    const interval = setInterval(() => {
      fetch(`http://localhost:6002/api/flights/${currentFlightId}`)
        .then(res => res.json())
        .then(data => setFlightData(data))
        .catch(console.error);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentFlightId]);

  if (!flightData) {
    return <div className="h-screen w-screen bg-bg-primary flex items-center justify-center text-accent animate-pulse font-mono font-bold text-xl">LOADING TELEMETRY...</div>;
  }

  const riskClasses = {
    'SAFE': 'text-safe bg-safe-dim border-safe',
    'CAUTION': 'text-caution bg-caution-dim border-caution',
    'HIGH': 'text-warning bg-warning-dim border-warning',
    'CRITICAL': 'text-emergency bg-emergency-pulse border-emergency animate-pulse',
    'EMERGENCY': 'text-emergency bg-emergency-pulse border-emergency animate-pulse'
  };
  
  const riskColor = riskClasses[flightData.peak_risk_level] || riskClasses['SAFE'];

  // Tabs
  const tabs = [
    { id: 'INTELLIGENCE', icon: Cpu, label: 'AIRCRAFT' },
    { id: 'ROUTE', icon: Navigation, label: 'ROUTE' },
    { id: 'PREDICTIVE', icon: Activity, label: 'AI WX' },
    { id: 'CREW', icon: Users, label: 'CREW' },
    { id: 'CARGO', icon: Box, label: 'CARGO' },
    { id: 'COMPLIANCE', icon: Shield, label: 'COMPLIANCE' }
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden font-body text-text-primary">
      {/* Header */}
      <header className="h-16 flex-none border-b border-border-color bg-bg-secondary flex items-center justify-between px-6 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('OVERVIEW')} className="text-text-secondary hover:text-accent transition-colors p-2 rounded-full hover:bg-bg-tertiary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl text-accent tracking-widest leading-none">
              {flightData.callsign || flightData.flight_number_iata}
            </span>
            <span className="text-xs font-mono text-text-secondary">
              {flightData.registration} | {flightData.aircraft_type}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-mono tracking-widest">
           <div className="text-center">
             <div className="text-text-secondary text-[10px]">ORIGIN</div>
             <div className="text-text-primary text-lg">{flightData.origin_icao}</div>
           </div>
           <ArrowRight className="w-4 h-4 text-accent" />
           <div className="text-center">
             <div className="text-text-secondary text-[10px]">DEST</div>
             <div className="text-text-primary text-lg">{flightData.destination_icao}</div>
           </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setScreen('TWIN', flightData.id)} className="bg-accent-dim text-accent border border-accent-border px-6 py-2 uppercase font-bold text-xs tracking-widest rounded hover:bg-accent hover:text-bg-primary transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]">
            DIGITAL TWIN
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex">
        {/* Left Map Area */}
        <div className="flex-1 relative">
           {/* Add a simplified Map for demo purposes */}
           <MapContainer 
            center={[flightData.lat || 22.0, flightData.lng || 79.0]} 
            zoom={6} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Draw Path from track */}
            {flightData.track && flightData.track.length > 0 && (
              <Polyline 
                positions={flightData.track.map(p => [p.lat, p.lng])} 
                color="#00b4d8" 
                weight={3} 
                dashArray="5, 10" 
              />
            )}
            
            {flightData.lat && (
              <Marker 
                position={[flightData.lat, flightData.lng]}
                icon={createAircraftIcon(flightData.aircraft_type, flightData.true_heading, flightData.peak_risk_level)}
              />
            )}
          </MapContainer>
          
          {/* Overlaid Data Elements on Map */}
          <div className="absolute top-4 left-4 z-[400] flex gap-2">
            <div className="glass-panel text-xs font-mono p-3 w-48 shadow-lg">
                <div className="text-text-secondary mb-1 border-b border-border-color pb-1">TELEMETRY</div>
                <div className="flex justify-between py-1"><span>ALT:</span> <span className="text-accent">FL{Math.floor((flightData.altitude_ft || 0)/100)}</span></div>
                <div className="flex justify-between py-1"><span>HDG:</span> <span className="text-text-primary">{Math.round(flightData.true_heading || 0)}°</span></div>
                <div className="flex justify-between py-1"><span>SQWK:</span> <span className="text-text-primary">{flightData.squawk || '1000'}</span></div>
                <div className="flex justify-between py-1 items-center">
                  <span>SIG:</span> 
                  <div className="w-16 h-2 bg-bg-tertiary rounded overflow-hidden flex">
                    <div className="h-full bg-safe" style={{ width: `${flightData.signal_quality || 100}%`}}></div>
                  </div>
                </div>
            </div>
            
            {(flightData.peak_risk_level === 'HIGH' || flightData.peak_risk_level === 'CRITICAL' || flightData.peak_risk_level === 'EMERGENCY') && (
              <div className={`p-3 rounded border shadow-lg uppercase font-mono text-xs font-bold ${riskColor}`}>
                <div>ALERT ACTIVE</div>
                <div className="mt-1 text-[10px] break-words whitespace-normal tracking-wide">
                  {flightData.delay_reason || "SYSTEM ANOMALY DETECTED. CHECK PREDICTIVE AI."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Intelligence Panel */}
        <div className="w-[450px] bg-bg-secondary border-l border-border-color z-10 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
           {/* Tab Headers */}
           <div className="grid grid-cols-3 border-b border-border-color text-xs text-text-secondary font-display tracking-widest bg-bg-tertiary">
             {tabs.map(tab => {
               const Icon = tab.icon;
               return (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 p-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-accent text-accent bg-bg-hover' : 'border-transparent hover:text-text-primary hover:bg-bg-primary'}`}
                 >
                   {/* Provide dummy icon if needed, but lucid brings them in */}
                   <span className="truncate">{tab.label}</span>
                 </button>
               )
             })}
           </div>
           
           {/* Tab Content Area */}
           <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-text-secondary custom-scroll">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === 'INTELLIGENCE' && (
                    <>
                      <div className="space-y-3">
                        <h3 className="text-text-primary border-b border-border-color pb-1 mb-2 font-display tracking-widest uppercase">AIRFRAME PARTICULARS</h3>
                        <div className="grid grid-cols-2 gap-y-2">
                          <div>TYPE: <span className="text-accent">{flightData.aircraft_type}</span></div>
                          <div>REG: <span className="text-accent">{flightData.registration}</span></div>
                          <div>MFR: <span className="text-white">{flightData.manufacturer || 'BOEING'}</span></div>
                          <div>ENG: <span className="text-white">{flightData.engine_type || 'GE90-115B'}</span></div>
                          <div>MTOW: <span className="text-white">{(flightData.mtow_kg/1000).toFixed(1) || '351.5'}T</span></div>
                          <div>ETOPS: <span className="text-white">{flightData.etops_minutes || 180} MIN</span></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-text-primary border-b border-border-color pb-1 mb-2 font-display tracking-widest uppercase mt-6">LIVE TELEMETRY</h3>
                        <div className="p-3 bg-bg-tertiary rounded border border-border-color grid gap-2">
                           <div className="flex justify-between">
                             <span>OUTSIDE AIR TEMP (OAT)</span>
                             <span className="text-accent">-46°C</span>
                           </div>
                           <div className="flex justify-between">
                             <span>CABIN ALTITUDE</span>
                             <span className="text-safe">4,200 FT</span>
                           </div>
                           <div className="flex justify-between">
                             <span>FUEL FLOW (/HR)</span>
                             <span className="text-white">8,240 KG</span>
                           </div>
                           <div className="flex justify-between">
                             <span>ADS-B MESSAGE RATE</span>
                             <span className="text-safe animate-pulse">NOMINAL (4Hz)</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-text-primary border-b border-border-color pb-1 mb-2 font-display tracking-widest uppercase mt-6">BLOCKCHAIN MANIFEST (POLYGON)</h3>
                        <div className="p-3 bg-[#13072e] border border-[#7b3fe4] rounded text-[#b388ff] break-all leading-tight">
                          STATUS: <span className="font-bold text-white mb-2 block">SEALED (TAMPER-RESISTANT)</span>
                          TX: 0x8f2c9e78a4b...d3f6
                        </div>
                      </div>
                    </>
                  )}
                  
                  {activeTab === 'ROUTE' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-bg-tertiary rounded">
                        <div className="text-[10px] text-accent mb-1">FILED ROUTE STRING</div>
                        <div className="text-white leading-relaxed tracking-wider break-words">
                          {flightData.route_string || "DCT GIVAL L301 PARDI DCT"}
                        </div>
                      </div>
                      <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-border-color">
                        {/* Waypoint 1 */}
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-safe ring-4 ring-bg-secondary"></div>
                          <div className="text-safe font-bold mb-1">GIVAL <span className="text-text-secondary text-[10px] font-normal ml-2">PASSED (14:12Z)</span></div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <span>ALT: FL350</span>
                            <span>FUEL REM: 42,100 KG</span>
                          </div>
                        </div>
                        {/* Waypoint 2 */}
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-caution ring-4 ring-bg-secondary animate-pulse"></div>
                          <div className="text-caution font-bold mb-1">PARDI <span className="text-text-secondary text-[10px] font-normal ml-2">ACTIVE SEGMENT (ETA 14:48Z)</span></div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <span>ALT: FL350</span>
                            <span>WX: TURB MOD</span>
                          </div>
                        </div>
                        {/* Waypoint 3 */}
                        <div className="relative">
                          <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-text-muted ring-4 ring-bg-secondary"></div>
                          <div className="text-text-primary font-bold mb-1">VABB <span className="text-text-secondary text-[10px] font-normal ml-2">DESTINATION (ETA 15:20Z)</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'PREDICTIVE' && (
                    <div className="space-y-4">
                      <div className="text-[10px] border border-accent-border bg-accent-dim text-accent rounded p-2 flex items-center gap-2">
                         <Activity className="w-4 h-4" />
                         <span>AI AGENTS RUNNING IN PARALLEL: 14</span>
                      </div>
                      <div className={`p-4 rounded border flex flex-col gap-2 ${riskColor}`}>
                        <div className="flex justify-between items-center font-bold font-display uppercase tracking-widest text-lg border-b border-current pb-2">
                          <span>THREAT LEVEL</span>
                          <span>{flightData.peak_risk_level}</span>
                        </div>
                        <div className="mt-2 h-32 overflow-y-auto custom-scroll shadow-inner p-2 bg-black/20 rounded">
                           {flightData.peak_risk_level === 'HIGH' ? (
                             <>
                                <p className="mb-2">&gt; <strong>AGENTS [WEATHER, TURBULENCE]</strong> REPORT SIGMET INTENSE OVER VABB APPROACH SECTOR.</p>
                                <p className="mb-2">&gt; <strong>AGENT [AIRSPACE]</strong> DETECTS CONVECTIVE CELLS WITH 40NM AVOIDANCE RADIUS.</p>
                                <p>&gt; <strong>RECOMMENDATION:</strong> INITIATE HOLDING OR RE-ROUTE DIRECT TO ALTN (VAAH). CREW ADVISED VIA ACARS.</p>
                             </>
                           ) : (
                             <p className="text-safe">&gt; ALL SYSTEMS NOMINAL. WEATHER CLEAR. FATIGUE METRICS GREEN. MANIFEST SEALED.</p>
                           )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'CREW' && (
                     <div className="space-y-4 uppercase">
                       <div className="flex justify-between border-b border-border-color pb-1">
                         <span>PIC (COMMANDER)</span>
                         <span className="text-white">{flightData.pic_name || 'CAPT. SHARMA'}</span>
                       </div>
                       <div className="flex justify-between border-b border-border-color pb-1">
                         <span>FIRST OFFICER</span>
                         <span className="text-white">{flightData.fo_name || 'F/O VERMA'}</span>
                       </div>
                       
                       <div className="pt-4 space-y-2">
                         <div className="text-text-secondary">FDTL FATIGUE MONITORING (ML PREDICTION)</div>
                         <div className="w-full h-4 bg-bg-tertiary rounded flex overflow-hidden">
                           <div className="bg-safe h-full" style={{width: '60%'}}></div>
                           <div className="bg-caution h-full" style={{width: '20%'}}></div>
                         </div>
                         <div className="flex justify-between text-[10px]">
                            <span className="text-safe">REST OK</span>
                            <span className="text-emergency">LIMIT</span>
                         </div>
                       </div>
                     </div>
                  )}
                  
                  {activeTab === 'CARGO' && (
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-border-color pb-1">
                         <span>PAX COUNT</span>
                         <span className="text-white">{flightData.pax_count} ({flightData.pax_f}F/{flightData.pax_j}J/{flightData.pax_y}Y)</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color pb-1">
                         <span>CARGO WEIGHT</span>
                         <span className="text-white">{flightData.cargo_weight_kg || 0} KG</span>
                      </div>
                      
                      <div className="mt-4 p-3 border border-border-color bg-bg-tertiary rounded">
                         <div className="flex justify-between items-center text-text-secondary mb-2 border-b border-border-color pb-1">
                           <span className="uppercase">IoT ULD MONITORING</span>
                           <Box className="w-4 h-4 text-accent" />
                         </div>
                         <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>TEMP (ULD 1): <span className="text-safe">4.2°C</span></div>
                            <div>SHOCK: <span className="text-safe">0.0G</span></div>
                            <div>HUMIDITY: <span className="text-white">45%</span></div>
                            <div>GPS: <span className="text-safe">ALIGNED</span></div>
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </div>
      
      {/* Local ArrowRight functional component to avoid another import */}
    </div>
  );
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}
