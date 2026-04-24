import React, { useMemo } from 'react';
import { Polyline, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';

const RouteLayer = ({ vessel }) => {
  const { positions, pastPositions, futurePositions, checkpoints } = useMemo(() => {
    if (!vessel || !vessel.voyage?.route_key) return { positions: [], pastPositions: [], futurePositions: [], checkpoints: [] };

    let coordinates = [];
    try {
      coordinates = JSON.parse(vessel.voyage.route_key);
    } catch (e) {
      return { positions: [], pastPositions: [], futurePositions: [], checkpoints: [] };
    }

    const allPositions = coordinates.map(c => [c[1], c[0]]);
    
    // Find closest index to vessel's current position to split track
    let closestIdx = 0;
    let minDistance = Infinity;
    const vesselPos = L.latLng(vessel.lat, vessel.lng);

    allPositions.forEach((pos, idx) => {
      const dist = vesselPos.distanceTo(L.latLng(pos[0], pos[1]));
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    return {
      positions: allPositions,
      pastPositions: allPositions.slice(0, closestIdx + 1),
      futurePositions: allPositions.slice(closestIdx),
      checkpoints: [
          { label: 'Start Point', pos: allPositions[0], type: 'PIN' },
          { label: 'Mid-Navigation', pos: allPositions[Math.floor(allPositions.length / 2)], type: 'MID' },
          { label: 'Final Destination', pos: allPositions[allPositions.length - 1], type: 'PIN' }
      ]
    };
  }, [vessel?.voyage?.route_key, vessel?.lat, vessel?.lng]);

  const pinIcon = (isMid) => L.divIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: ${isMid ? '#f1c40f' : '#dc2626'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
            <div style="width: 2px; height: 10px; background: white;"></div>
        </div>
      `,
      className: 'custom-pin',
      iconSize: [20, 30],
      iconAnchor: [10, 22]
  });

  if (positions.length === 0) return null;

  return (
    <>
      {/* Historical Track (CROSSED PLACE) - GREEN */}
      <Polyline
        positions={pastPositions}
        pathOptions={{
          color: '#2ecc71',
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round'
        }}
      />
      
      {/* Future Track (FUTURE TRACKING) - YELLOW */}
      <Polyline
        positions={futurePositions}
        pathOptions={{
          color: '#f1c40f',
          weight: 4,
          opacity: 0.7,
          dashArray: '12, 12',
          lineJoin: 'round'
        }}
      />

      {/* Checkpoint Pins (Start/End Red, Mid Yellow) */}
      {checkpoints.map((cp, i) => (
        <Marker
          key={i}
          position={cp.pos}
          icon={pinIcon(cp.type === 'MID')}
        >
          <Popup>
            <div className="bg-[#0a1628] text-white p-2 text-xs font-mono border border-accent/20 rounded">
              <p className={`font-bold uppercase ${cp.type === 'PIN' ? 'text-critical' : 'text-warning'}`}>{cp.label}</p>
              <p className="opacity-60 text-[10px] mt-1">{cp.pos[0].toFixed(4)}°N, {cp.pos[1].toFixed(4)}°E</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default RouteLayer;
