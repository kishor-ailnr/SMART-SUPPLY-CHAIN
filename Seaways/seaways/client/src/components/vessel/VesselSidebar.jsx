import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Info, MapPin, AlertTriangle, FileText, ChevronRight, CheckCircle, Clock } from 'lucide-react';

const VesselSidebar = ({ vessel }) => {
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button 
        onClick={() => setCollapsed(false)}
        className="absolute top-1/2 right-0 -translate-y-1/2 bg-ocean-800 border border-white/10 p-2 rounded-l-xl z-50 text-white/50 hover:text-white"
      >
        <ChevronRight className="w-6 h-6 rotate-180" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 bottom-24 w-[450px] glass-panel bg-ocean-800/90 flex flex-col z-40 transition-all border border-white/10 overflow-hidden shadow-2xl">
      <div className="flex bg-ocean-900 border-b border-white/10 relative">
        <button onClick={() => setCollapsed(true)} className="absolute -left-10 top-1/2 -translate-y-1/2 bg-ocean-900 p-2 rounded-l z-50 hover:text-accent">
          <ChevronRight className="w-5 h-5" />
        </button>
        {['DETAILS', 'VOYAGE', 'RISKS', 'DOCS'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest ${activeTab === tab ? 'text-accent border-b-2 border-accent bg-accent/10' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            {tab === 'DETAILS' && <Info className="w-4 h-4 mx-auto mb-1" />}
            {tab === 'VOYAGE' && <MapPin className="w-4 h-4 mx-auto mb-1" />}
            {tab === 'RISKS' && <AlertTriangle className="w-4 h-4 mx-auto mb-1" />}
            {tab === 'DOCS' && <FileText className="w-4 h-4 mx-auto mb-1" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'DETAILS' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-ocean-900 border border-white/10 rounded flex items-center justify-center shrink-0 overflow-hidden">
                 <img src={`https://images.unsplash.com/photo-1574581137091-c116c68bda91?auto=format&fit=crop&q=80&w=200`} alt="Vessel" className="w-full h-full object-cover opacity-80" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase text-white font-rajdhani tracking-wider">{vessel?.name || 'UNKNOWN VESSEL'}</h3>
                <p className="text-xs text-white/50 font-mono mt-1">IMO 9876543 | MMSI 234567890</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/20">OIL TANKER</span>
                  <span className="text-[10px] bg-ocean-700 text-white/70 px-2 py-0.5 rounded border border-white/10">PANAMA FLAG</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-3 bg-ocean-900/50">
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Speed</p>
                <p className="text-sm font-mono text-white mt-1">{vessel?.speed} kn <span className="text-accent">▲</span></p>
              </div>
              <div className="glass-panel p-3 bg-ocean-900/50">
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Heading</p>
                <p className="text-sm font-mono text-white mt-1">{vessel?.heading}°</p>
              </div>
              <div className="glass-panel p-3 bg-ocean-900/50">
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Destination</p>
                <p className="text-sm font-mono text-amber mt-1 truncate">{vessel?.endPort?.name}</p>
              </div>
              <div className="glass-panel p-3 bg-ocean-900/50">
                <p className="text-[9px] text-white/40 uppercase tracking-widest">ETA</p>
                <p className="text-sm font-mono text-white mt-1">T+14h 30m</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/10 pb-2">Vessel Particulars</h4>
              <div className="grid grid-cols-2 gap-y-2 text-xs font-mono">
                <span className="text-white/40">DWT</span><span className="text-right">150,000 t</span>
                <span className="text-white/40">GRT</span><span className="text-right">80,000 t</span>
                <span className="text-white/40">LOA</span><span className="text-right">274 m</span>
                <span className="text-white/40">Draft</span><span className="text-right">14.5 m</span>
                <span className="text-white/40">Built</span><span className="text-right">2018</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'VOYAGE' && (
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-accent uppercase tracking-widest border-b border-white/10 pb-2">Checkpoint Progression</h4>
             <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-safe before:via-amber before:to-ocean-700">
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="absolute -left-8 w-5 h-5 rounded-full bg-safe border-4 border-ocean-900 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-ocean-900" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase">{vessel?.startPort?.name || 'Origin'}</h5>
                    <p className="text-[10px] text-white/40 font-mono">Passed 12h ago · Wind 12kn</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="absolute -left-8 w-5 h-5 rounded-full bg-amber border-4 border-ocean-900 flex items-center justify-center animate-pulse">
                    <Clock className="w-3 h-3 text-ocean-900" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase text-amber">Current Position</h5>
                    <p className="text-[10px] text-white/40 font-mono">{vessel?.lat.toFixed(4)}, {vessel?.lng.toFixed(4)}</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between opacity-50">
                  <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-ocean-700 border-2 border-white/20"></div>
                  <div>
                    <h5 className="text-xs font-bold uppercase">Strait Checkpoint</h5>
                    <p className="text-[10px] text-white/40 font-mono">ETA: 4h · Flow 3kn</p>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between opacity-50">
                  <div className="absolute -left-[30px] w-4 h-4 rounded-full bg-ocean-700 border-2 border-white/20"></div>
                  <div>
                    <h5 className="text-xs font-bold uppercase">{vessel?.endPort?.name || 'Destination'}</h5>
                    <p className="text-[10px] text-white/40 font-mono">ETA: 14h 30m</p>
                  </div>
                </div>

             </div>
          </div>
        )}

        {activeTab === 'RISKS' && (
          <div className="space-y-6">
            <div className="text-center bg-ocean-900 p-6 border border-white/10 rounded">
               <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Overall Risk Index</h4>
               <div className="text-5xl font-mono font-bold text-amber mb-2">64<span className="text-xl text-white/30">/100</span></div>
               <p className="text-xs text-amber font-bold tracking-widest uppercase">ELEVATED</p>
            </div>

            <div className="space-y-3">
              <div className="bg-danger/10 border border-danger/30 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <h5 className="text-xs font-bold text-danger uppercase tracking-wider">Squall Predicted</h5>
                </div>
                <p className="text-[10px] text-white/70">T+8h: Heavy crosswinds (35kn) and 4m swell predicted along Route Segment C.</p>
              </div>

              <div className="bg-warning/10 border border-warning/30 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h5 className="text-xs font-bold text-warning uppercase tracking-wider">Congestion at Destination</h5>
                </div>
                <p className="text-[10px] text-white/70">Current wait time at {vessel?.endPort?.name || 'destination'} is 18 hours. Reduce speed by 2kn to optimize fuel.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Immutable Log</h4>
            {['Bill of Lading #49281', 'Customs Manifest', 'Fuel Quality Cert', 'Port State Inspection'].map((doc, i) => (
              <div key={i} className="flex items-center justify-between bg-ocean-900/50 p-3 border border-white/10 rounded group cursor-pointer hover:border-accent/40">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-accent" />
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-accent transition-colors">{doc}</h5>
                    <p className="text-[8px] font-mono text-white/40 mt-1">Hash: 0x8f...{Math.floor(Math.random()*10000)}</p>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-safe" />
              </div>
            ))}
            <div className="mt-4 text-center">
              <span className="text-[9px] uppercase tracking-widest text-white/30 border border-white/10 px-2 py-1 rounded">Polygon Mumbai Testnet Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselSidebar;
