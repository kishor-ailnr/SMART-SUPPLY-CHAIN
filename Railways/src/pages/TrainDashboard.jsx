import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTrainStore from '../store/useTrainStore';
import { MapContainer, TileLayer, Marker, Polyline, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import { ArrowLeft, Clock, Activity, CloudFog, ShieldAlert, Cpu, Route, Users, PackageOpen, AlertTriangle } from 'lucide-react';

export default function TrainDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trains, setTrains } = useTrainStore();
  const [activeTab, setActiveTab] = useState('INTELLIGENCE');
  const [routeStations, setRouteStations] = useState([]);
  const [fullGeometry, setFullGeometry] = useState([]);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    if (!id) return;

    // FIX: Clear previous route variables immediately to prevent stale visual render
    setRouteStations([]);
    setFullGeometry([]);

    // Fetch world boundaries for dark black borders (only if not already loaded)
    if (!geoData) {
      fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
        .then(res => res.json())
        .then(data => setGeoData(data));
    }

    // Ensure trains list presence
    if (trains.length === 0) {
      fetch('/api/trains/active')
        .then(res => res.json())
        .then(data => setTrains(data))
        .catch(err => console.error("Initial Sync Error:", err));
    }

    // FIX: Unique Fetch per Train ID
    console.log("Fetching dynamic route for train:", id);
    fetch(`/api/trains/${id}/route`)
      .then(res => res.json())
      .then(data => {
        setRouteStations(data.stations || []);
        setFullGeometry(data.geometry || []);
      })
      .catch(err => console.error("Dynamic Route Fetch Error:", err));

  }, [id, setTrains]); // React to ID change specifically
  
  const train = trains.find(t => t.id === id);

  if (!train) return <div className="p-10 text-white font-mono flex items-center justify-center h-screen bg-bg-primary">INITIATING TRAIN SYNC...</div>;

  // Split geometry into passed and upcoming for coloring
  // Find index in geometry that corresponds to current station latitude
  const currentStation = routeStations.find(s => s.status === 'CURRENT');
  const splitIdx = fullGeometry.findIndex(p => p[0] <= (currentStation?.lat || 0));
  const effectiveSplit = splitIdx === -1 ? Math.floor(fullGeometry.length / 2) : splitIdx;

  const passedPath = fullGeometry.slice(0, effectiveSplit + 1);
  const upcomingPath = fullGeometry.slice(effectiveSplit);

  const tabs = [
    { id: 'INTELLIGENCE', icon: Cpu, label: 'TRAIN & LOCO' },
    { id: 'ROUTE', icon: Route, label: 'ROUTE & SCHEDULE' },
    { id: 'PREDICTIVE', icon: CloudFog, label: 'PREDICTIVE AI' },
    { id: 'CREW', icon: Users, label: 'CREW HOER' },
    { id: 'CARGO', icon: PackageOpen, label: 'CARGO BLOCKCHAIN' },
    { id: 'SAFETY', icon: ShieldAlert, label: 'SAFETY SYSTEM' }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* Background Map Level */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          key={id} // Force re-mount on ID change to reset center
          center={[train.lat || 22.0, train.lng || 78.0]} 
          zoom={6} 
          className="w-full h-full" 
          zoomControl={false}
        >
          <TileLayer 
            className="map-base-sandal"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          />
          {/* Dark Black Country Borders */}
          {geoData && <GeoJSON data={geoData} style={{ color: '#000000', weight: 1.5, fillOpacity: 0 }} />}
          <TileLayer 
            className="map-rail-orange"
            url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" 
          />
          
          {/* Passed Path Segment (Green) */}
          {passedPath.length > 1 && <Polyline positions={passedPath} color="#22c55e" weight={4} dashArray="5, 10" />}
          
          {/* Upcoming Path Segment (Brown) */}
          {upcomingPath.length > 1 && <Polyline positions={upcomingPath} color="#8B4513" weight={4} dashArray="5, 10" />}

          {/* Render Station Markers with variating sizes */}
          {routeStations.map((s, idx) => {
            const isBound = idx === 0 || idx === routeStations.length - 1;
            return (
              <CircleMarker 
                key={s.code} 
                center={[s.lat, s.lng]} 
                radius={isBound ? 8 : 4} 
                pathOptions={{
                  fillColor: s.status === 'PASSED' ? '#22c55e' : (s.status === 'CURRENT' ? '#FF8C00' : '#8B4513'),
                  color: 'white',
                  weight: 1,
                  fillOpacity: 1
                }}
              >
                <Popup className="font-mono text-xs">
                  <div className="font-bold">{s.name} ({s.code})</div>
                  <div className="text-text-muted">Status: {s.status}</div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Current Live Train Position */}
          {train.lat && train.lng && <Marker position={[train.lat, train.lng]} />}
        </MapContainer>
      </div>

      {/* Top Left Float */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={() => navigate('/overview')} className="glass-panel p-2 rounded flex items-center gap-2 hover:bg-rail-accent/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-rail-accent" />
          <span className="font-mono text-sm font-bold text-white">BACK TO FLEET</span>
        </button>
        <button onClick={() => window.location.href = import.meta.env.VITE_HUB_URL || 'http://localhost:5000'}
          className="glass-panel p-2 px-4 rounded font-mono text-sm font-bold text-white/60 hover:text-rail-accent border border-white/10 hover:border-rail-accent transition-all">
          HUB
        </button>
      </div>

      {/* Right Intelligence Panel */}
      <div className="absolute top-4 bottom-4 right-4 w-[400px] glass-panel rounded-xl flex flex-col z-10 shadow-2xl border border-rail-border backdrop-blur-xl bg-bg-secondary/80">
        {/* Header */}
        <div className="p-5 border-b border-rail-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-rail-accent text-sm tracking-widest">{train.train_type.toUpperCase()}</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-onTime animate-pulse"></span>
              <span className="text-xs font-mono text-status-onTime">LIVE</span>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold">{train.train_number}</h2>
          <p className="font-body text-xl font-semibold opacity-90">{train.train_name}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-bg-tertiary p-2 rounded border border-rail-border">
              <p className="text-[10px] text-text-muted font-mono">CURRENT SPEED</p>
              <p className="text-lg font-mono font-bold text-white">{train.speed || 0} <span className="text-xs">KM/H</span></p>
            </div>
            <div className={`p-2 rounded border ${train.delay > 0 ? 'bg-status-delayedMinorDim border-status-delayedMinor' : 'bg-status-onTimeDim border-status-onTime'}`}>
              <p className="text-[10px] text-white/70 font-mono">STATUS</p>
              <p className={`text-lg font-mono font-bold ${train.delay > 0 ? 'text-status-delayedMinor' : 'text-status-onTime'}`}>
                {train.delay > 0 ? `+${train.delay} MIN` : 'ON TIME'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-rail-border overflow-x-auto custom-scrollbar bg-bg-tertiary">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-mono text-xs ${activeTab === tab.id ? 'border-rail-accent text-rail-accent bg-bg-hover' : 'border-transparent text-text-muted hover:text-white hover:bg-bg-primary/50'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-custom">
          {activeTab === 'INTELLIGENCE' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono text-text-secondary mb-3 border-b border-rail-border pb-1">LOCOMOTIVE TELEMETRY</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-panel p-3 rounded">
                    <p className="text-[10px] font-mono text-text-muted">LOCO CLASS</p>
                    <p className="font-mono text-sm">{train.loco_type}</p>
                  </div>
                  <div className="glass-panel p-3 rounded">
                    <p className="text-[10px] font-mono text-text-muted">PANTOGRAPH</p>
                    <p className="font-mono text-sm text-signal-green">25kV AC OK</p>
                  </div>
                  <div className="glass-panel p-3 rounded">
                    <p className="text-[10px] font-mono text-text-muted">HOME SHED</p>
                    <p className="font-mono text-sm">{train.loco_shed}</p>
                  </div>
                  <div className="glass-panel p-3 rounded">
                    <p className="text-[10px] font-mono text-text-muted">RAKE CODES</p>
                    <p className="font-mono text-sm">{train.rake_type}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono text-text-secondary mb-3 border-b border-rail-border pb-1">IOT SENSOR AGENT</h3>
                <div className="bg-bg-tertiary border border-rail-border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs">HOTBOX DETECTOR</span>
                    <span className="text-xs font-mono text-signal-green">CLEAR</span>
                  </div>
                  <div className="w-full bg-bg-primary h-1 rounded-full"><div className="bg-signal-green w-[30%] h-full rounded-full"></div></div>
                  <p className="text-[10px] font-mono text-text-muted mt-2">All axle temperatures within nominal 45°C - 55°C range.</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'ROUTE' && (
            <div className="space-y-4 font-mono text-sm">
              <div className="flex bg-bg-tertiary p-3 rounded border border-rail-border relative">
                <div className="absolute left-[20px] top-8 bottom-8 w-px bg-rail-border"></div>
                <div className="space-y-6 w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-rail-accent mt-1 z-10 border-2 border-bg-primary"></div>
                    <div>
                      <p className="font-bold">NDLS <span className="text-text-muted font-normal text-xs ml-2">ORIGIN</span></p>
                      <p className="text-xs text-text-muted">16:00 IST</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-status-onTime mt-1 z-10 border-2 border-bg-primary"></div>
                    <div>
                      <p className="font-bold">CNB <span className="text-text-muted font-normal text-xs ml-2">CROSSED</span></p>
                      <p className="text-xs text-text-muted">20:45 IST</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-bg-tertiary border-2 border-rail-accent mt-1 z-10 animate-pulse"></div>
                    <div>
                      <p className="font-bold text-rail-accent">PRYJ <span className="text-text-muted font-normal text-xs ml-2">NEXT STATION</span></p>
                      <p className="text-xs text-status-delayedMinor">ETA: 22:50 IST (+14m)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'PREDICTIVE' && (
            <div className="space-y-4">
               <div className="border border-status-delayedMajor p-3 rounded bg-status-delayedMajorDim">
                 <div className="flex items-center gap-2 text-status-delayedMajor mb-2">
                   <AlertTriangle className="w-4 h-4" />
                   <h4 className="font-mono text-xs font-bold">FOG INTELLIGENCE AGENT</h4>
                 </div>
                 <p className="text-xs font-mono text-white/90">Visibility drop predicted at DDU section between 02:00 - 05:00 IST. Estimated visibility 180m (Fog Safe Device threshold active).</p>
               </div>
               
               <button onClick={() => navigate('/twin')} className="w-full mt-4 bg-bg-tertiary border border-rail-accent text-rail-accent py-3 rounded font-mono text-xs font-bold hover:bg-rail-accent hover:text-bg-primary transition-colors hover:shadow-[0_0_15px_var(--rail-accent)]">
                 INITIALIZE 40-HR DIGITAL TWIN
               </button>
            </div>
          )}
          {activeTab === 'SAFETY' && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-sm font-bold text-white">KAVACH SYSTEM</h4>
                  <p className="text-xs font-mono text-text-muted">Train Collision Avoidance</p>
                </div>
                {train.kavach_installed ? (
                  <span className="bg-status-onTime/20 text-status-onTime px-3 py-1 rounded font-mono text-xs border border-status-onTime">ACTIVE</span>
                ) : (
                  <span className="bg-status-delayedMajor/20 text-status-delayedMajor px-3 py-1 rounded font-mono text-xs border border-status-delayedMajor">NOT INSTALLED</span>
                )}
              </div>
            </div>
          )}
          {activeTab === 'CARGO' && (
            <div className="space-y-4">
              {!train.is_freight ? (
                <div className="text-center p-6 text-text-muted font-mono text-xs">PASSENGER RAKE. NO CARGO MANIFEST.</div>
              ) : (
                 <div className="space-y-3">
                   <div className="glass-panel p-3 rounded">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-mono text-text-muted">POLYGON CONTRACT</span>
                       <span className="text-[10px] font-mono text-rail-accent">VERIFIED</span>
                     </div>
                     <p className="font-mono text-xs text-white truncate">0x7F2...C4D9</p>
                   </div>
                   <div className="flex gap-2">
                     <button className="flex-1 bg-bg-tertiary border border-rail-border p-2 rounded text-xs font-mono hover:border-rail-accent transition-colors">VIEW IPFS RR</button>
                     <button className="flex-1 bg-bg-tertiary border border-rail-border p-2 rounded text-xs font-mono hover:border-rail-accent transition-colors">WAGON HEALTH</button>
                   </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
