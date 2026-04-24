import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder } from '@react-three/drei';
import { ArrowLeft, RefreshCw, Layers } from 'lucide-react';

function TrainModel() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    // Slight rocking animation for realism
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.05 + 0.5;
  });

  return (
    <group ref={meshRef}>
      {/* Locomotive Body */}
      <Box args={[1, 1.2, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#00d4ff" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Headlight */}
      <Box args={[0.6, 0.4, 0.1]} position={[0, -0.2, 1.55]}>
        <meshBasicMaterial color="#ffffaa" />
      </Box>
      <pointLight position={[0, -0.2, 2]} intensity={2} color="#ffffff" distance={10} />
      {/* Wheels */}
      {[-1, 0, 1].map((z, i) => (
        <group key={z}>
          <Cylinder args={[0.2, 0.2, 0.1, 16]} position={[-0.55, -0.6, z]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#333" metalness={0.9} />
          </Cylinder>
          <Cylinder args={[0.2, 0.2, 0.1, 16]} position={[0.55, -0.6, z]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#333" metalness={0.9} />
          </Cylinder>
        </group>
      ))}
      {/* Pantograph simplified */}
      <Box args={[0.8, 0.05, 0.4]} position={[0, 0.65, -0.5]}>
         <meshStandardMaterial color="#888" />
      </Box>
      <Box args={[0.05, 0.4, 0.05]} position={[-0.3, 0.8, -0.5]} rotation={[0, 0, -Math.PI / 6]}>
         <meshStandardMaterial color="#888" />
      </Box>
      <Box args={[0.05, 0.4, 0.05]} position={[0.3, 0.8, -0.5]} rotation={[0, 0, Math.PI / 6]}>
         <meshStandardMaterial color="#888" />
      </Box>
    </group>
  );
}

function Track() {
  return (
    <group position={[0, -0.8, 0]}>
      {/* Ballast */}
      <Box args={[3, 0.2, 20]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#444" roughness={0.9} />
      </Box>
      {/* Rails */}
      <Box args={[0.1, 0.1, 20]} position={[-0.5, 0.15, 0]}>
        <meshStandardMaterial color="#8b8680" metalness={0.8} />
      </Box>
      <Box args={[0.1, 0.1, 20]} position={[0.5, 0.15, 0]}>
        <meshStandardMaterial color="#8b8680" metalness={0.8} />
      </Box>
      {/* Sleepers */}
      {Array.from({length: 20}).map((_, i) => (
        <Box key={i} args={[1.6, 0.1, 0.2]} position={[0, 0.1, -9.5 + i]}>
          <meshStandardMaterial color="#666" />
        </Box>
      ))}
    </group>
  );
}

export default function DigitalTwin() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-bg-secondary border-b border-rail-border shrink-0 z-10 glass-panel">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-tertiary rounded text-rail-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold tracking-widest text-white">40-HOUR DIGITAL TWIN SIMULATION</h1>
            <p className="font-mono text-xs text-text-muted">MULTI-SOURCE PREDICTION ENGINE RUNNING...</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 font-mono text-xs">
             <div className="w-2 h-2 bg-signal-green rounded-full animate-pulse"></div>
             <span>SYNCED 2 SEC AGO</span>
           </div>
           <button className="flex items-center gap-2 bg-bg-tertiary border border-rail-border px-3 py-1.5 rounded font-mono text-xs hover:border-rail-accent transition-colors">
             <RefreshCw className="w-3 h-3" /> REFRESH TWIN
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT 3D VISUALIZATION */}
        <div className="w-1/2 relative border-r border-rail-border">
          <Canvas camera={{ position: [-3, 2, 5], fov: 50 }}>
            <color attach="background" args={['#080c0a']} />
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <TrainModel />
            <Track />
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
            
            {/* Fog simulation for IGP winter */}
            <fog attach="fog" args={['#080c0a', 5, 15]} />
          </Canvas>
          
          <div className="absolute top-4 left-4 glass-panel p-3 rounded pointer-events-none">
             <h3 className="font-mono font-bold text-sm text-rail-accent mb-1">TELEMETRY HUD</h3>
             <p className="font-mono text-xs text-text-secondary">SPEED: <span className="text-white">112 KM/H</span></p>
             <p className="font-mono text-xs text-text-secondary">PANTOGRAPH: <span className="text-signal-green">OK</span></p>
             <p className="font-mono text-xs text-text-secondary">GPS SIG: <span className="text-white">9/12 SATS</span></p>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
             <p className="font-mono text-xs text-text-muted tracking-widest bg-bg-primary/80 inline-block px-4 py-1 rounded-full border border-rail-border">DRAG TO ROTATE CAMERA</p>
          </div>
        </div>

        {/* RIGHT PREDICTION STRIP & EVENTS */}
        <div className="w-1/2 bg-bg-secondary flex flex-col">
          {/* Prediction Strip */}
          <div className="p-4 border-b border-rail-border shrink-0">
            <h3 className="font-mono text-sm font-bold text-white mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-rail-accent"/> TIMELINE (40 HRS)</h3>
            <div className="h-10 relative bg-bg-tertiary rounded border border-rail-border">
              {/* Timeline blocks representing risk */}
              <div className="absolute top-0 bottom-0 left-0 w-[30%] bg-status-onTime/20 border-r border-rail-border/50"></div>
              <div className="absolute top-0 bottom-0 left-[30%] w-[10%] bg-status-delayedMinor/30 border-r border-rail-border/50"></div>
              <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-status-delayedMajor/40 relative group cursor-pointer border-r border-rail-border/50">
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-bg-primary border border-status-delayedMajor px-2 py-0.5 rounded text-[10px] font-mono text-status-delayedMajor whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">FOG ZONE</div>
              </div>
              <div className="absolute top-0 bottom-0 left-[60%] w-[40%] bg-status-onTime/20"></div>
              
              {/* Current Time marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-rail-accent left-[10%] shadow-[0_0_8px_var(--rail-accent)]"></div>
            </div>
            <div className="flex justify-between mt-2 font-mono text-[10px] text-text-muted">
              <span>NOW</span>
              <span>+10H</span>
              <span>+20H</span>
              <span>+30H</span>
              <span>+40H</span>
            </div>
          </div>
          
          <div className="p-4 flex justify-between items-center bg-bg-tertiary shrink-0 border-b border-rail-border">
            <h3 className="font-mono text-sm font-bold text-white">AI PREDICTED EVENTS</h3>
            <button onClick={() => navigate('/events')} className="text-xs font-mono text-rail-accent hover:underline">VIEW FULL CHRONOLOGY</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-custom">
             <EventCard 
                time="+4H 15M" 
                location="Kanpur Central Approaching" 
                title="PLATFORM CAPACITY SURGE" 
                desc="Kumbh Mela special trains have exhausted platform 4 & 5. Expect 15 min outer signal halt." 
                risk="CAUTION" 
             />
             <EventCard 
                time="+8H 30M" 
                location="Prayagraj - DDU Section" 
                title="DENSE FOG HALT" 
                desc="NOAA GFS predicts visibility drop to 180m. FSD protocol activation mandatory. Speed restricted to 60km/h." 
                risk="MAJOR DELAY" 
             />
             <EventCard 
                time="+12H 00M" 
                location="DDU Interlocking" 
                title="MAINTENANCE BLOCK CLASH" 
                desc="Pre-planned OHE power block starting 04:00 IST. If train delay exceeds 30m before this point, diversion via route B required." 
                risk="EMERGENCY" 
             />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ time, location, title, desc, risk }) {
  const getBorderColor = () => {
    if (risk === "CAUTION") return "border-status-delayedMinor";
    if (risk === "MAJOR DELAY") return "border-status-delayedMajor";
    if (risk === "EMERGENCY") return "border-status-criticalDelay";
    return "border-rail-border";
  };

  const getTextColor = () => {
    if (risk === "CAUTION") return "text-status-delayedMinor";
    if (risk === "MAJOR DELAY") return "text-status-delayedMajor";
    if (risk === "EMERGENCY") return "text-status-criticalDelay";
    return "text-text-muted";
  };

  return (
    <div className={`bg-bg-tertiary border ${getBorderColor()} p-3 rounded hover:bg-bg-hover transition-colors`}>
      <div className="flex justify-between items-start mb-2">
         <div>
           <span className="bg-bg-secondary px-2 py-0.5 rounded font-mono text-[10px] text-white border border-rail-border">{time}</span>
           <span className="font-mono text-xs text-text-muted ml-2">{location}</span>
         </div>
         <span className={`font-mono font-bold text-[10px] ${getTextColor()}`}>{risk}</span>
      </div>
      <h4 className="font-mono text-sm font-bold text-white mb-1">{title}</h4>
      <p className="font-mono text-xs text-text-secondary leading-relaxed">{desc}</p>
    </div>
  )
}
