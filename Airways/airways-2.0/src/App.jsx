import React, { useEffect } from 'react';
import useStore from './store';
import AirspaceMap from './components/map/AirspaceMap';
import DigitalTwinScene from './components/map/DigitalTwinScene';

function App() {
  const wsConnected = useStore(s => s.wsConnected);
  const setWsConnected = useStore(s => s.setWsConnected);
  const setFlights = useStore(s => s.setFlights);
  const setVehicles = useStore(s => s.setVehicles);
  const mapView = useStore(s => s.mapView);
  const setMapView = useStore(s => s.setMapView);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:6002');
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'INITIAL_STATE' || data.type === 'FLIGHT_UPDATE') {
        if(data.flights) setFlights(data.flights);
      }
      if (data.type === 'VEHICLE_UPDATE') {
        if(data.vehicles) setVehicles(data.vehicles);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col text-white overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      <header className="h-16 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)'}}>
        <div className="flex items-center gap-4">
           <h1 className="text-xl font-bold tracking-widest text-[#00d4ff] display-font" style={{ textShadow: 'var(--glow-primary)' }}>AIRWAYS 2.0</h1>
           <span className={`px-2 py-1 rounded text-xs ${wsConnected ? 'bg-green-600' : 'bg-red-600'}`}>
             {wsConnected ? 'DATALINK SECURE' : 'DISCONNECTED'}
           </span>
           <button onClick={() => window.location.href = 'http://localhost:5000'}
             className="ml-4 px-3 py-1 text-xs rounded border border-gray-500 text-gray-300 hover:text-[#00d4ff] hover:border-[#00d4ff] transition-all">
             BACK TO HUB
           </button>
        </div>
        <div className="flex gap-2">
            <button className={`px-4 py-1 text-sm rounded border ${mapView === '2D' ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'border-gray-500 text-gray-300'}`} onClick={() => setMapView('2D')}>2D RADAR</button>
            <button className={`px-4 py-1 text-sm rounded border ${mapView === '3D' ? 'bg-[#00d4ff] text-black border-[#00d4ff]' : 'border-gray-500 text-gray-300'}`} onClick={() => setMapView('3D')}>3D TWIN</button>
        </div>
      </header>
      
      <main className="flex-1 relative">
         {mapView === '2D' ? <AirspaceMap /> : <DigitalTwinScene />}
      </main>
    </div>
  );
}

export default App;
