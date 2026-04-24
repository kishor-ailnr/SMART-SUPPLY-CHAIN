import React from 'react';
import { useStore } from '../../store/useStore';
import { Download, AlertTriangle, Wind, Waves, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VesselDetails = () => {
  const { selectedVesselId, vessels } = useStore();
  const vessel = vessels.find(v => v.vesselId === selectedVesselId);

  if (!vessel) return null;

  const progress = (vessel.crossedWaypoints?.length || 0) / (vessel.confirmedRoute?.length || 1) * 100;

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="h-full flex flex-col glass-panel overflow-hidden border-white/5"
    >
      {/* Identity */}
      <div className="p-6 bg-gradient-to-br from-ocean-800 to-ocean-900 border-b border-white/10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] text-accent font-bold tracking-[0.2em] uppercase">Vessel Registry</span>
            <h2 className="text-2xl font-bold">{vessel.name}</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40">IMO {vessel.imo}</span>
              <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40">MMSI {vessel.mmsi}</span>
            </div>
          </div>
          <div className="bg-safe/20 border border-safe/40 p-1 rounded-lg">
            <div className="w-8 h-5 bg-blue-900 rounded-sm flex items-center justify-center text-[10px] font-bold">GB</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-white/40 italic">
            <span>{vessel.startPort?.name}</span>
            <span>{vessel.endPort?.name}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_10px_#00f5d4]" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-accent">
            <span>START</span>
            <span>{progress.toFixed(0)}% COMPLETE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Risk / Delay Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border ${vessel.riskLevel === 'CRITICAL' ? 'border-danger/30 bg-danger/5' : 'border-safe/30 bg-safe/5'}`}>
            <p className="text-[10px] text-white/40 mb-1">RISK STATUS</p>
            <p className={`font-bold ${vessel.riskLevel === 'CRITICAL' ? 'text-danger' : 'text-safe'}`}>{vessel.riskLevel}</p>
          </div>
          <div className={`p-3 rounded-lg border ${vessel.delayHours > 0 ? 'border-warning/30 bg-warning/5' : 'border-safe/30 bg-safe/5'}`}>
            <p className="text-[10px] text-white/40 mb-1">ETA STATUS</p>
            <p className={`font-bold ${vessel.delayHours > 0 ? 'text-warning' : 'text-safe'}`}>
              {vessel.delayHours > 0 ? `+${vessel.delayHours}H DELAY` : 'ON TIME'}
            </p>
          </div>
        </div>

        {/* Forecast / Weather */}
        <div>
          <h4 className="text-xs font-bold text-white/60 mb-3 flex items-center gap-2">
            <Wind className="w-3 h-3" /> NEXT CHECKPOINT METEO
          </h4>
          <div className="glass-panel p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Waves className="w-4 h-4 text-accent" />
              <div>
                <p className="text-[10px] text-white/40">WAVE HEIGHT</p>
                <p className="text-sm font-mono font-bold">1.8m</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wind className="w-4 h-4 text-accent" />
              <div>
                <p className="text-[10px] text-white/40">WIND SPEED</p>
                <p className="text-sm font-mono font-bold">22 kn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert History */}
        <div>
          <h4 className="text-xs font-bold text-white/60 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> ACTIVE ALERTS
          </h4>
          <div className="space-y-2">
            {vessel.alerts?.length > 0 ? vessel.alerts.map(alert => (
              <div key={alert.id} className="p-3 bg-white/5 border border-white/10 rounded group">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-white/90">{alert.message}</p>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-[10px] text-white/40 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-xs text-white/20 italic italic">No active alerts recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 bg-ocean-900 border-t border-white/10 flex gap-3">
        <button className="flex-1 py-2 bg-accent text-ocean-900 rounded font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          DOWNLOAD TRIP REPORT
        </button>
        <button className="p-2 border border-white/20 rounded hover:bg-white/5 transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default VesselDetails;
