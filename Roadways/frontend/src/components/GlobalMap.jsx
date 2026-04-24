import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useStore from '../store/useStore';

// Sandal-theme Marker
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

export default function GlobalMap({ vehicles, onVehicleClick }) {
  // Sandal color style filter for map
  const mapStyle = {
    filter: 'sepia(0.3) saturate(1.2) brightness(1.05)',
    background: '#87CEEB', // Sky blue fallback
    width: '100%',
    height: '100%'
  };

  return (
    <div style={mapStyle} id="map-container">
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer 
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
          detectRetina={true} 
          attribution='&copy; OpenStreetMap'
        />

        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />
        
        {vehicles.filter(v => v.last_lat != null && v.last_lng != null).map(v => {
          const route = v.confirmedRoute || [];
          const routeCoords = route.map(p => [p.lat, p.lng]);
          
          return (
            <React.Fragment key={v.id}>
              {routeCoords.length > 1 && (
                <Polyline 
                  positions={routeCoords} 
                  pathOptions={{
                    color: v.color,
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '5, 8'
                  }}
                />
              )}

              <Marker 
                position={[v.last_lat, v.last_lng]} 
                icon={createTruckTagIcon(v.color, v.last_heading || 0)}
                eventHandlers={{
                  click: () => onVehicleClick && onVehicleClick(v)
                }}
              >
                <Popup offset={[0, -10]}>
                   <div style={{ padding: '8px', minWidth: '120px' }}>
                      <div style={{ fontWeight: 800, color: v.color, fontSize: '12px' }}>{v.registration_number}</div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Speed: {Math.round(v.last_speed)} km/h</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>Cargo: {v.cargo_type}</div>
                   </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Place name clarity enhancement layer via CSS */}
      <style>{`
        .leaflet-tile-pane {
            filter: sepia(0.4) saturate(1.1) brightness(1.1) contrast(1.1);
        }
        .leaflet-container {
            background-color: #87CEEB !important; /* Sky Blue for sea background */
        }
        /* Make labels more crisp */
        .leaflet-tile-container img {
            image-rendering: -webkit-optimize-contrast;
        }
      `}</style>
    </div>
  );
}
