import React, { useEffect } from 'react';
import { useStore } from './store';
import Login from './screens/Login';
import Overview from './screens/Overview';
import FlightDashboard from './screens/FlightDashboard';
import DigitalTwin from './screens/DigitalTwin';
import Analytics from './screens/Analytics';
import AdminPanel from './screens/AdminPanel';

function App() {
  const { currentScreen, user, updateFlightPositions, setFlights, setNotifications, setCargoList } = useStore();

  useEffect(() => {
    if (!user) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6002';
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:6002';
    
    // Fetch initial flights
    fetch(`${apiUrl}/api/flights/active`)
      .then(res => res.json())
      .then(data => setFlights(data))
      .catch(console.error);

    fetch(`${apiUrl}/api/notifications`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(console.error);

    fetch(`${apiUrl}/api/cargo`)
      .then(res => res.json())
      .then(data => setCargoList(data))
      .catch(console.error);

    // Connect WebSocket
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'POSITIONS_UPDATE') {
        updateFlightPositions(payload.data);
      }
    };
    
    return () => ws.close();
  }, [user, setFlights, updateFlightPositions, setNotifications, setCargoList]);

  if (!user || currentScreen === 'LOGIN') {
    return <Login />;
  }

  return (
    <div className="w-full h-screen font-body bg-bg-primary text-text-primary overflow-hidden">
      {currentScreen === 'LOGIN' && <Login />}
      {currentScreen === 'OVERVIEW' && <Overview />}
      {currentScreen === 'FLIGHT' && <FlightDashboard />}
      {currentScreen === 'TWIN' && <DigitalTwin />}
      {currentScreen === 'ANALYTICS' && <Analytics />}
      {currentScreen === 'ADMIN' && <AdminPanel />}
    </div>
  );
}

export default App;
