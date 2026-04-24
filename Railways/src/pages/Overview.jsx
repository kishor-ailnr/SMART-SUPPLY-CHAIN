import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import useTrainStore from '../store/useTrainStore';
import { Bell, Search, Filter } from 'lucide-react';

const trainIcon = L.divIcon({
  className: 'custom-train-icon',
  html: `<div style="background-color: #FF8C00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px #FF8C00;"></div>`,
  iconSize: [12, 12]
});

export default function Overview() {
  const navigate = useNavigate();
  const { trains, setTrains, updateTrainPositions } = useTrainStore();
  const [filter, setFilter] = useState('ALL');

  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Fetch world boundaries for dark black borders
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(res => res.json())
      .then(data => setGeoData(data));

    // Fetch initial trains list from proxied backend
    fetch('/api/trains/active')
      .then(res => res.json())
      .then(data => setTrains(data))
      .catch(err => console.error("Error fetching trains:", err));
      
    // Connect to WebSocket using current window host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'TRAIN_POSITIONS') {
        updateTrainPositions(message.payload);
      }
    };

    return () => ws.close();
  }, [setTrains, updateTrainPositions]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* LEFT PANEL - TRAIN CARDS */}
      <div className="w-96 bg-bg-secondary border-r border-rail-border flex flex-col z-10 glass-panel">
        <div className="p-4 border-b border-rail-border flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl tracking-widest text-rail-accent">RAILWAYS 2.0</h1>
            <p className="text-xs font-mono text-text-secondary">ACTIVE FLEET OVERVIEW</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = import.meta.env.VITE_HUB_URL || 'http://localhost:5000'}
              className="px-2 py-1 bg-bg-tertiary text-[10px] font-mono rounded border border-rail-border text-text-muted hover:text-rail-accent hover:border-rail-accent transition-all">
              HUB
            </button>
            <Bell className="w-5 h-5 text-text-muted hover:text-rail-accent cursor-pointer" />
          </div>
        </div>
        
        <div className="p-4 border-b border-rail-border">
          <div className="flex items-center gap-2 bg-bg-tertiary p-2 rounded border border-rail-border focus-within:border-rail-accent transition-colors">
            <Search className="w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Search Train, Loco, Station..." className="bg-transparent border-none outline-none text-sm font-mono w-full text-white" />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 pb-custom">
             {['ALL', 'PASSENGER', 'FREIGHT', 'DELAYED'].map(f => (
               <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-mono rounded ${filter === f ? 'bg-rail-accent text-bg-primary font-bold' : 'bg-bg-tertiary text-text-muted border border-rail-border hover:text-white'}`}>{f}</button>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {trains.filter(t => filter === 'ALL' || (filter === 'FREIGHT' && t.is_freight) || (filter === 'PASSENGER' && !t.is_freight)).map(train => (
            <div 
              key={train.id} 
              onClick={() => navigate(`/train/${train.id}`)}
              className="p-3 mb-2 rounded bg-bg-tertiary border border-rail-border hover:border-rail-accent cursor-pointer transition-all hover:bg-bg-hover relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-status-onTime group-hover:bg-rail-accent transition-colors"></div>
              <div className="ml-2 flex justify-between items-start">
                 <div>
                   <span className="font-mono font-bold text-lg">{train.train_number}</span>
                   <p className="font-body text-sm font-semibold truncate w-48">{train.train_name}</p>
                 </div>
                 <span className={`text-xs font-mono px-2 py-1 rounded ${train.delay > 0 ? 'bg-status-delayedMinorDim text-status-delayedMinor' : 'bg-status-onTimeDim text-status-onTime'}`}>
                    {train.delay > 0 ? `+${train.delay}m` : 'ON TIME'}
                 </span>
              </div>
              <div className="ml-2 mt-2 flex items-center justify-between text-xs font-mono text-text-muted border-t border-rail-border/50 pt-2">
                 <span>{train.speed || 0} km/h</span>
                 <span>{train.zone} • {train.loco_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - MAP */}
      <div className="flex-1 relative">
        <MapContainer center={[22.5937, 78.9629]} zoom={5} className="w-full h-full" zoomControl={false}>
          {/* Base Layer: Sandal land, blue sea, dark roads */}
          <TileLayer
            className="map-base-sandal"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* Dark Black Country Borders */}
          {geoData && <GeoJSON data={geoData} style={{ color: '#000000', weight: 1.5, fillOpacity: 0 }} />}
          {/* Rail Layer: Bright orange highlighting */}
          <TileLayer
            className="map-rail-orange"
            url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a>'
          />

          {trains.map(train => train.lat && train.lng ? (
            <Marker key={train.id} position={[train.lat, train.lng]} icon={trainIcon}>
              <Popup className="font-mono">
                <div className="text-sm font-bold">{train.train_number} - {train.train_name}</div>
                <div>Speed: {train.speed} km/h</div>
                <div className="text-xs text-text-muted mt-1">Click card to open dashboard</div>
              </Popup>
            </Marker>
          ) : null)}
        </MapContainer>
        
        {/* Map Top Nav / Overlays Config */}
        <div className="absolute top-4 right-4 z-[1000] glass-panel rounded p-2 flex gap-2">
           <button className="px-3 py-1 bg-bg-tertiary text-text-secondary text-xs font-mono rounded border border-rail-border hover:text-white hover:border-rail-accent">TRACK TYPE</button>
           <button className="px-3 py-1 bg-bg-tertiary text-text-secondary text-xs font-mono rounded border border-rail-border hover:text-white hover:border-rail-accent">WEATHER</button>
           <button className="px-3 py-1 bg-bg-tertiary text-text-secondary text-xs font-mono rounded border border-rail-border hover:text-white hover:border-rail-accent">SIGNALS</button>
        </div>
      </div>
    </div>
  );
}
