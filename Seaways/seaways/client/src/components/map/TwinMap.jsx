import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker } from 'react-leaflet';
import { useStore } from '../../store/useStore';
import L from 'leaflet';

const GhostIcon = (color) => L.divIcon({
  html: `<div class="animate-pulse-slow" style="width: 20px; height: 20px; border: 2px dashed ${color}; border-radius: 50%; background: ${color}22;"></div>`,
  className: 'ghost-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const TwinMap = () => {
  const { vessels, twinSimulations, selectedVesselId } = useStore();
  const selectedVessel = vessels.find(v => v.vesselId === selectedVesselId);
  const simData = twinSimulations[selectedVesselId];

  const getDangerColor = (danger) => {
    switch(danger) {
      case 'CRITICAL': return '#ff006e';
      case 'HIGH': return '#ff7900';
      case 'MEDIUM': return '#ffbe0b';
      default: return '#06d6a0';
    }
  };

  return (
    <MapContainer center={[15, 75]} zoom={4} className="w-full h-full" zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      
      {selectedVessel && (
        <>
          {/* Main Vessel */}
          <CircleMarker 
            center={[selectedVessel.lat, selectedVessel.lng]} 
            radius={8}
            pathOptions={{ color: '#00f5d4', fillColor: '#00f5d4', fillOpacity: 0.8 }}
          />

          {/* Simulated Path */}
          {simData?.simulatedPath?.map((wp, i, arr) => {
            if (i === arr.length - 1) return null;
            const next = arr[i+1];
            return (
              <Polyline
                key={`sim-${i}`}
                positions={[[wp.lat, wp.lng], [next.lat, next.lng]]}
                pathOptions={{
                  color: getDangerColor(wp.danger),
                  weight: 3,
                  dashArray: '5, 5',
                  opacity: 0.6
                }}
              />
            );
          })}

          {/* Ghost Twin Animation - just showing path points for now */}
          {simData?.simulatedPath?.map((wp, i) => (
            <Marker
              key={`ghost-${i}`}
              position={[wp.lat, wp.lng]}
              icon={GhostIcon(getDangerColor(wp.danger))}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
};

export default TwinMap;
