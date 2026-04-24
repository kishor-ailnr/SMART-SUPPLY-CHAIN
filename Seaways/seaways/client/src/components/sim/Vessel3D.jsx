import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

const VesselModel = ({ type, motion = { pitch: 0, roll: 0 } }) => {
  const mesh = useRef();
  const startTime = useRef(Date.now());

  useFrame((state) => {
    if (mesh.current) {
      // Use performance.now() or manual delta to avoid THREE.Clock deprecation
      const time = (Date.now() - startTime.current) * 0.001; 
      // Simulate sea motion
      mesh.current.rotation.x = Math.sin(time * 0.5) * (motion.pitch || 0.04);
      mesh.current.rotation.z = Math.cos(time * 0.4) * (motion.roll || 0.03);
    }
  });

  return (
    <group ref={mesh}>
      {/* Hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 10]} />
        <meshStandardMaterial color="#2a4a75" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Superstructure */}
      <mesh position={[0, 1, -3]} castShadow>
        <boxGeometry args={[3, 1.5, 2]} />
        <meshStandardMaterial color="#e0f0ff" />
      </mesh>

      {/* Containers or Deck Gear */}
      {type === 'Container Ship' && (
        <group position={[0, 1.25, 1]}>
          {[...Array(24)].map((_, i) => (
            <mesh key={i} position={[((i % 3) - 1) * 0.8, Math.floor(i / 12) * 0.6, (Math.floor((i % 12) / 3) - 1.5) * 1.5]} castShadow>
              <boxGeometry args={[0.7, 0.5, 1.4]} />
              <meshStandardMaterial color={['#c0392b', '#2980b9', '#f1c40f', '#27ae60'][i % 4]} />
            </mesh>
          ))}
        </group>
      )}

      {type === 'VLCC Tanker' && (
        <group position={[0, 0.6, 1]}>
           <mesh position={[0, 0, 0]} castShadow>
             <boxGeometry args={[3.8, 0.2, 7]} />
             <meshStandardMaterial color="#1a2a3a" />
           </mesh>
           {/* Pipework */}
           <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
             <cylinderGeometry args={[0.05, 0.05, 3.5]} />
             <meshStandardMaterial color="#ecf0f1" />
           </mesh>
        </group>
      )}

      {/* Water Surface Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#001f3f" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const Vessel3D = ({ vessel }) => {
  return (
    <div className="w-full h-full bg-[#060d1a] rounded-xl border border-[#00d4ff20] overflow-hidden relative shadow-2xl">
      <Canvas 
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ 
          antialias: true, 
          // Disabled logarithmicDepthBuffer to stop shader precision warnings
          logarithmicDepthBuffer: false,
          powerPreference: "high-performance",
          alpha: true
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[12, 10, 15]} near={0.1} far={1000} />
        <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 20, 10]} angle={0.4} penumbra={1} intensity={2} castShadow 
           shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5}/>
        
        <React.Suspense fallback={null}>
          <VesselModel type={vessel?.vessel_type || 'Container Ship'} />
          <Environment preset="night" />
        </React.Suspense>
      </Canvas>
      
      <div className="absolute top-4 left-4 font-display text-white/40 text-xs uppercase tracking-[0.3em] pointer-events-none group-hover:text-accent transition-colors">
        SIM_STREAM // {vessel?.name || 'CORE_IDLE'}
      </div>
      
      <div className="absolute top-4 right-4 flex gap-2">
         <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
         <span className="text-[8px] font-mono text-safe uppercase tracking-tighter">DATA_SYNC_OK</span>
      </div>
    </div>
  );
};

export default Vessel3D;
