import React from 'react';
import { useStore } from '../store/useStore';
import TwinMap from '../components/map/TwinMap';
import TwinTimeline from '../components/twin/TwinTimeline';
import TwinGhostPanel from '../components/twin/TwinGhostPanel';

const TwinDashboard = () => {
  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 relative">
        <TwinMap />
        
        <div className="absolute top-6 right-6 bottom-6 w-96 z-40">
          <TwinGhostPanel />
        </div>
      </div>
      
      <div className="h-32 bg-ocean-900 border-t border-white/10 p-4">
        <TwinTimeline />
      </div>
    </div>
  );
};

export default TwinDashboard;
