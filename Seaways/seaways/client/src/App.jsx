import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';
import Login from './pages/Login';
import ActiveVessels from './pages/ActiveVessels';
import LiveDashboard from './pages/LiveDashboard';
import DigitalTwin from './pages/DigitalTwin';
import EventsPrediction from './pages/EventsPrediction';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ChatBot from './components/chat/ChatBot';
import NotificationPanel from './components/layout/NotificationPanel';

const App = () => {
  useWebSocket();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
             <ActiveVessels />
          </ProtectedRoute>
        } />
        
        <Route path="/vessel/:id" element={
          <ProtectedRoute>
            <LiveDashboard />
          </ProtectedRoute>
        } />

        <Route path="/vessel/:id/twin" element={
          <ProtectedRoute>
            <DigitalTwin />
          </ProtectedRoute>
        } />

        <Route path="/vessel/:id/events" element={
          <ProtectedRoute>
            <EventsPrediction />
          </ProtectedRoute>
        } />
      </Routes>

      <NotificationPanel />
      <ChatBot />
    </>
  );
};

export default App;
