import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import useStore from '../../store';

const Aircraft3D = ({ position, color, label }) => {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <cylinderGeometry args={[0.15, 0.2, 1.5, 8]} />
         <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
         <boxGeometry args={[2.5, 0.05, 0.6]} />
         <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.2, -0.6]}>
         <boxGeometry args={[0.8, 0.5, 0.05]} />
         <meshStandardMaterial color={color} />
      </mesh>
      <Html distanceFactor={10}>
        <div style={{ color: 'cyan', background: 'rgba(0,0,0,0.8)', padding: '2px 4px', fontSize: '10px', border: '1px solid cyan' }}>{label}</div>
      </Html>
    </group>
  );
};

export default function DigitalTwinScene() {
  const flights = useStore(s => s.flights);
  
  // Transform lat/lng to 3D space roughly for Indian bounds
  const getSimulatedCoords = (lat, lng, alt) => {
    const x = (lng - 78.9629) * 2;
    const z = -(lat - 20.5937) * 2;
    const y = alt / 10000;
    return [x, Math.max(y, 0.1), z];
  };

  return (
    <Canvas camera={{ position: [0, 15, 25], fov: 60 }} style={{ background: '#050a14' }}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#020813" opacity={0.8} transparent />
      </mesh>
      
      {/* Aircrafts */}
      {flights.map(f => {
         if(!f.lat || !f.lng) return null;
         const pos = getSimulatedCoords(f.lat, f.lng, f.altitude_ft || 35000);
         const color = f.risk_level === 'HIGH' || f.risk_level === 'CRITICAL' ? 'red' : 'white';
         return <Aircraft3D key={'3d_'+f.id} position={pos} color={color} label={f.flight_number} />;
      })}
    </Canvas>
  );
}
