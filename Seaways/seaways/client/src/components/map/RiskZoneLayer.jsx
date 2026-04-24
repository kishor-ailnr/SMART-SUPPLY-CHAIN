import React from 'react';
import { Circle, Popup } from 'react-leaflet';

const RiskZoneLayer = () => {
  // Demo risk zones in the Indian Ocean & Red Sea
  const zones = [
    { name: 'High Piracy Risk - Gulf of Aden', center: [12.5, 45.0], radius: 200000, color: '#ef4444' },
    { name: 'Cyclone Advisory Zone - Bay of Bengal', center: [14.5, 88.0], radius: 300000, color: '#f97316' },
  ];

  return (
    <>
      {zones.map((zone, i) => (
        <Circle
          key={i}
          center={zone.center}
          radius={zone.radius}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.1,
            dashArray: '10, 10',
            weight: 1
          }}
        >
          <Popup>
            <div className="bg-[#0a1628] text-white p-2 text-xs font-mono">
              <p className="font-bold text-critical uppercase">{zone.name}</p>
              <p className="text-[10px] text-white/60 uppercase mt-1">Status: ACTIVE_MONITORING</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default RiskZoneLayer;
