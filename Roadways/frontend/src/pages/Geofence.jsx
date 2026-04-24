import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Map as MapIcon, Shield, Anchor, Factory, Eye, Trash2, Settings, Triangle, Circle, Minus } from 'lucide-react';
import { HUDNavbar } from './Overview';

const ZONES = [
  { name: 'JNPT Port Boundary',    type: 'PORT',        vehicles: 4,  icon: Anchor,  status: 'ACTIVE',   color: '#00e5ff' },
  { name: 'Manesar Industrial Hub', type: 'INDUSTRIAL',  vehicles: 8,  icon: Factory, status: 'ACTIVE',   color: '#22c55e' },
  { name: 'Kolkata ICD Area',       type: 'LOGISTICS',   vehicles: 2,  icon: MapIcon, status: 'WARNING',  color: '#facc15' },
  { name: 'MH-GJ Border Zone',      type: 'BORDER',      vehicles: 12, icon: Shield,  status: 'BREACH',   color: '#dc2626' },
];

const DRAW_TOOLS = [
  { id: 'POLY',     icon: Triangle, label: 'Polygon' },
  { id: 'CIRCLE',   icon: Circle,   label: 'Radius' },
  { id: 'CORRIDOR', icon: Minus,    label: 'Corridor' },
];

const STATUS_CFG = {
  ACTIVE:  { color: '#22c55e', label: 'MONITORING' },
  WARNING: { color: '#facc15', label: 'WARNING'    },
  BREACH:  { color: '#dc2626', label: 'BREACH'     },
};

function ZoneCard({ z, active, onClick }) {
  const sc = STATUS_CFG[z.status] || STATUS_CFG.ACTIVE;
  const Icon = z.icon;
  return (
    <motion.div
      whileHover={{ borderColor: z.color + '80', boxShadow: `0 0 16px ${z.color}20` }}
      onClick={onClick}
      className={`p-3.5 rounded-xl border cursor-pointer relative overflow-hidden ${active ? 'border-accent/60' : 'border-accent/10'}`}
      style={{ background: active ? `${z.color}08` : 'rgba(5,7,15,0.6)', borderColor: z.color + '20', boxShadow: '0 0 0px rgba(0,0,0,0)' }}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: z.color }} />}
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg mt-0.5 flex-shrink-0" style={{ background: z.color + '15', border: `1px solid ${z.color}30` }}>
          <Icon size={13} style={{ color: z.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-hud text-[11px] font-semibold text-accent/90 tracking-wide truncate">{z.name}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-[8px] uppercase tracking-wide" style={{ color: z.color + '70' }}>{z.type} ZONE</span>
            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ color: sc.color, background: sc.color + '15', border: `1px solid ${sc.color}30` }}>
              <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
              {sc.label}
            </span>
          </div>
          <div className="font-data text-[9px] text-accent/40 mt-1">{z.vehicles} vehicles inside</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Geofence() {
  const navigate = useNavigate();
  const [activeZone, setActiveZone] = useState(0);
  const [drawTool, setDrawTool]     = useState(null);

  const ActiveIcon = ZONES[activeZone].icon;

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <HUDNavbar activeRoute="/geofence" />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 22 }}
          className="w-72 flex flex-col border-r border-accent/10 overflow-hidden"
          style={{ background: 'rgba(5,7,15,0.88)', backdropFilter: 'blur(12px)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-accent/10 flex items-center justify-between">
            <div>
              <div className="font-hud text-sm font-bold text-accent tracking-widest">GEOFENCE CTRL</div>
              <div className="font-mono text-[8px] text-accent/40 uppercase mt-0.5">Virtual Boundary Management</div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-hud text-[10px] font-semibold tracking-wide uppercase border transition-all text-accent border-accent/40 hover:bg-accent/8 hover:border-accent/60"
              style={{ background: 'rgba(0,229,255,0.06)' }}>
              <Plus size={10} /> New Zone
            </motion.button>
          </div>

          {/* Zone list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="font-mono text-[8px] text-accent/30 uppercase tracking-widest px-1 mb-2">Active Boundaries — {ZONES.length}</div>
            {ZONES.map((z, i) => (
              <ZoneCard key={z.name} z={z} active={activeZone === i} onClick={() => setActiveZone(i)} />
            ))}
          </div>

          {/* Stats */}
          <div className="p-3 border-t border-accent/10 grid grid-cols-2 gap-2">
            {[
              { label: 'Total Zones', value: ZONES.length, color: '#00e5ff' },
              { label: 'Breaching',   value: ZONES.filter(z=>z.status==='BREACH').length, color: '#dc2626' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-dark rounded-lg px-3 py-2 text-center">
                <div className="font-data text-base font-bold" style={{ color, textShadow: `0 0 10px ${color}88` }}>{value}</div>
                <div className="font-mono text-[8px] text-accent/30 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Map canvas */}
        <div className="flex-1 relative bg-bg-primary overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 70%)' }} />

          {/* HUD grid */}
          <div className="absolute inset-0 hud-grid pointer-events-none opacity-60" />

          {/* Radar sweep display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[320,240,160,80].map(r => (
              <div key={r} style={{ width: r, height: r }}
                className="absolute rounded-full border border-accent/6" />
            ))}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute w-80 h-80 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,229,255,0.07) 360deg)' }}
            />
          </div>

          {/* Zone overlay visual */}
          <AnimatePresence mode="wait">
            <motion.div key={activeZone}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ boxShadow: [`0 0 60px ${(ZONES[activeZone].color || '#00e5ff')}15`, `0 0 120px ${(ZONES[activeZone].color || '#00e5ff')}25`, `0 0 60px ${(ZONES[activeZone].color || '#00e5ff')}15`] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-48 h-48 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: (ZONES[activeZone].color || '#00e5ff') + '50', background: (ZONES[activeZone].color || '#00e5ff') + '06' }}
              >
                <div className="text-center">
                  <ActiveIcon size={36} style={{ color: ZONES[activeZone].color, opacity: 0.7, margin: '0 auto' }} />
                  <div className="font-hud text-[10px] font-bold tracking-widest uppercase mt-2"
                    style={{ color: ZONES[activeZone].color }}>{ZONES[activeZone].type}</div>
                  <div className="font-data text-[9px] text-accent/40">{ZONES[activeZone].vehicles} vehicles</div>
                </div>
              </motion.div>

              {/* Pulse rings */}
              {[1,2,3].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 1 + i * 0.4], opacity: [0.3, 0] }}
                  transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity }}
                  className="absolute w-48 h-48 rounded-full border"
                  style={{ borderColor: ZONES[activeZone].color + '60' }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Zone label HUD overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="absolute top-4 left-4 glass-dark rounded-xl px-4 py-3 border border-accent/20">
            <div className="font-hud text-xs font-bold text-accent tracking-widest">{ZONES[activeZone].name}</div>
            <div className="font-mono text-[8px] text-accent/40 uppercase mt-0.5">{ZONES[activeZone].type} Zone · India Grid Ref: 24.5N-78.2E</div>
          </motion.div>

          {/* Draw tools */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5">
            <div className="font-mono text-[8px] text-accent/30 uppercase tracking-widest text-center mb-1">Draw Tools</div>
            {DRAW_TOOLS.map(({ id, icon: Icon, label }) => (
              <motion.button key={id}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setDrawTool(d => d === id ? null : id)}
                className="w-10 h-10 rounded-lg border flex flex-col items-center justify-center group"
                style={drawTool === id
                  ? { background: 'rgba(0,229,255,0.15)', borderColor: 'rgba(0,229,255,0.5)', boxShadow: '0 0 12px rgba(0,229,255,0.3)' }
                  : { background: 'rgba(5,7,15,0.9)', borderColor: 'rgba(0,229,255,0.15)', boxShadow: '0 0 0px rgba(0,0,0,0)' }}>
                <Icon size={12} className={drawTool === id ? 'text-accent' : 'text-accent/40 group-hover:text-accent transition-colors'} />
                <span className={`font-mono text-[6px] uppercase mt-0.5 ${drawTool === id ? 'text-accent' : 'text-accent/30 group-hover:text-accent/60'}`}>{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Bottom status */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 rounded-xl border border-accent/15"
            style={{ background: 'rgba(5,7,15,0.88)', backdropFilter: 'blur(8px)' }}>
            <span className="font-data text-[10px] text-accent/50">
              {drawTool ? `DRAW MODE: ${drawTool} — Click map to place points` : 'Select a zone or use draw tools to define boundaries'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
              <span className="font-mono text-[8px] text-safe/70 uppercase">Boundary Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
