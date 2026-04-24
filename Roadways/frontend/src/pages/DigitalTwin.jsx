import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Html, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, Shield, Zap, Wind } from 'lucide-react';
import useStore from '../store/useStore';

function TruckModel({ color, risk }) {
  const mesh = useRef();
  
  // Simulation: small vibrations based on "road quality"
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime || state.clock.getElapsedTime();
    mesh.current.position.y = Math.sin(t * 10) * 0.05;
    mesh.current.rotation.x = Math.sin(t * 15) * 0.02 * (risk === 'HIGH' ? 2 : 1);
  });

  return (
    <group ref={mesh} scale={[1, 1, 1]}>
      {/* Cab */}
      <mesh position={[-1.5, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Windows */}
      <mesh position={[-1.8, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.6, 1.42]} />
        <meshStandardMaterial color="#111" metalness={1} roughness={0} transparent opacity={0.6} />
      </mesh>
      {/* Trailer */}
      <mesh position={[1, 0.8, 0]}>
        <boxGeometry args={[4.5, 1.8, 1.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Wheels */}
      {[[-1.8,-0.1, 0.6], [-1.8,-0.1, -0.6], [0,-0.1, 0.6], [0,-0.1, -0.6], [2.5,-0.1, 0.6], [2.5,-0.1, -0.6]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

export default function DigitalTwin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useStore();
  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) return null;

  return (
    <div className="h-screen w-screen bg-bg-primary flex flex-col overflow-hidden font-body">
      {/* Header */}
      <div className="h-16 border-b border-border bg-bg-secondary flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/vehicle/${id}`)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-accent font-display uppercase">DIGITAL TWIN SIMULATION</h2>
            <span className="text-[10px] text-text-muted font-mono">{vehicle.registration_number} • T+40H PROJECTION</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end px-4 border-r border-border">
                <span className="text-[9px] font-mono text-text-muted">SIMULATION CONFIDENCE</span>
                <span className="text-xs font-bold font-mono text-safe">98.4%</span>
            </div>
            <button className="bg-bg-tertiary border border-border p-2 rounded hover:border-accent">
                <Cpu size={16} className="text-accent" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left Side: Twin Telemetry */}
        <div className="w-80 bg-bg-secondary border-r border-border p-6 flex flex-col gap-6 z-10"
          style={{ background: 'rgba(11,19,36,0.9)', backdropFilter: 'blur(10px)' }}>
            <section className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold font-mono text-text-muted uppercase">
                    <span>Twin Status</span>
                    <span className="text-safe animate-pulse">● Synchronized</span>
                </div>
                
                <div className="space-y-2">
                    <label className="text-[9px] font-mono text-text-muted uppercase">Engine Thermal Stress</label>
                    <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-accent/10">
                        <div className="h-full bg-warning w-3/4 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-mono text-text-muted uppercase">Tire Wear Forecast</label>
                    <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-accent/10">
                        <div className="h-full bg-safe w-1/4 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    </div>
                </div>
            </section>

            <section className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                <h3 className="text-[10px] font-mono font-bold text-accent border-b border-border pb-2 uppercase tracking-widest">Predicted Events</h3>
                {[
                    { t: '+14h', event: 'Heavy Rain Entrance', loc: 'Maharashtra', icon: Wind, color: 'text-info' },
                    { t: '+22h', event: 'Fog Condition Phase', loc: 'MP Border', icon: Shield, color: 'text-warning' },
                    { t: '+34h', event: 'Rest Compliance Window', loc: 'NH-3 Zone', icon: Zap, color: 'text-safe' }
                ].map((ev, i) => (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-3 rounded border border-accent/10 flex items-center gap-3"
                        style={{ background: 'rgba(5,7,15,0.4)' }}
                    >
                        <ev.icon size={16} className={ev.color} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold">{ev.event}</span>
                            <span className="text-[8px] font-mono text-text-muted">{ev.t} at {ev.loc}</span>
                        </div>
                    </motion.div>
                ))}
            </section>

            <button className="w-full bg-accent text-black font-bold py-3 rounded text-[10px] font-mono uppercase">
                RE-INITIALIZE SIMULATION
            </button>
        </div>

        {/* Center: 3D Visualization */}
        <div className="flex-1 bg-[#0a0d11] relative flex items-center justify-center">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas 
                    key={id} // Force remount on ID change
                    onCreated={({ gl }) => {
                        gl.setClearColor('#0a0d11');
                    }}
                >
                    <PerspectiveCamera makeDefault position={[5, 3, 8]} />
                    <OrbitControls enablePan={false} maxDistance={20} minDistance={5} />
                    
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    
                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <TruckModel color={vehicle.color} risk="LOW" />
                        <Html
                            position={[0, 2.8, 0]}
                            center
                            distanceFactor={8}
                        >
                            <div style={{
                                color: vehicle.color,
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '12px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                textShadow: `0 0 10px ${vehicle.color}`,
                                background: 'rgba(5,7,15,0.8)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: `1px solid ${vehicle.color}`
                            }}>
                                {vehicle.registration_number.toUpperCase()}
                            </div>
                        </Html>
                    </Float>

                    <gridHelper args={[20, 20, 0x1c2128, 0x1c2128]} position={[0, -0.5, 0]} />
                </Canvas>
            </div>

            {/* Error Fallback / HUD Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 px-10 py-4 glass-panel flex gap-12 items-center pointer-events-none z-10">
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-text-muted uppercase">Ext. Temp</span>
                    <span className="text-sm font-bold font-mono">32.4°C</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-text-muted uppercase">Humidity</span>
                    <span className="text-sm font-bold font-mono">65%</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-text-muted uppercase">Road Friction</span>
                    <span className="text-sm font-bold font-mono text-safe">OPTIMAL (0.85)</span>
                </div>
            </div>
            
            <div className="absolute bottom-8 right-8 pointer-events-none opacity-20">
                <div className="font-hud text-6xl font-bold text-accent select-none">TWIN_CORE_01</div>
            </div>
        </div>
      </div>
    </div>
  );
}
