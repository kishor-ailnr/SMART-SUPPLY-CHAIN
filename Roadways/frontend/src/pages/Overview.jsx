import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Bell, User, AlertTriangle, Clock,
  Map as MapIcon, Activity, Database, Zap, TrendingUp,
  Truck, Radio, Shield, ChevronRight, Navigation2
} from 'lucide-react';
import useStore from '../store/useStore';
import GlobalMap from '../components/GlobalMap';

/* ── Shared Navbar ── */
export function HUDNavbar({ activeRoute }) {
  const navigate = useNavigate();
  const { alerts, user } = useStore();
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const NAV = [
    { label: 'OVERVIEW',    path: '/overview' },
    { label: 'ANALYTICS',   path: '/analytics' },
    { label: 'GEOFENCE',    path: '/geofence' },
  ];

  return (
    <motion.header
      initial={{ y: -64 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="h-14 flex items-center justify-between px-6 z-30 relative border-b border-accent/15"
      style={{ background: 'rgba(5,7,15,0.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => navigate('/overview')}>
          <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/40 flex items-center justify-center"
            style={{ boxShadow: '0 0 12px rgba(0,229,255,0.3)' }}>
            <Truck size={15} className="text-accent" />
          </div>
          <span className="font-hud font-bold text-lg tracking-widest text-accent"
            style={{ textShadow: '0 0 12px rgba(0,229,255,0.4)' }}>ROADWAYS 2.0</span>
        </motion.div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ label, path }) => {
            const active = activeRoute === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`px-3 py-1.5 rounded font-mono text-[10px] tracking-widest uppercase transition-all ${
                  active
                    ? 'text-accent bg-accent/10 border border-accent/30'
                    : 'text-accent/50 hover:text-accent hover:bg-accent/5'
                }`}>
                {label}
              </button>
            );
          })}
        </nav>
        
        <button onClick={() => window.location.href = 'http://localhost:5000'}
          className="ml-4 px-3 py-1.5 rounded font-mono text-[10px] tracking-widest uppercase transition-all text-accent/50 hover:text-accent hover:bg-accent/5 border border-accent/15">
          Back to Nexus Hub
        </button>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="font-data text-[11px] text-accent tracking-widest">{time} IST</span>
          <span className="font-mono text-[8px] text-safe flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
            ALL SYSTEMS NOMINAL
          </span>
        </div>

        {/* Alerts bell */}
        <motion.div whileHover={{ scale: 1.1 }} className="relative cursor-pointer text-accent/60 hover:text-accent transition-colors">
          <Bell size={16} />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-critical animate-pulse" />
          )}
        </motion.div>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-accent/15 pl-4">
          <div className="text-right">
            <div className="font-hud text-[11px] font-semibold text-accent/90">{user.name}</div>
            <div className="font-mono text-[8px] text-accent/40 uppercase">{user.role}</div>
          </div>
          <motion.div whileHover={{ boxShadow: '0 0 14px rgba(0,229,255,0.5)', borderColor: 'rgba(0,229,255,0.6)' }}
            className="w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(0,229,255,0.05)', borderColor: 'rgba(0,229,255,0.3)', boxShadow: '0 0 0px rgba(0,0,0,0)' }}>
            <User size={13} className="text-accent" />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

/* ── Status dot ── */
function StatusDot({ status }) {
  const conf = {
    MOVING:   { color: '#22c55e', label: 'MOVING' },
    IDLE:     { color: '#facc15', label: 'IDLE' },
    ALERT:    { color: '#dc2626', label: 'ALERT' },
    OFFLINE:  { color: 'rgba(0,229,255,0.3)', label: 'OFFLINE' },
  }[status] || { color: 'rgba(0,229,255,0.3)', label: status };

  return (
    <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border"
      style={{ color: conf.color, borderColor: conf.color + '50' }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: conf.color, boxShadow: `0 0 8px ${conf.color}` }} />
      {conf.label}
    </span>
  );
}

/* ── Vehicle sidebar card ── */
function VehicleCard({ v, idx, onClick }) {
  const status = v.last_speed > 0 ? 'MOVING' : 'IDLE';
  const statusColor = { MOVING: '#22c55e', IDLE: '#facc15' }[status];
  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.05 * idx + 0.2, type: 'spring', stiffness: 120 }}
      whileHover={{ borderColor: 'rgba(0,229,255,0.5)', boxShadow: '0 0 16px rgba(0,229,255,0.12)' }}
      onClick={onClick}
      className="mx-2 mb-2 p-3 rounded-lg cursor-pointer group relative overflow-hidden border"
      style={{ background: 'rgba(11,19,36,0.6)', borderColor: 'rgba(0,229,255,0.1)', boxShadow: '0 0 0px rgba(0,0,0,0)' }}
    >
      {/* hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/4 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

      <div className="flex justify-between items-start mb-2 relative">
        <div>
          <div className="font-hud font-bold text-[13px] text-accent group-hover:text-white transition-colors tracking-wide">
            {v.registration_number}
          </div>
          <div className="font-mono text-[9px] text-accent/50 mt-0.5">{v.vehicle_type} · {v.cargo_type}</div>
        </div>
        <span className="font-mono text-[8px] uppercase px-2 py-0.5 rounded-full border flex items-center gap-1"
          style={{ color: statusColor, borderColor: statusColor + '50', background: statusColor + '15' }}>
          {status === 'MOVING' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-data mt-1 relative">
        <span className="text-accent/50 flex items-center gap-1"><User size={8} className="text-accent/40" />{v.driver_name}</span>
        <span className="text-warning flex items-center gap-1"><Zap size={8} />{Math.round(v.last_speed)} km/h</span>
        <span className="text-accent/40 col-span-2 flex items-center gap-1"><Navigation2 size={8} />NH48 · Nashik, MH</span>
      </div>

      {/* Speed bar */}
      <div className="mt-2.5 h-px w-full bg-accent/10 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.min(v.last_speed / 120, 1) }}
          transition={{ duration: 0.8, delay: 0.1 * idx, ease: 'easeOut' }}
          style={{ transformOrigin: 'left', background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`, boxShadow: `0 0 6px ${statusColor}` }}
          className="h-full w-full rounded-full"
        />
      </div>
    </motion.div>
  );
}

/* ── Alert ticker item ── */
function AlertTicker({ alert }) {
  const sev = { HIGH: 'text-critical', MEDIUM: 'text-warning', LOW: 'text-safe' }[alert?.severity] || 'text-warning';
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex items-center gap-3 px-3 py-1 rounded-lg border border-warning/20 bg-warning/5 w-full"
    >
      <span className={`font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${sev} border border-current/30`}>
        {alert?.severity}
      </span>
      <span className="font-data text-[10px] text-accent/80 truncate flex-1">{alert?.title} — {alert?.description}</span>
      <span className="font-mono text-[8px] text-accent/40 shrink-0 flex items-center gap-1">
        <Clock size={8} />{new Date().toLocaleTimeString()}
      </span>
    </motion.div>
  );
}

/* ── KPI mini chip ── */
function KPIChip({ label, value, color }) {
  const colors = { accent:'#00e5ff', safe:'#22c55e', warning:'#facc15', danger:'#f97316' };
  const c = colors[color] || colors.accent;
  return (
    <div className="glass-dark px-4 py-2.5 rounded-lg flex flex-col items-center" style={{ borderColor: c + '30' }}>
      <span className="font-data text-lg font-bold" style={{ color: c, textShadow: `0 0 8px ${c}` }}>{value}</span>
      <span className="font-mono text-[8px] text-accent/40 uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function Overview() {
  const navigate = useNavigate();
  const { vehicles, alerts, mapMode, setMapMode } = useStore();
  const [search, setSearch] = useState('');
  const [currentAlert, setCurrentAlert] = useState(0);

  // Rotate alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const id = setInterval(() => setCurrentAlert(a => (a + 1) % alerts.length), 4000);
    return () => clearInterval(id);
  }, [alerts.length]);

  const filtered = vehicles.filter(v =>
    v.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
    v.driver_name?.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    { label: 'ACTIVE VEHICLES', value: vehicles.filter(v => v.last_speed > 0).length, color: 'safe' },
    { label: 'TOTAL FLEET',     value: vehicles.length, color: 'accent' },
    { label: 'ACTIVE ALERTS',   value: alerts.length, color: 'danger' },
    { label: 'AVG SPEED',       value: `${Math.round(vehicles.reduce((s,v) => s + (v.last_speed||0), 0) / Math.max(vehicles.length,1))} km/h`, color: 'warning' },
  ];

  const MAP_MODES = [
    { id: 'NH', icon: Activity, label: 'HIGHWAY' },
    { id: 'SATELLITE', icon: MapIcon, label: 'SATELLITE' },
    { id: 'WEATHER', icon: Zap, label: 'WEATHER' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <HUDNavbar activeRoute="/overview" />

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex items-center gap-3 px-6 py-2.5 border-b border-accent/10 overflow-x-auto"
        style={{ background: 'rgba(5,7,15,0.6)', backdropFilter: 'blur(8px)' }}
      >
        {kpis.map(k => <KPIChip key={k.label} {...k} />)}
        <div className="h-8 w-px bg-accent/10 mx-2" />
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="font-mono text-[9px] text-safe uppercase tracking-widest">Live Feed Active</span>
        </div>
      </motion.div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left sidebar ── */}
        <motion.aside
          initial={{ x: -320 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          className="w-72 flex flex-col border-r border-accent/10 overflow-hidden relative z-10"
          style={{ background: 'rgba(5,7,15,0.85)', backdropFilter: 'blur(12px)' }}
        >
          {/* Search */}
          <div className="p-3 border-b border-accent/10">
            <div className="relative group">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/40 group-focus-within:text-accent transition-colors" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH FLEET..."
                className="w-full bg-black/40 border border-accent/20 focus:border-accent rounded-lg py-2 pl-8 pr-3 font-data text-[11px] text-accent outline-none transition-all placeholder:text-accent/30 focus:shadow-[0_0_12px_rgba(0,229,255,0.15)]"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[{ icon: Filter, label: 'FILTER' }, { icon: Database, label: 'EXPORT' }].map(({ icon: Icon, label }) => (
                <motion.button key={label} whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded font-mono text-[9px] uppercase tracking-wide text-accent/50 hover:text-accent transition-colors border border-accent/15 hover:border-accent/40 hover:bg-accent/5">
                  <Icon size={9} />{label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 font-mono text-[10px] text-accent/30 uppercase tracking-widest">No vehicles found</div>
            ) : filtered.map((v, i) => (
              <VehicleCard key={v.id} v={v} idx={i} onClick={() => navigate(`/vehicle/${v.id}`)} />
            ))}
          </div>
        </motion.aside>

        {/* ── Map ── */}
        <div className="flex-1 relative bg-bg-primary">
          {/* Map radial ambient */}
          <div className="absolute inset-0 pointer-events-none z-0"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.04) 0%, transparent 70%)' }} />

          <GlobalMap vehicles={vehicles} onVehicleClick={v => navigate(`/vehicle/${v.id}`)} />

          {/* Map mode buttons */}
          <motion.div
            initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="absolute top-4 right-4 z-20 flex flex-col gap-1.5"
          >
            <div className="glass-dark rounded-xl p-1.5 flex flex-col gap-1">
              {MAP_MODES.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setMapMode(id)}
                  className={`group relative p-2.5 rounded-lg flex items-center justify-center transition-all ${
                    mapMode === id
                      ? 'bg-accent/15 text-accent border border-accent/40 shadow-accent'
                      : 'text-accent/40 hover:text-accent hover:bg-accent/8 border border-transparent'
                  }`}>
                  <Icon size={15} />
                  <span className="absolute right-full mr-2.5 px-2 py-1 rounded font-mono text-[9px] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 duration-200"
                    style={{ background: 'rgba(5,7,15,0.95)', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Alert ticker */}
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
            className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(5,7,15,0.88)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,229,255,0.18)' }}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <motion.div
                animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <AlertTriangle size={14} className="text-warning" />
              </motion.div>
              <span className="font-hud text-[10px] font-bold text-warning tracking-widest uppercase"
                style={{ textShadow: '0 0 8px rgba(250,204,21,0.5)' }}>Live Intel:</span>
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {alerts.length > 0 ? (
                  <AlertTicker key={currentAlert} alert={alerts[currentAlert]} />
                ) : (
                  <motion.span key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="font-data text-[10px] text-accent/40 animate-pulse tracking-widest">
                    // SCANNING NH NETWORKS · NO ANOMALIES DETECTED
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
