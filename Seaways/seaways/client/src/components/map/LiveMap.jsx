import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { Ship, Anchor, AlertTriangle, Info, Clock, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const SIMULATION = {
  fleets: [
    {
      id: "ship_1",
      vessel: { name: "EVER ALOT", type: "Ultra Large Container", eta: "T+10D", speed: "18.5 kn", status: "Underway", riskLevel: "HIGH" },
      start: { lat: 22.3, lng: 114.2, name: "Hong Kong" },
      end: { lat: 51.9, lng: 4.14, name: "Rotterdam" },
      waypoints: [
        [114.2, 22.3], [105.0, 10.0], [101.3, 2.8],
        [80.0, 5.0], [50.0, 12.0], [43.0, 12.5], 
        [39.0, 21.0], [32.3, 30.6], [15.0, 35.0],
        [-5.35, 36.14], [-10.0, 42.0], [4.14, 51.9]
      ],
      checkpoints: [
        { type: 'NORMAL', label: 'T-5D (Past)', coord: [80.0, 5.0] },
        { type: 'PREDICTION', label: 'T+12H (Predict)', coord: [43.0, 12.5] },
        { type: 'CRITICAL', label: 'T+48H (High Risk)', coord: [39.0, 21.0], reason: 'Geopolitics' }
      ],
      progressOffset: 0.4,
      riskZone: [0.55, 0.65],
      uiSteps: [
        { label: "Hong Kong", status: "CLEARED", type: "safe" },
        { label: "Indian Ocean", status: "CURRENT", type: "accent" },
        { label: "Red Sea Transit", status: "CHOKEPOINT", type: "critical" }
      ]
    },
    {
      id: "ship_2",
      vessel: { name: "OOCL HONG KONG", type: "Container Ship", eta: "T+14D", speed: "21.0 kn", status: "Underway", riskLevel: "NORMAL" },
      start: { lat: 31.2, lng: 121.5, name: "Shanghai", offset: [-15, 10] },
      end: { lat: 34.0, lng: -118.2, name: "Los Angeles", offset: [15, 10] },
      waypoints: [
        [121.5, 31.2], [140.0, 35.0], [160.0, 40.0],
        [180.0, 45.0], [-160.0, 45.0], [-140.0, 40.0],
        [-118.2, 34.0]
      ],
      checkpoints: [
        { type: 'NORMAL', label: 'T-2D (Past)', coord: [140.0, 35.0] },
        { type: 'PREDICTION', label: 'T+5D (Predict)', coord: [-160.0, 45.0] },
        { type: 'PREDICTION', label: 'T+10D (Predict)', coord: [-140.0, 40.0] }
      ],
      progressOffset: 0.25,
      riskZone: [0, 0],
      uiSteps: [
        { label: "Shanghai", status: "CLEARED", type: "safe" },
        { label: "Pacific Basin", status: "CURRENT", type: "accent" },
        { label: "LA Harbor", status: "DESTINATION", type: "warning" }
      ]
    },
    {
      id: "ship_3",
      vessel: { name: "FRONT ALTAIR", type: "Oil Tanker", eta: "T+8D", speed: "14.2 kn", status: "Underway", riskLevel: "CRITICAL" },
      start: { lat: 26.6, lng: 50.1, name: "Ras Tanura", offset: [0, 15] },
      end: { lat: 29.7, lng: -95.2, name: "Houston", offset: [-15, 15] },
      waypoints: [
        [50.1, 26.6], [56.2, 26.5], [60.0, 15.0],
        [40.0, -10.0], [18.4, -34.3], [0.0, -20.0],
        [-40.0, 0.0], [-70.0, 15.0], [-85.0, 25.0],
        [-95.2, 29.7]
      ],
      checkpoints: [
        { type: 'CRITICAL', label: 'T-1D (Chokepoint)', coord: [56.2, 26.5] },
        { type: 'NORMAL', label: 'T+6D (Predict)', coord: [18.4, -34.3] },
        { type: 'CRITICAL', label: 'T+15D (Piracy Risk)', coord: [-70.0, 15.0], reason: 'Piracy' }
      ],
      progressOffset: 0.15,
      riskZone: [0.7, 0.8],
      uiSteps: [
        { label: "Hormuz Strait", status: "CLEARED", type: "safe" },
        { label: "Arabian Sea", status: "CURRENT", type: "accent" },
        { label: "Caribbean Pirate Zone", status: "HIGH RISK", type: "critical" }
      ] 
    },
    {
      id: "ship_4",
      vessel: { name: "MSC OSCAR", type: "Container Ship", eta: "T+3D", speed: "19.5 kn", status: "Underway", riskLevel: "HIGH" },
      start: { lat: 53.5, lng: 9.9, name: "Hamburg", offset: [15, 0] },
      end: { lat: 40.6, lng: -74.0, name: "New York", offset: [15, -15] },
      waypoints: [
        [9.9, 53.5], [0.0, 50.0], [-10.0, 50.0],
        [-30.0, 45.0], [-50.0, 42.0], [-70.0, 40.0],
        [-74.0, 40.6]
      ],
      checkpoints: [
        { type: 'NORMAL', label: 'T-1D (Past)', coord: [0.0, 50.0] },
        { type: 'CRITICAL', label: 'T+1D (Storm Zone)', coord: [-30.0, 45.0] },
        { type: 'PREDICTION', label: 'T+2D (Predict)', coord: [-50.0, 42.0] }
      ],
      progressOffset: 0.3,
      riskZone: [0.35, 0.55],
      uiSteps: [
        { label: "North Sea", status: "CLEARED", type: "safe" },
        { label: "Atlantic Storm Vector", status: "CURRENT EVENT", type: "critical" },
        { label: "New York Port", status: "DESTINATION", type: "warning" }
      ]
    },
    {
      id: "ship_5",
      vessel: { name: "CMA CGM ANTOINE", type: "Container Ship", eta: "T+20D", speed: "20.1 kn", status: "Underway", riskLevel: "NORMAL" },
      start: { lat: -33.8, lng: 151.2, name: "Sydney", offset: [-10, -10] },
      end: { lat: 35.6, lng: 139.7, name: "Tokyo", offset: [-10, 10] },
      waypoints: [
        [151.2, -33.8], [153.0, -20.0], [145.0, 0.0],
        [140.0, 20.0], [139.7, 35.6]
      ],
      checkpoints: [
        { type: 'NORMAL', label: 'T-3D (Past)', coord: [153.0, -20.0] },
        { type: 'PREDICTION', label: 'T+4D (Predict)', coord: [145.0, 0.0] }
      ],
      progressOffset: 0.5,
      riskZone: [0, 0],
      uiSteps: [
        { label: "Coral Sea", status: "CLEARED", type: "safe" },
        { label: "Philippine Sea", status: "CURRENT", type: "accent" },
        { label: "Tokyo Bay", status: "DESTINATION", type: "safe" }
      ]
    }
  ],
  chokepoints: [
    { name: "Suez Canal", coord: [32.3, 30.6], primary: true },
    { name: "Panama Canal", coord: [-79.7, 9.1], primary: true },
    { name: "Strait of Malacca", coord: [101.3, 2.8], primary: true },
    { name: "Strait of Hormuz", coord: [56.2, 26.5], primary: true },
    { name: "Gibraltar Strait", coord: [-5.35, 36.14], primary: false },
    { name: "Bab el-Mandeb", coord: [43.3, 12.6], primary: true }
  ],
  globalLanes: [
    [ [-74, 40], [-10, 45], [0, 50] ], // NY to Europe
    [ [-122, 37], [130, 35], [121, 25] ], // SF to Asia
    [ [18, -34], [57, -20], [115, -32] ] // Cape to Australia
  ]
};

// --- CUSTOM ICONS ---
const ShipIcon = L.divIcon({
  html: `<div class="relative w-8 h-8 flex items-center justify-center transform transition-transform duration-1000 -rotate-45">
    <div class="absolute inset-0 rounded-full bg-accent/20 animate-ping"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-accent drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
        <path d="M12 2L4 8V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V8L12 2Z" fill="currentColor"/>
    </svg>
  </div>`,
  className: 'ship-anim-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const ChokepointIcon = (isPrimary) => L.divIcon({
  html: `<div class="relative w-6 h-6 flex items-center justify-center">
    <div class="absolute w-full h-full rounded-full border-2 ${isPrimary ? 'border-critical' : 'border-warning'} opacity-50 animate-pulse"></div>
    <div class="w-3 h-3 rounded-full ${isPrimary ? 'bg-critical' : 'bg-warning'} shadow-[0_0_10px_currentColor]"></div>
  </div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const LiveMap = () => {
  const { selectedVesselId: selectedFleetId, setSelectedVesselId: setSelectedFleetId } = useStore();
  const navigate = useNavigate();
  const [activeSegment, setActiveSegment] = useState(0);

  // Generate curved paths for ALL fleets
  const processedFleets = useMemo(() => {
    return SIMULATION.fleets.map(fleet => {
      try {
        // Fix coordinates that cross the antimeridian (simple fix for Longitude > 180 or < -180 crossing if any)
        const line = turf.lineString(fleet.waypoints);
        const curved = turf.bezierSpline(line, { resolution: 10000 });
        const coords = curved.geometry.coordinates;

        const currentIdx = Math.floor(coords.length * fleet.progressOffset);
        const riskStart = Math.floor(coords.length * fleet.riskZone[0]);
        const riskEnd = Math.floor(coords.length * fleet.riskZone[1]);

        const past = coords.slice(0, currentIdx + 1).map(c => [c[1], c[0]]);
        
        let futureNormal1 = [];
        let dangerZone = [];
        let futureNormal2 = [];

        if (riskEnd > riskStart) {
           if (currentIdx < riskStart) {
              futureNormal1 = coords.slice(currentIdx, riskStart + 1).map(c => [c[1], c[0]]);
              dangerZone = coords.slice(riskStart, riskEnd + 1).map(c => [c[1], c[0]]);
              futureNormal2 = coords.slice(riskEnd).map(c => [c[1], c[0]]);
           } else if (currentIdx >= riskStart && currentIdx <= riskEnd) {
              dangerZone = coords.slice(currentIdx, riskEnd + 1).map(c => [c[1], c[0]]);
              futureNormal2 = coords.slice(riskEnd).map(c => [c[1], c[0]]);
           } else {
              futureNormal2 = coords.slice(currentIdx).map(c => [c[1], c[0]]);
           }
        } else {
           futureNormal1 = coords.slice(currentIdx).map(c => [c[1], c[0]]);
        }

        return { 
           ...fleet, 
           routePoly: { past, futureNormal1, dangerZone, futureNormal2 },
           movingPos: past[past.length - 1]
        };
      } catch(e) {
        console.error("Path generation failed for", fleet.id, e);
        return null;
      }
    }).filter(f => f !== null);
  }, []);

  // Animation Loop wrapper
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSegment((prev) => (prev + 1) % 100); 
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Active Selected Fleet
  const selectedFleet = useMemo(() => processedFleets.find(f => f.id === selectedFleetId), [selectedFleetId, processedFleets]);

  return (
    <div className="absolute inset-0 bg-[#020610]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        zoomControl={false}
        preferCanvas={true}
        attributionControl={false}
        worldCopyJump={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.8}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          opacity={0.3}
        />

        {/* Global background shipping lanes */}
        {SIMULATION.globalLanes.map((lane, idx) => (
           <Polyline 
             key={idx} 
             positions={lane.map(c => [c[1], c[0]])} 
             pathOptions={{ color: '#ffffff', weight: 1, opacity: 0.1, dashArray: '5,10' }} 
           />
        ))}

        {/* Render each fleet */}
        {processedFleets.filter(fleet => !selectedFleetId || selectedFleetId === fleet.id).map(fleet => {
          const isSelected = selectedFleetId === fleet.id;
          const { routePoly, movingPos } = fleet;
          
          return (
            <React.Fragment key={fleet.id}>
              {/* GREEN LINE -> Completed past */}
              <Polyline
                positions={routePoly.past}
                pathOptions={{ color: '#22c55e', weight: isSelected ? 4 : 2, opacity: isSelected ? 0.9 : 0.4 }}
              >
                {isSelected && <Tooltip sticky className="bg-black text-safe text-xs font-mono">Completed Path</Tooltip>}
              </Polyline>

              {/* YELLOW LINE -> Normal predicted future */}
              <Polyline
                positions={routePoly.futureNormal1}
                pathOptions={{ color: '#f1c40f', weight: isSelected ? 3 : 2, opacity: isSelected ? 0.7 : 0.3, dashArray: '8,8' }}
              />
              <Polyline
                positions={routePoly.futureNormal2}
                pathOptions={{ color: '#f1c40f', weight: isSelected ? 3 : 2, opacity: isSelected ? 0.7 : 0.3, dashArray: '8,8' }}
              />

              {/* RED LINE -> Risk / Danger Prediction Zone */}
              {routePoly.dangerZone.length > 0 && (
                <Polyline
                  positions={routePoly.dangerZone}
                  pathOptions={{ color: '#ef4444', weight: isSelected ? 5 : 3, opacity: isSelected ? 1 : 0.5, className: isSelected ? 'animate-pulse' : '' }}
                >
                  {isSelected && (
                    <Tooltip sticky>
                      <div className="bg-[#0a1628] text-critical p-2 text-xs font-mono border border-critical">
                          High Risk Zone Predicted
                      </div>
                    </Tooltip>
                  )}
                </Polyline>
              )}

              {/* START & END PORTS */}
              {isSelected && (
                <>
                  <Marker position={[fleet.start.lat, fleet.start.lng]}>
                     <Tooltip direction="bottom" offset={L.point(fleet.start.offset || [0,0])} permanent className="bg-transparent border-none text-white text-xs font-bold drop-shadow-md">
                        START: {fleet.start.name}
                     </Tooltip>
                  </Marker>
                  <Marker position={[fleet.end.lat, fleet.end.lng]}>
                     <Tooltip direction="bottom" offset={L.point(fleet.end.offset || [0,0])} permanent className="bg-transparent border-none text-white text-xs font-bold drop-shadow-md">
                        DEST: {fleet.end.name}
                     </Tooltip>
                  </Marker>
                  
                  {/* CHECKPOINTS */}
                  {fleet.checkpoints.map((chk, idx) => (
                     <Marker 
                       key={idx} 
                       position={[chk.coord[1], chk.coord[0]]}
                       icon={L.divIcon({
                          html: `<div class="bg-${chk.type === 'CRITICAL' ? 'critical' : chk.type === 'PREDICTION' ? 'warning' : 'safe'} w-3 h-3 rounded-sm rotate-45 shadow-lg"></div>`,
                          className: '',
                          iconSize: [12, 12], iconAnchor: [6, 6]
                       })}
                     >
                        <Tooltip direction="right" permanent className="bg-transparent border-none shadow-none font-mono text-[10px]">
                           <div className={`px-2 py-1 rounded bg-black/60 border border-white/10 ${
                              chk.type === 'CRITICAL' ? 'text-critical' : chk.type === 'PREDICTION' ? 'text-warning' : 'text-safe'
                           }`}>
                              {chk.label}
                           </div>
                        </Tooltip>
                     </Marker>
                  ))}
                </>
              )}

              {/* CURRENT SHIP POSITION */}
              {movingPos && (
                <Marker 
                  position={movingPos} 
                  icon={ShipIcon}
                  eventHandlers={{ click: () => setSelectedFleetId(fleet.id) }}
                >
                   {/* Show simple tooltip if not selected */}
                   {!isSelected && (
                      <Tooltip direction="top" className="bg-[#0a1628] text-white border-accent/30 text-xs font-mono">
                         {fleet.vessel.name}
                      </Tooltip>
                   )}
                </Marker>
              )}
            </React.Fragment>
          );
        })}

        {/* CHOKEPOINTS (Always Visible) */}
        {SIMULATION.chokepoints.map((cp, idx) => (
           <Marker key={`choke_${idx}`} position={[cp.coord[1], cp.coord[0]]} icon={ChokepointIcon(cp.primary)}>
              <Tooltip direction="top" className="bg-[#0a1628] text-white border border-white/20 text-xs font-mono opacity-50 hover:opacity-100">
                 {cp.name}
              </Tooltip>
           </Marker>
        ))}

      </MapContainer>

      {/* --- UI OVERLAY PANELS --- */}
      <AnimatePresence>
        {selectedFleet && (
          <motion.div 
            key={selectedFleet.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute top-6 right-6 w-80 glass border border-accent/20 rounded-2xl shadow-2xl p-5 z-[1000] backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-xl font-display font-bold text-white tracking-widest">{selectedFleet.vessel.name}</h2>
                 <p className="text-xs font-mono text-accent">{selectedFleet.vessel.type}</p>
               </div>
               <button onClick={() => setSelectedFleetId(null)} className="text-white/40 hover:text-white">&times;</button>
            </div>

            <div className="space-y-4">
               {/* ETA & STATUS */}
               <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                 <div className="flex items-center gap-2">
                   <Clock className="text-accent w-4 h-4" />
                   <span className="text-xs text-white/60 font-mono">ETA</span>
                 </div>
                 <span className="text-sm font-bold text-white">{selectedFleet.vessel.eta}</span>
               </div>

               {/* SPEED & RISK */}
               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                    <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Speed</p>
                    <p className="text-lg font-mono text-white">{selectedFleet.vessel.speed}</p>
                 </div>
                 <div className={`p-3 rounded-lg border text-center relative overflow-hidden ${selectedFleet.vessel.riskLevel === 'CRITICAL' ? 'bg-critical/10 border-critical/30' : selectedFleet.vessel.riskLevel === 'HIGH' ? 'bg-warning/10 border-warning/30' : 'bg-safe/10 border-safe/30'}`}>
                    {selectedFleet.vessel.riskLevel !== 'NORMAL' && <div className={`absolute inset-0 animate-pulse ${selectedFleet.vessel.riskLevel === 'CRITICAL' ? 'bg-critical/5' : 'bg-warning/5'}`}></div>}
                    <p className={`text-[10px] uppercase tracking-widest mb-1 ${selectedFleet.vessel.riskLevel === 'CRITICAL' ? 'text-critical/80' : selectedFleet.vessel.riskLevel === 'HIGH' ? 'text-warning/80' : 'text-safe/80'}`}>Risk Level</p>
                    <p className={`text-lg font-mono font-bold relative z-10 ${selectedFleet.vessel.riskLevel === 'CRITICAL' ? 'text-critical' : selectedFleet.vessel.riskLevel === 'HIGH' ? 'text-warning' : 'text-safe'}`}>{selectedFleet.vessel.riskLevel}</p>
                 </div>
               </div>

               {/* PROGRESS ROUTE */}
               <div className="pt-4 border-t border-white/10 space-y-3">
                  <h3 className="text-xs text-white/50 uppercase tracking-widest">Route Prediction</h3>
                  <div className="relative pl-4 border-l border-white/10 space-y-4">
                     {selectedFleet.uiSteps.map((step, idx) => (
                       <div key={idx} className="relative">
                         <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-${step.type} border-2 border-[#0a1628] ${step.status === 'CURRENT' || step.status === 'CURRENT EVENT' ? 'animate-pulse' : ''}`}></span>
                         <p className="text-xs text-white">{step.label} <span className={`text-[10px] text-${step.type} font-mono ml-2`}>{step.status}</span></p>
                       </div>
                     ))}
                  </div>
               </div>

               <button onClick={() => navigate(`/vessel/${selectedFleet.id}`)} className="w-full mt-4 bg-accent/10 border border-accent/20 hover:bg-accent hover:text-black transition-colors text-white text-xs py-3 rounded-lg font-bold tracking-widest uppercase flex justify-center items-center gap-2">
                 <Route className="w-4 h-4" /> Full Manifest / Digital Twin
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveMap;
