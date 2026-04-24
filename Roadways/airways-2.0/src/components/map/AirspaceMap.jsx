import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AirspaceMap = () => {
  const flights = useStore(s => s.flights);
  const vehicles = useStore(s => s.vehicles);
  const mapLayers = useStore(s => s.mapLayers);
  
  // Convert basic CSS rotation into a DivIcon
  const createRotatedVehicleIcon = (heading, color) => {
    return new L.DivIcon({
      html: `<div style="transform: rotate(${heading}deg); background-color: ${color}; width: 14px; height: 14px; border-radius: 2px; border: 2px solid white;"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  const createFlightIcon = (heading, riskLevel) => {
    const riskColors = { 'LOW': '#00ff88', 'MEDIUM': '#ffd700', 'HIGH': '#ff6b35', 'CRITICAL': '#ff0000'};
    const color = riskColors[riskLevel] || '#00ff88';
    
    return new L.DivIcon({
      html: `<div style="transform: rotate(${heading}deg); width: 0; height: 0; 
            border-left: 10px solid transparent; border-right: 10px solid transparent; 
            border-bottom: 20px solid ${color};"></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
      />
      {mapLayers.flights && flights.map(f => f.lat && f.lng && (
         <Marker key={'fl_'+f.id} position={[f.lat, f.lng]} icon={createFlightIcon(f.heading || 0, f.risk_level)}>
            <Popup>
               <div className="bg-slate-900 border border-cyan-400 p-2 text-white">
                 <b>{f.flight_number}</b><br/>Alt: {f.altitude_ft}ft<br/>Risk: {f.risk_level}
               </div>
            </Popup>
         </Marker>
      ))}

      {mapLayers.vehicles && vehicles.map(v => v.current_lat && v.current_lng && (
         <Marker key={'vh_'+v.id} position={[v.current_lat, v.current_lng]} icon={createRotatedVehicleIcon(v.current_heading || 0, '#00bfff')}>
            <Popup>
               <div className="bg-slate-900 border border-cyan-400 p-2 text-white">
                 <b>{v.vehicle_number}</b><br/>Type: {v.type}<br/>Status: {v.status}
               </div>
            </Popup>
         </Marker>
      ))}
    </MapContainer>
  );
};

export default AirspaceMap;
