import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Play, Pause, Activity, Wind, Anchor, Clock, Map as MapIcon, ShieldAlert } from 'lucide-react';
import Vessel3D from '../components/sim/Vessel3D';
import { motion } from 'framer-motion';

const HudStat = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-4 glass p-4 px-6 border border-white/5 w-64 rounded-2xl shadow-xl">
    <div className={`${color} bg-white/5 p-3 rounded-xl`}>{icon}</div>
    <div>
      <div className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-mono mb-1">{label}</div>
      <div className={`text-base font-mono font-bold ${color} tracking-widest`}>{value}</div>
    </div>
  </div>
);

const DigitalTwin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const vessel = useStore(state => state.vessels).find(v => v.id === id);
  const [playState, setPlayState] = useState('PLAYING');

  const predictions = [...Array(20)].map((_, i) => {
    const hour = i + 1;
    let risk = 'SAFE';
    let prediction = 'OPTIMAL_NAVIGATION';
    let solution = 'Maintain current course and speed.';
    
    if (hour === 4) {
      risk = 'WARNING';
      prediction = 'HEAVY_SEA_STATE';
      solution = 'Reduce speed by 2 knots; secure deck cargo.';
    } else if (hour === 12) {
      risk = 'CRITICAL';
      prediction = 'TRAFFIC_CONVERGENCE';
      solution = 'Execute course adjustment to 290°; alert bridge crew.';
    } else if (hour === 18) {
      risk = 'WARNING';
      prediction = 'VISIBILITY_REDUCTION';
      solution = 'Activate extra lighting; continuous radar monitoring.';
    }

    return { 
        hour, 
        risk, 
        prediction, 
        solution, 
        lat: (vessel?.lat || 15) + (i * 0.1), 
        lng: (vessel?.lng || 75) + (i * 0.15) 
    };
  });

  return (
    <div className="w-screen h-screen flex flex-col bg-[#060d1a] text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 glass z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(`/vessel/${id}`)} className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white border border-white/5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="font-display font-bold text-xl tracking-[0.2em] text-white uppercase flex items-center gap-3">
               {vessel?.name || 'SIMULATION_CORE'} <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 rounded text-[10px] text-accent tracking-widest font-mono">TWIN_ACTIVE</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 py-1.5 px-4 glass border border-white/10 rounded-lg">
           <Clock className="text-accent" size={14} />
           <span className="text-xs font-mono text-white tracking-widest uppercase">T+ 00:00:00</span>
        </div>
      </header>

      {/* Main Simulation Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: 3D Visualization */}
        <div className="flex-1 relative border-r border-white/5 bg-[#080f1d]">
           <Vessel3D vessel={vessel} />
           
           {/* HUD Overlays */}
           <div className="absolute top-6 left-6 space-y-3 pointer-events-none">
              <HudStat icon={<Wind size={14}/>} label="Wind Vector" value="18.5 kn" color="text-warning" />
              <HudStat icon={<Activity size={14}/>} label="Hull Stress" value="12.4 MPa" color="text-safe" />
              <HudStat icon={<Anchor size={14}/>} label="Sea State" value="0.85 η" color="text-white" />
           </div>

           <div className="absolute top-6 right-6 space-y-3 text-right flex flex-col items-end pointer-events-none">
              <div className="glass p-4 border border-white/10 w-48 rounded-xl shadow-2xl">
                 <h4 className="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-mono">Projected Speed</h4>
                 <div className="text-2xl font-mono font-bold text-accent">{vessel?.sog || '15.5'} <span className="text-xs font-normal text-white/40">kn</span></div>
              </div>
              <div className="glass p-4 border border-white/10 w-48 rounded-xl shadow-2xl">
                 <h4 className="text-[9px] text-white/40 uppercase tracking-widest mb-1 font-mono">Efficiency</h4>
                 <div className="text-2xl font-mono font-bold text-safe">96.8 <span className="text-xs font-normal text-white/40">%</span></div>
              </div>
           </div>

           {/* Prediction Alert Overlay (Low profile) */}
           <div className="absolute bottom-6 left-6 right-6 flex gap-4 pointer-events-none">
              <div className="flex-1 glass border border-white/10 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <ShieldAlert className="text-critical animate-pulse" />
                    <div>
                       <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Stochastic Risk Detected at T+12H</p>
                       <p className="text-sm font-bold text-white">Major Traffic Convergence in Navigation Corridor</p>
                    </div>
                 </div>
                 <button className="px-4 py-2 bg-critical/20 text-critical border border-critical/30 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-auto hover:bg-critical/30 transition-all">VIEW_REMEDY_PATH</button>
              </div>
           </div>
        </div>

        {/* Right Side: Prediction Timeline */}
        <div className="w-[450px] flex flex-col bg-[#050b16] glass shadow-2xl z-10 border-l border-white/10 relative">
          <div className="absolute top-0 left-0 right-0 p-6 border-b border-white/10 flex items-center justify-between bg-white/2 z-20 glass">
            <div>
              <h2 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Temporal Prediction Matrix</h2>
              <p className="text-[8px] text-white/30 uppercase tracking-widest font-mono mt-1">20-Hour Stochastic Projection Loop</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPlayState('PAUSED')}
                className={`p-2 rounded-lg transition-colors ${playState === 'PAUSED' ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white'}`}
              >
                <Pause size={14} />
              </button>
              <button 
                onClick={() => setPlayState('PLAYING')}
                className={`p-2 rounded-lg transition-colors ${playState === 'PLAYING' ? 'bg-accent/20 text-accent' : 'text-white/40 hover:text-white'}`}
              >
                <Play size={14} />
              </button>
            </div>
          </div>
          
          <div className="mt-20 flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 h-full">
             {predictions.map((p, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative p-5 rounded-2xl border transition-all hover:bg-white/[0.03] cursor-pointer group ${
                    p.risk === 'CRITICAL' ? 'border-critical/30 bg-critical/[0.02]' : 
                    p.risk === 'WARNING' ? 'border-warning/30 bg-warning/[0.02]' : 
                    'border-white/5 bg-white/[0.01]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono text-[10px] font-bold ${
                        p.risk === 'CRITICAL' ? 'bg-critical/20 text-critical' : 
                        p.risk === 'WARNING' ? 'bg-warning/20 text-warning' : 
                        'bg-accent/20 text-accent'
                      }`}>
                        T+{p.hour}H
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider">{p.prediction.replace('_', ' ')}</div>
                        <div className="text-[8px] text-white/40 font-mono">LAT: {p.lat.toFixed(4)}° / LNG: {p.lng.toFixed(4)}°</div>
                      </div>
                    </div>
                    <div className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                      p.risk === 'CRITICAL' ? 'bg-critical text-white' : 
                      p.risk === 'WARNING' ? 'bg-warning text-black' : 
                      'bg-safe/20 text-safe border border-safe/30'
                    }`}>
                      {p.risk}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-white/40 uppercase mb-1 font-bold tracking-widest">Recommended Action</p>
                      <p className="text-[11px] text-white/80 leading-relaxed italic">{p.solution}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="w-1/2 h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(20, 100 - (i * 4))}%` }}
                            className={`h-full ${p.risk === 'CRITICAL' ? 'bg-critical' : 'bg-accent'}`}
                          />
                       </div>
                       <span className="text-[9px] text-white/40 font-mono">Confidence {(100 - i * 2.5).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Vertical Line Connector */}
                  {i < predictions.length - 1 && (
                    <div className="absolute -bottom-4 left-9 w-px h-4 bg-white/10" />
                  )}
                </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
