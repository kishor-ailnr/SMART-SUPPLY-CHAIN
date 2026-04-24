import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Helper component to handle dynamic map updates
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const createTruckTagIcon = (color = '#00e5ff', heading = 0) => {
  return L.divIcon({
    className: 'custom-tag-icon',
    html: `
      <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease-out;">
        <div style="
          background: #fff;
          border: 2px solid ${color};
          border-radius: 20px;
          height: 28px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${color}">
            <path d="M20 18C21.1 18 22 17.1 22 16V9C22 7.9 21.1 7 20 7H16V3C16 1.9 15.1 1 14 1H4C2.9 1 2 1.9 2 3V14C2 15.1 2.9 16 4 16C4 17.1 4.9 18 6 18C7.1 18 8 17.1 8 16H16C16 17.1 16.9 18 18 18C19.1 18 20 17.1 20 18ZM6 17C5.45 17 5 16.55 5 16C5 15.45 5.45 15 6 15C6.55 15 7 15.45 7 16C7 16.55 6.55 17 6 17ZM18 17C17.45 17 17 16.55 17 16C17 15.45 17.45 15 18 15C18.55 15 19 15.45 19 16C19 16.55 18.55 17 18 17ZM4 13V3H14V14H4V13ZM16 13V9H20V14H16V13Z" />
          </svg>
           <div style="width: 2px; height: 14px; background: ${color}; margin: 0 8px; opacity: 0.3;"></div>
           <div style="font-family: 'IBM Plex Mono', sans-serif; font-size: 10px; font-weight: 800; color: #333;">Live</div>
        </div>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 16]
  });
};

export default function VehicleMap({ vehicle }) {
  if (!vehicle) return null;

  const lat = vehicle.last_lat;
  const lng = vehicle.last_lng;
  const hasCoords = lat !== undefined && lng !== undefined;

  // Use the real confirmed route from the vehicle data
  const historyPath = vehicle.confirmedRoute ? vehicle.confirmedRoute.map(p => [p.lat, p.lng]) : [];
  
  // If history path is empty, show a small simulated trail for visual context
  const displayPath = historyPath.length > 0 ? historyPath : (hasCoords ? [
    [lat - 0.01, lng - 0.01],
    [lat - 0.005, lng - 0.002],
    [lat, lng]
  ] : []);

  return (
    <div className="w-full h-full relative overflow-hidden" id="vehicle-map-container">
      <MapContainer 
        center={hasCoords ? [lat, lng] : [20.5937, 78.9629]} 
        zoom={14} 
        className="w-full h-full"
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer 
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
          detectRetina={true} 
          attribution='&copy; OpenStreetMap'
        />
        
        <MapController center={hasCoords ? [lat, lng] : null} zoom={14} />
        
        <ZoomControl position="topright" />
        
        {hasCoords && (
          <>
            {/* Real location history */}
            <Polyline positions={displayPath} pathOptions={{ color: '#22c55e', weight: 4, opacity: 0.6, lineCap: 'round' }} />
            
            {/* Future Projection (Simulated for Demo) */}
            <Polyline 
                positions={[
                    [lat, lng],
                    [lat + 0.005, lng + 0.005],
                    [lat + 0.01, lng + 0.012]
                ]} 
                pathOptions={{ color: vehicle.color, weight: 2, opacity: 0.4, dashArray: '5, 10' }} 
            />
            
            <Marker position={[lat, lng]} icon={createTruckTagIcon(vehicle.color, vehicle.last_heading || 0)} />
            
            <Circle 
              center={[lat, lng]} 
              radius={500} 
              pathOptions={{ color: vehicle.color, fillColor: vehicle.color, fillOpacity: 0.1, weight: 1, dashArray: '2, 5' }} 
            />
          </>
        )}
      </MapContainer>

      {/* Sync theme with Global Map */}
      <style>{`
        #vehicle-map-container .leaflet-tile-pane {
            filter: sepia(0.4) saturate(1.1) brightness(1.1) contrast(1.1);
        }
        #vehicle-map-container .leaflet-container {
            background-color: #87CEEB !important;
        }
      `}</style>
    </div>
  );
}
