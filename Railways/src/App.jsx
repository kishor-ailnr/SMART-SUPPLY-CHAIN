import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import TrainDashboard from './pages/TrainDashboard';
import DigitalTwin from './pages/DigitalTwin';
import EventPrediction from './pages/EventPrediction';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/train/:id" element={<TrainDashboard />} />
        <Route path="/twin" element={<DigitalTwin />} />
        <Route path="/events" element={<EventPrediction />} />
      </Routes>
    </BrowserRouter>
  );
}
