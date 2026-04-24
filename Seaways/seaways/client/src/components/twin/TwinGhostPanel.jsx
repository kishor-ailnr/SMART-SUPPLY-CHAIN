import React from 'react';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ShieldAlert, Zap } from 'lucide-react';

const TwinGhostPanel = () => {
  const { selectedVesselId, twinSimulations, vessels } = useStore();
  const vessel = vessels.find(v => v.vesselId === selectedVesselId);
  const sim = twinSimulations[selectedVesselId];

  if (!vessel) return null;

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-full flex flex-col glass-panel overflow-hidden border-accent/20"
    >
      <div className="p-6 border-b border-white/10 bg-accent/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          DIGITAL TWIN ANALYSIS
        </h2>
        <p className="text-[10px] text-white/40 mt-1">SIMULATION ENGINE: v4.2 PROJECTION ACTIVE</p>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {sim ? (
          <>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[10px] text-white/40 uppercase font-mono">Simulated Arrival</p>
              <p className="text-lg font-mono font-bold text-accent">{new Date(sim.predictedETA).toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/60">SIMULATION SUMMARY</h4>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-accent/30 flex items-center justify-center font-bold text-accent">
                  48h
                </div>
                <div>
                  <p className="text-xs font-bold">Horizon Windows</p>
                  <p className="text-[10px] text-white/40">Continuously calculating every 5 mins</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold ${
                  sim.simulatedPath.some(s => s.danger === 'CRITICAL') ? 'border-danger text-danger' : 'border-safe text-safe'
                }`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold">Integrity Shield</p>
                  <p className="text-[10px] text-white/40">
                    {sim.simulatedPath.some(s => s.danger === 'CRITICAL') 
                      ? 'DANGER DETECTED IN PROJECTION' 
                      : 'NO CRITICAL THREATS IN MISSION PATH'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-3 bg-accent/10 border border-accent/30 rounded-lg text-accent text-xs font-bold hover:bg-accent/20 transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                RERUN SIMULATION
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
            <Play className="w-12 h-12" />
            <p className="text-xs font-bold tracking-widest">INITIALIZING PROJECTOR...</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-ocean-900 border-t border-white/10">
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] italic text-blue-400">
          "The digital twin operates 5 minutes ahead of real-time AIS data to identify and flag potential risks before they manifest locally."
        </div>
      </div>
    </motion.div>
  );
};

export default TwinGhostPanel;
