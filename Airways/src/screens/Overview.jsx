import React, { useMemo } from 'react';
import { useStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { LogOut, Bell, Navigation, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

// Generate SVG Icon based on type
const createAircraftIcon = (type, heading, risk) => {
  let color = '#2dc653'; // safe
  if (risk === 'CAUTION') color = '#ffd60a';
  if (risk === 'HIGH') color = '#ff6b35';
  if (risk === 'CRITICAL' || risk === 'EMERGENCY') color = '#d00000';

  const svg = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" transform="rotate(${heading})" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createCargoIcon = () => {
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#00b4d8" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18-.21 0-.41-.06-.57-.18l-7.9-4.44A.991.991 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.12.36-.18.57-.18.21 0 .41.06.57.18l7.9 4.44c.32.17.53.5.53.88v9M12 4.15L6.04 7.5L12 10.85l5.96-3.35L12 4.15M5 15.91l6 3.38v-6.71L5 9.21v6.7m14 0v-6.7l-6 3.38v6.71l6-3.38z"/>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
};

export default function Overview() {
  const { user, setUser, flights, setScreen, cargoList } = useStore();

  const handleLogout = () => {
    setUser(null);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'CAUTION': return 'text-caution border-caution';
      case 'HIGH': return 'text-warning border-warning';
      case 'CRITICAL': return 'text-emergency border-emergency animate-pulse';
      default: return 'text-safe border-safe';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 relative flex">
        {/* Left Sidebar - Flight List */}
        <div className="w-80 bg-bg-secondary border-r border-border-color z-10 flex flex-col">
          <div className="p-4 border-b border-border-color">
            <input 
              type="text" 
              placeholder="Search Callsign / Flight..."
              className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 text-xs uppercase font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <AnimatePresence>
              {flights.map((flight) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={flight.id}
                  onClick={() => setScreen('FLIGHT', flight.id)}
                  className={`bg-bg-tertiary border-l-4 p-3 rounded-r cursor-pointer hover:bg-bg-hover transition-colors ${
                    flight.squawk === '7700' ? 'border-emergency animate-pulse bg-emergency-pulse' :
                    flight.risk === 'HIGH' ? 'border-warning' :
                    flight.risk === 'CAUTION' ? 'border-caution' : 'border-safe'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-accent font-mono">{flight.callsign || flight.flight_number}</span>
                    <span className="text-[10px] bg-bg-primary px-1 border border-border-color rounded text-text-secondary">
                      {flight.registration} ({flight.icao_type})
                    </span>
                  </div>
                  <div className="text-xs text-text-primary flex justify-between items-center mt-2">
                    <span>{flight.origin} ✈ {flight.destination}</span>
                    <span className="font-mono text-accent-bright">FL{Math.floor(flight.altitude_ft / 100)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-text-secondary mt-1 tracking-wider uppercase">
                    <span>{Math.round(flight.true_heading)}° / {flight.speed || Math.round(Number(flight.filed_speed_ktas))} KTAS</span>
                    <span className={`${getRiskColor(flight.risk)}`}>{flight.risk}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-sky-deep relative">
          <MapContainer 
            center={[22.0, 79.0]} // Center of India
            zoom={5} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {flights.map(f => (
              <Marker 
                key={f.id}
                position={[f.lat, f.lng]}
                icon={createAircraftIcon(f.icao_type, f.true_heading, f.risk)}
                eventHandlers={{
                  click: () => setScreen('FLIGHT', f.id)
                }}
              >
                <Popup className="glass-panel text-xs border-accent">
                  <div className="font-mono p-1">
                    <div className="font-bold text-accent mb-1 border-b border-border-color pb-1">{f.callsign} | {f.registration}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                      <span className="text-text-secondary">ROUTE:</span> <span>{f.origin}-{f.destination}</span>
                      <span className="text-text-secondary">ALT:</span> <span>{f.altitude_ft} FT</span>
                      <span className="text-text-secondary">HDG:</span> <span>{Math.round(f.true_heading)}°</span>
                      <span className="text-text-secondary">SQWK:</span> <span className={f.squawk === '7700' ? 'text-emergency animate-pulse font-bold' : ''}>{f.squawk}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {cargoList.map(c => {
               // Find current location based on status or first checkpoint
               const loc = c.checkpoints && c.checkpoints.length > 0 ? c.checkpoints[0] : null;
               if (!loc) return null;
               return (
                 <Marker 
                   key={`cargo-${c.id}`}
                   position={[loc.lat, loc.lng]}
                   icon={createCargoIcon()}
                 >
                   <Popup className="glass-panel text-xs border-accent">
                     <div className="font-mono p-1">
                       <div className="font-bold text-accent mb-1 border-b border-border-color pb-1">CARGO {c.id}</div>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-text-primary">
                         <span className="text-text-secondary">FLIGHT:</span> <span>{c.flight_number}</span>
                         <span className="text-text-secondary">TYPE:</span> <span>{c.cargo_type}</span>
                         <span className="text-text-secondary">ROUTE:</span> <span>{c.origin}-{c.destination}</span>
                         <span className="text-text-secondary">STATUS:</span> <span className="text-safe">{c.status}</span>
                       </div>
                     </div>
                   </Popup>
                 </Marker>
               );
            })}
          </MapContainer>

          {/* Emergency Overlay Pulse */}
          {flights.some(f => f.squawk === '7700') && (
            <div className="absolute inset-0 pointer-events-none border-[8px] border-emergency animate-pulse z-[999] opacity-50 flex items-start justify-center pt-10">
               <span className="bg-emergency text-white font-mono font-bold text-xl px-4 py-1 rounded shadow-lg">EMERGENCY DETECTED - SQUAWK 7700</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
