import React from 'react';
import { useStore } from '../../store/useStore';
import { Activity, Bell, Ship } from 'lucide-react';

const Header = () => {
  const { activeTab, setActiveTab, vessels } = useStore();
  const alertCount = vessels.reduce((acc, v) => acc + (v.alerts?.filter(a => !a.acknowledged).length || 0), 0);

  return (
    <header className="h-16 bg-ocean-900 border-b border-white/10 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Ship className="text-accent w-8 h-8" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-safe">
            SEAWAYS
          </h1>
        </div>
        <div className="h-4 w-[1px] bg-white/20 mx-2" />
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`px-4 py-1 rounded-md text-sm transition-all ${activeTab === 'LIVE' ? 'bg-accent/20 text-accent font-bold neon-border' : 'text-white/60 hover:text-white'}`}
          >
            LIVE TRACK
          </button>
          <button
            onClick={() => setActiveTab('TWIN')}
            className={`px-4 py-1 rounded-md text-sm transition-all ${activeTab === 'TWIN' ? 'bg-accent/20 text-accent font-bold neon-border' : 'text-white/60 hover:text-white'}`}
          >
            DIGITAL TWIN ✦
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/40 font-mono">SYSTEM STATUS</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-safe font-bold">OPERATIONAL</span>
            <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          </div>
        </div>

        <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-white/80" />
          {alertCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-danger rounded-full text-[10px] flex items-center justify-center font-bold">
              {alertCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right">
            <p className="text-xs font-bold">L. MANAGER</p>
            <p className="text-[10px] text-white/40">DEMO MODE</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-700 to-ocean-800 border border-white/10 flex items-center justify-center font-bold text-accent">
            DR
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
