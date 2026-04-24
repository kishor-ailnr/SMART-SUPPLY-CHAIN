import React from 'react';
import { useStore } from '../../store/useStore';

const TwinTimeline = () => {
  const { selectedVesselId, twinSimulations } = useStore();
  const sim = twinSimulations[selectedVesselId];

  if (!sim) return (
    <div className="h-full flex items-center justify-center text-white/20 text-xs font-mono uppercase tracking-widest">
      Select a vessel to view projected digital twin timeline
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[10px] font-bold text-accent tracking-widest">48-HOUR MISSION PROJECTION</h4>
        <div className="flex gap-4 text-[10px] items-center">
          <div className="flex items-center gap-1.5 grayscale opacity-50">
            <div className="w-2 h-2 rounded-full bg-safe" /> <span>SAFE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" /> <span>MODERATE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-danger" /> <span>CRITICAL</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-1 relative overflow-x-auto pb-4">
        <div className="absolute left-0 top-0 bottom-4 w-[2px] bg-accent/50 z-10" />
        
        {sim.simulatedPath.map((step, i) => (
          <div key={i} className="flex-1 min-w-[60px] flex flex-col gap-2">
            <div 
              className={`h-4 rounded-sm border ${
                step.danger === 'CRITICAL' ? 'bg-danger/40 border-danger' : 
                step.danger === 'HIGH' ? 'bg-orange-500/40 border-orange-500' :
                step.danger === 'MEDIUM' ? 'bg-warning/40 border-warning' : 'bg-safe/40 border-safe'
              }`} 
              title={step.danger}
            />
            <div className="flex flex-col text-[8px] font-mono text-white/30 truncate">
              <span className="text-white/60">+{step.hoursFromNow}h</span>
              <span>{Math.round(step.weather.waveHeight * 10) / 10}m WAVES</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TwinTimeline;
