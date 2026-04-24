import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, AlertTriangle, Shield, Download, CloudRain, Cpu } from 'lucide-react';
import axios from 'axios';

export default function EventsPrediction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const eRes = await axios.get(`http://localhost:6001/api/trips/${id}/events`);
        setEvents(eRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [id]);

  const sevs = { CRITICAL: '#dc2626', HIGH: '#f97316', MODERATE: '#facc15', LOW: '#22c55e' };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden text-text-primary">
      <motion.div
        initial={{ y: -56 }} animate={{ y: 0 }}
        className="h-14 flex items-center justify-between px-5 border-b border-accent/12 z-30"
        style={{ background: 'rgba(5,7,15,0.94)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg border border-accent/15 hover:border-accent/40 hover:bg-accent/5 text-accent/40 hover:text-accent transition-all">
            <ArrowLeft size={14} />
          </button>
          <div className="font-hud text-sm font-bold text-accent tracking-widest uppercase">
            Events Prediction Timeline
          </div>
        </div>
        <button onClick={() => window.open(`http://localhost:6001/api/vehicles/${id}/report`, '_blank')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent/15 hover:border-accent/40 text-accent/50 hover:text-accent font-hud text-[10px] uppercase">
          <Download size={11} /> Export PDF
        </button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-hud text-xl text-accent/80 tracking-widest uppercase">40-Hour Voyage Forecast</h2>
          <div className="flex gap-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-accent/10 font-mono text-[9px] uppercase"><CloudRain size={10} className="text-info"/> Weather</span>
            <span className="flex items-center gap-2 px-3 py-1 rounded bg-bg-tertiary border border-accent/10 font-mono text-[9px] uppercase"><Shield size={10} className="text-warning"/> Security</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {events.length > 0 ? events.map((ev, i) => {
            const c = sevs[ev.severity] || '#00e5ff';
            return (
              <motion.div key={ev.id || i}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border"
                style={{ borderColor: c + '40', background: c + '05', boxShadow: `0 4px 20px ${c}10` }}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c + '15', border: `1px solid ${c}40` }}>
                    <AlertTriangle size={20} style={{ color: c }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-hud text-sm font-bold tracking-wide" style={{ color: c }}>{ev.title}</div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-accent/50">
                        <Clock size={10} /> In {i * 2 + 1} hours
                      </div>
                    </div>
                    <p className="font-data text-xs text-accent/70 leading-relaxed mb-4">{ev.description}</p>
                    <div className="flex gap-4 text-[9px] font-mono uppercase tracking-wider text-accent/40 border-t border-accent/10 pt-3">
                      <span className="flex items-center gap-1.5"><MapPin size={10} /> {Math.round(ev.lat*100)/100}, {Math.round(ev.lng*100)/100}</span>
                      <span className="flex items-center gap-1.5"><Cpu size={10} /> Agent Confidence: {Math.round((ev.confidence_score||1) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
             <div className="py-20 text-center border border-dashed border-accent/20 rounded-2xl font-mono text-accent/40 uppercase tracking-widest text-xs">
                Analyzing temporal probabilities...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
