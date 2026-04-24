import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

const PredictedTrackLayer = ({ vessel }) => {
  if (!vessel) return null;

  // Generate a predicted track for the next 40 hours (simplified)
  // In a real app, this would come from the backend AI agent
  const currentPos = [vessel.lat, vessel.lng];
  const predictedPositions = [...Array(20)].map((_, i) => {
    const hour = i + 1;
    // Simple linear projection for demo
    return [
      vessel.lat + (hour * 0.1), 
      vessel.lng + (hour * 0.15),
      hour
    ];
  });

  const fullPath = [currentPos, ...predictedPositions.map(p => [p[0], p[1]])];

  return (
    <>
      <Polyline
        positions={fullPath}
        pathOptions={{
          color: '#fbbf24', // Amber/Yellow for prediction
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 10',
          lineJoin: 'round'
        }}
      />
      
      {/* Risk Points on Map */}
      {[4, 12, 18].map(hour => {
        const point = predictedPositions[hour-1];
        if (!point) return null;
        
        const isCritical = hour === 12;
        
        return (
          <CircleMarker 
            key={hour} 
            center={[point[0], point[1]]} 
            radius={isCritical ? 8 : 5}
            pathOptions={{ 
              color: isCritical ? '#ef4444' : '#fbbf24', 
              fillColor: isCritical ? '#ef4444' : '#fbbf24',
              fillOpacity: 0.8,
              weight: 2,
              className: isCritical ? 'animate-pulse' : ''
            }} 
          >
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-transparent border-none shadow-none">
              <div className={`px-2 py-1 rounded border text-[8px] font-mono font-bold uppercase tracking-tighter ${isCritical ? 'bg-critical/90 border-critical text-white' : 'bg-warning/90 border-warning text-black'}`}>
                T+{hour}H: {isCritical ? 'CRITICAL_RISK' : 'PREDICTION_POINT'}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
};

export default PredictedTrackLayer;
