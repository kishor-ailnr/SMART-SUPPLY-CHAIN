import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Search, Filter, Ship, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { clsx } from 'clsx';

const VesselCard = ({ vessel, isSelected, onClick }) => {
  const riskColors = {
    LOW: 'border-safe text-safe',
    MEDIUM: 'border-warning text-warning',
    HIGH: 'border-orange-500 text-orange-500',
    CRITICAL: 'border-danger text-danger',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-4 cursor-pointer transition-all border-l-4 mb-2 hover:bg-white/5',
        riskColors[vessel.riskLevel || 'LOW'],
        isSelected ? 'bg-accent/10 glass-panel border-r-0 rounded-l-none' : 'bg-ocean-800/40'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-bold truncate w-40">{vessel.name}</h3>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">
            {vessel.type}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-white/40">SPD / HDG</p>
          <p className="text-xs font-mono">{vessel.speed}kn / {vessel.heading}°</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-3">
        <div className="flex-1">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent" 
              style={{ width: `${(vessel.crossedWaypoints?.length || 0) / (vessel.confirmedRoute?.length || 1) * 100}%` }} 
            />
          </div>
        </div>
        <span className="text-[10px] font-mono text-accent">ETA {vessel.etaHours?.toFixed(1) || '--'}h</span>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { vessels, selectedVesselId, setSelectedVesselId } = useStore();
  const [search, setSearch] = useState('');

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-ocean-900 border-r border-white/10 flex flex-col z-40">
      <div className="p-4 border-b border-white/10">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search vessels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ocean-800 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'RISK', 'DELAY'].map(f => (
            <button key={f} className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 hover:border-accent/50 transition-all font-bold">
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredVessels.map(v => (
          <VesselCard
            key={v.vesselId}
            vessel={v}
            isSelected={selectedVesselId === v.vesselId}
            onClick={() => setSelectedVesselId(v.vesselId)}
          />
        ))}
      </div>

      <div className="p-4 bg-ocean-800/50 border-t border-white/10">
        <button className="w-full py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg text-sm font-bold hover:bg-accent/20 transition-all flex items-center justify-center gap-2">
          <Ship className="w-4 h-4" />
          ADD NEW VESSEL
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
