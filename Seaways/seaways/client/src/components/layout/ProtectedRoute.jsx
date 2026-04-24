import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser === undefined) {
    return (
      <div className="h-screen w-screen bg-ocean-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-accent font-space tracking-widest uppercase animate-pulse">Establishing Secure Connection...</p>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
