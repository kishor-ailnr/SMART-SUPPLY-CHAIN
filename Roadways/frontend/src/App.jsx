import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import VehicleDashboard from './pages/VehicleDashboard';
import DigitalTwin from './pages/DigitalTwin';
import Analytics from './pages/Analytics';
import Geofence from './pages/Geofence';
import EventsPrediction from './pages/EventsPrediction';
import AIChatbot from './components/AIChatbot';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  useWebSocket(); // Initialize global WS connection

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/vehicle/:id" element={<VehicleDashboard />} />
        <Route path="/digital-twin/:id" element={<DigitalTwin />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/geofence" element={<Geofence />} />
        <Route path="/prediction/:id" element={<EventsPrediction />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <AIChatbot />
    </Router>
  );
}

export default App;
