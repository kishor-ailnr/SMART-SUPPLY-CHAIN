import React from 'react';
import { useStore } from '../../store/useStore';
import { Compass, Gauge, Clock, ShieldAlert } from 'lucide-react';

const MapInfoCorner = () => {
  const { selectedVesselId, vessels } = useStore();
  const vessel = vessels.find(v => v.vesselId === selectedVesselId);

  if (!vessel) return null;

  return (
    <div className="absolute bottom-6 left-6 z-40">
      <div className="glass-panel p-4 w-72 border-accent/20 bg-ocean-900/90 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="border-b border-white/10 pb-2 mb-3">
          <h3 className="text-accent font-bold text-sm tracking-widest">{vessel.name}</h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">{vessel.type} — {vessel.imo}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-[10px] text-white/40">SOG</p>
              <p className="text-sm font-mono font-bold text-accent">{vessel.speed} kn</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-[10px] text-white/40">COG</p>
              <p className="text-sm font-mono font-bold text-accent">{vessel.heading.toFixed(1)}°</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-[10px] text-white/40">REM TIME</p>
              <p className="text-sm font-mono font-bold text-accent">{vessel.etaHours?.toFixed(1) || '--'}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-white/30" />
            <div>
              <p className="text-[10px] text-white/40">RISK</p>
              <p className={`text-sm font-mono font-bold ${vessel.riskLevel === 'CRITICAL' ? 'text-danger' : vessel.riskLevel === 'HIGH' ? 'text-orange-500' : 'text-safe'}`}>
                {vessel.riskLevel}
              </p>
            </div>
          </div>
        </div>
        
        {vessel.delayHours > 0 && (
          <div className="mt-3 p-2 bg-danger/10 border border-danger/30 rounded text-[10px] text-danger font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            DELAY PREDICTED: +{vessel.delayHours?.toFixed(1)}H
          </div>
        )}
      </div>
    </div>
  );
};

export default MapInfoCorner;
