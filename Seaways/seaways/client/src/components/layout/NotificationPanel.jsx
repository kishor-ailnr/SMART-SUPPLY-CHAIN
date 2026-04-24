import React from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, Info, X } from 'lucide-react';

const NotificationPanel = () => {
  const { vessels } = useStore();
  
  // Flatten all unacknowledged alerts from all vessels
  const alerts = vessels.flatMap(v => v.alerts || [])
    .filter(a => !a.acknowledged)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 w-80 z-[100]">
      <AnimatePresence>
        {alerts.slice(0, 5).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 rounded-xl glass-panel border-l-4 shadow-2xl flex gap-3 ${
              alert.severity === 'CRITICAL' ? 'border-danger' : 
              alert.severity === 'HIGH' ? 'border-orange-500' : 'border-warning'
            }`}
          >
            <div className={`mt-1 ${
              alert.severity === 'CRITICAL' ? 'text-danger' : 
              alert.severity === 'HIGH' ? 'text-orange-500' : 'text-warning'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold">{alert.vesselName}</h4>
                <span className="text-[10px] text-white/40">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-snug">{alert.message}</p>
              
              <div className="flex gap-2 mt-3">
                <button className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-all">
                  ACKNOWLEDGE
                </button>
              </div>
            </div>
            
            <button className="text-white/20 hover:text-white transition-colors self-start">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
