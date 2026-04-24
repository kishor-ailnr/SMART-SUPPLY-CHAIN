import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Html } from '@react-three/drei';
import { ArrowLeft, Clock, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Procedural 3D Aircraft Model (Glassmorphic / Holographic style)
function DigitalTwinModel({ turbulence }) {
  const group = useRef();
  
  useFrame((state) => {
    // Basic flight animation
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t) * 0.1;
      
      // Turbulence effect
      if (turbulence > 0) {
        group.current.rotation.x = Math.sin(t * 10) * (0.05 * turbulence);
        group.current.rotation.z = Math.cos(t * 12) * (0.05 * turbulence);
      } else {
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 6, 32]} />
        <meshPhysicalMaterial 
          color="#00b4d8" 
          transmission={0.9} 
          opacity={1} 
          metalness={0.5} 
          roughness={0.1}
          ior={1.5}
          thickness={0.5} 
          transparent={true} 
        />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[0.4, 1.2, 32]} />
        <meshPhysicalMaterial color="#00b4d8" transmission={0.9} transparent />
      </mesh>
      {/* Tail */}
      <mesh position={[0, -3.2, 0]}>
        <coneGeometry args={[0.4, 0.8, 32]} />
        <meshPhysicalMaterial color="#00b4d8" transmission={0.9} transparent />
      </mesh>
      
      {/* Wings */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[4.5, 0.1, 1.5]} />
        <meshPhysicalMaterial color="#90e0ef" transmission={0.7} metalness={0.8} roughness={0.2} transparent />
      </mesh>
      
      {/* Engines */}
      <mesh position={[1.2, 0.3, 0.2]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.2, 0.3, 0.2]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Engine Exhaust (Glow) */}
      <mesh position={[1.2, -0.2, 0.2]}>
        <cylinderGeometry args={[0.2, 0.1, 0.5, 16]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>
      <mesh position={[-1.2, -0.2, 0.2]}>
        <cylinderGeometry args={[0.2, 0.1, 0.5, 16]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      {/* Tail fin */}
      <mesh position={[0, -2.5, 0.5]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[0.1, 1.5, 1.2]} />
        <meshPhysicalMaterial color="#90e0ef" transmission={0.7} transparent />
      </mesh>
    </group>
  );
}

export default function DigitalTwin() {
  const { currentFlightId, setScreen } = useStore();
  const [flightData, setFlightData] = useState(null);

  useEffect(() => {
    if (!currentFlightId) return;
    fetch(`http://localhost:6002/api/flights/${currentFlightId}`)
      .then(res => res.json())
      .then(data => setFlightData(data))
      .catch(console.error);
      
    const interval = setInterval(() => {
      fetch(`http://localhost:6002/api/flights/${currentFlightId}`)
        .then(res => res.json())
        .then(data => setFlightData(data));
    }, 5000);
    return () => clearInterval(interval);
  }, [currentFlightId]);

  if (!flightData) return <div className="h-screen w-screen bg-bg-primary flex items-center justify-center text-accent animate-pulse font-mono tracking-wider">INITIALIZING DIGITAL TWIN...</div>;

  const getRiskColorClass = (risk) => {
    switch (risk) {
      case 'CAUTION': return 'text-caution border-caution';
      case 'HIGH': return 'text-warning border-warning';
      case 'CRITICAL': return 'text-emergency border-emergency animate-pulse';
      case 'EMERGENCY': return 'text-emergency border-emergency animate-pulse';
      default: return 'text-safe border-safe';
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden font-body">
      {/* HeaderRow */}
      <header className="h-16 flex-none border-b border-border-color bg-bg-secondary flex items-center justify-between px-6 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('FLIGHT', flightData.id)} className="text-text-secondary hover:text-accent p-2 rounded-full hover:bg-bg-tertiary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl text-text-primary tracking-widest leading-none">
              DIGITAL TWIN <span className="text-accent">— NEXT 40 HOURS</span>
            </span>
            <span className="text-xs font-mono text-text-secondary uppercase">
              {flightData.callsign} | {flightData.registration} | ETOPS AUTHORIZED
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-mono tracking-widest">
           <div className="flex items-center gap-2 text-accent">
             <Clock className="w-4 h-4" />
             <span>UTC {new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' })}Z</span>
           </div>
           <button className="text-xs flex items-center gap-1 border border-border-color rounded px-3 py-1 hover:bg-bg-tertiary">
             <RefreshCw className="w-3 h-3" /> REFRESH SIMULATION
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 3D Aircraft Visualization */}
        <div className="w-[50%] h-[60%] lg:h-full lg:flex-1 relative border-r border-border-color bg-sky-deep flex flex-col">
          <div className="absolute top-4 left-4 z-10 glass-panel p-3 pointer-events-none">
            <div className="text-[10px] text-text-secondary uppercase mb-1 border-b border-border-color pb-1">Cockpit Instruments Simulator</div>
            <div className="grid grid-cols-2 gap-4 mt-2 font-mono text-xl text-accent">
               <div>
                  <div className="text-[10px] text-text-secondary">IAS (KTS)</div>
                  {Math.round(flightData.speed || flightData.filed_speed_ktas || 450)}
               </div>
               <div>
                  <div className="text-[10px] text-text-secondary">ALT (FT)</div>
                  {flightData.altitude_ft || 35000}
               </div>
            </div>
            {/* Attitude Indicator Mock */}
            <div className="w-full h-8 mt-4 border border-border-color rounded overflow-hidden relative bg-black/50">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-sky-surface opacity-50"></div>
               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white"></div>
               <div className="absolute top-1/2 left-1/2 w-4 h-[2px] bg-cockpit-amber transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          <div className="flex-1 relative">
            <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} color="#00b4d8" />
              <pointLight position={[-10, -10, -5]} intensity={0.5} color="#90e0ef" />
              {/* <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} /> */}
              
              <DigitalTwinModel turbulence={flightData.peak_risk_level === 'HIGH' ? 2 : flightData.peak_risk_level === 'CRITICAL' ? 4 : 0} />
              <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            
            {/* Turbulence Warning Overlay */}
            {['HIGH', 'CRITICAL'].includes(flightData.peak_risk_level) && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 bg-emergency-pulse text-white border border-emergency font-mono font-bold w-64 text-center rounded text-sm uppercase">
                <AlertTriangle className="w-5 h-5 mx-auto mb-1 animate-pulse" />
                TURBULENCE ENCOUNTER PREDICTED
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - 40-hour Timeline and Predictions */}
        <div className="w-[50%] lg:w-[450px] bg-bg-secondary flex flex-col items-stretch overflow-hidden">
          
          <div className="p-4 border-b border-border-color bg-bg-tertiary">
            <h2 className="font-display tracking-widest text-lg text-accent border-b border-border-color pb-1 mb-2 uppercase">Prediction Analysis (T+40H)</h2>
            <div className="flex justify-between items-end font-mono text-[10px] text-text-secondary">
               <div>FLIGHT PHASE: <span className="text-white">CRUISE</span></div>
               <div>FUEL STATE: <span className="text-safe">NOMINAL</span></div>
               <div>FDTL: <span className="text-safe">COMPLIANT</span></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-6">
             {/* 40-hr timeline strip vertically in this panel */}
             
             {/* Event Card 1 - Current */}
             <div className="relative pl-6 border-l border-border-color">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-safe ring-4 ring-bg-secondary"></div>
                <div className="bg-bg-tertiary p-3 rounded border border-safe mb-2">
                   <div className="flex justify-between text-[10px] font-mono text-text-secondary border-b border-border-color pb-1 mb-2">
                      <span>T+ 0H (CURRENT)</span>
                      <span>CRUISE SEGMENT</span>
                   </div>
                   <h3 className="text-safe font-bold font-display uppercase tracking-widest text-sm mb-1">ALL SYSTEMS NOMINAL</h3>
                   <p className="text-xs text-text-primary font-mono mb-2">Fuel burn at predicted 3,120 kg/hr. Cabin differential pressure nominal. ETOPS coverage valid.</p>
                   <div className="text-[10px] bg-safe-dim p-1 px-2 rounded inline-block border border-safe/30 text-safe">
                     CONFIDENCE: 99.8% (AUTO)
                   </div>
                </div>
             </div>

             {/* Event Card 2 - Future Caution */}
             <div className="relative pl-6 border-l border-border-color">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-caution ring-4 ring-bg-secondary"></div>
                <div className="bg-bg-tertiary p-3 rounded border border-caution mb-2">
                   <div className="flex justify-between text-[10px] font-mono text-text-secondary border-b border-border-color pb-1 mb-2">
                      <span>T+ 2H 15M (16:40Z)</span>
                      <span>FIR BOUNDARY / WEATHER</span>
                   </div>
                   <h3 className="text-caution font-bold font-display uppercase tracking-widest text-sm mb-1">MODERATE TURBULENCE AHEAD</h3>
                   <p className="text-xs text-text-primary font-mono mb-2">AI Agent [Weather] detected clear air turbulence (CAT) signature at FL350 near waypoint BOM. Headwind increase +40kts.</p>
                   <p className="text-xs text-caution font-mono font-bold mb-2">&gt; CREW ACTION: SECURE CABIN 15 MINS PRIOR</p>
                   <div className="text-[10px] bg-caution-dim p-1 px-2 rounded inline-block border border-caution/30 text-caution">
                     CONFIDENCE: 84.2% (PIREP MATCH)
                   </div>
                </div>
             </div>
             
             {/* Event Card 3 - Future High Risk */}
             {flightData.peak_risk_level === 'HIGH' && (
                <div className="relative pl-6 border-l border-border-color">
                  <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-warning ring-4 ring-text-muted animate-pulse"></div>
                  <div className="bg-warning-dim p-3 rounded border border-warning mb-2 shadow-[0_0_15px_rgba(255,107,53,0.2)]">
                     <div className="flex justify-between text-[10px] font-mono text-warning/80 border-b border-warning/30 pb-1 mb-2">
                        <span>T+ 4H 30M (18:55Z)</span>
                        <span>DESTINATION APPROACH</span>
                     </div>
                     <h3 className="text-warning font-bold font-display uppercase tracking-widest text-sm mb-1">SIGMET: SEVERE THUNDERSTORMS</h3>
                     <p className="text-xs text-white font-mono mb-2">Terminal aerodrome forecast indicates heavy precipitation array, visibility &lt; 800m. Convective cells identified by INSAT-3D.</p>
                     <p className="text-xs text-warning font-mono font-bold mb-2">&gt; AOC ACTION: PREPARE DIVERSION. FUEL FOR HOLD: 25 MINS ONLY.</p>
                     
                     <button className="mt-2 text-xs font-mono bg-warning text-bg-primary font-bold px-3 py-1 rounded shadow cursor-pointer hover:bg-white w-full transition-colors flex items-center justify-center gap-2">
                       <Zap className="w-4 h-4" /> INITIATE ALTERNATE ROUTE (AI RECALC)
                     </button>
                  </div>
               </div>
             )}

             <div className="relative pl-6">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-border-color ring-4 ring-bg-secondary"></div>
                <div className="text-xs text-text-secondary font-mono pt-1">END OF PREDICTION HORIZON</div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
