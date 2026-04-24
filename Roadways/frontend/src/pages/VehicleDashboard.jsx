import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Truck, Gauge, Shield, Navigation2,
  Package, FileCheck, Cpu, Zap, Eye, Download,
  Activity, MapPin, Thermometer, Wifi, Clock
} from 'lucide-react';
import useStore from '../store/useStore';
import VehicleMap from '../components/VehicleMap';
import axios from 'axios';

/* ── Direction helper ── */
function getDir(h) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round((h||0)/45)%8];
}

/* ── Speed gauge arc ── */
function SpeedGauge({ speed = 0, max = 120 }) {
  const safeSpeed = isNaN(speed) ? 0 : speed;
  const pct   = Math.min(safeSpeed / max, 1);
  const deg   = pct * 220 - 110;
  const color = safeSpeed > 90 ? '#dc2626' : safeSpeed > 60 ? '#facc15' : '#22c55e';
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Track */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-[110deg]">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth="6" strokeDasharray="240 999" strokeLinecap="round" />
        <motion.circle
          cx="50" cy="50" r="38" fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${pct * 240} 999`} strokeLinecap="round"
          initial={{ strokeDasharray: '0 999' }}
          animate={{ strokeDasharray: `${pct * 240} 999` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="font-data text-lg font-bold leading-none" style={{ color, textShadow: `0 0 10px ${color}` }}>
          {Math.round(speed)}
        </div>
        <div className="font-mono text-[7px] text-accent/40 uppercase mt-0.5">km/h</div>
      </div>
    </div>
  );
}

/* ── Telemetry chip ── */
function TelChip({ icon: Icon, label, value, color = '#00e5ff', pulse }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl border transition-all hover:border-accent/40"
      style={{ background: 'rgba(5,7,15,0.6)', borderColor: color + '25' }}>
      <div className="flex items-center gap-1.5">
        <Icon size={10} style={{ color }} />
        <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: color + '80' }}>{label}</span>
        {pulse && <span className="w-1 h-1 rounded-full animate-pulse ml-auto" style={{ background: color }} />}
      </div>
      <div className="font-data text-sm font-bold" style={{ color, textShadow: `0 0 8px ${color}88` }}>{value}</div>
    </div>
  );
}

/* ── Event card ── */
function EventCard({ event, idx }) {
  const sev = { CRITICAL: '#dc2626', HIGH: '#f97316', MODERATE: '#facc15', LOW: '#22c55e' };
  const c   = sev[event.severity] || '#00e5ff';
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ delay: idx * 0.06 }}
      className="p-3 rounded-xl border flex gap-3"
      style={{ background: c + '08', borderColor: c + '30' }}
    >
      <div className="w-1 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className="font-hud text-[11px] font-bold uppercase tracking-wide" style={{ color: c }}>{event.event_type}</span>
          <span className="font-data text-[8px] opacity-50">{Math.round(event.confidence_score * 100)}%</span>
        </div>
        <p className="font-data text-[10px] text-accent/60 leading-relaxed">{event.description}</p>
      </div>
    </motion.div>
  );
}

/* ── Checkpoint item ── */
function Checkpoint({ name, status, time, idx }) {
  const done = status === 'COMPLETED';
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * idx }}
      className="flex items-center gap-3 py-2.5 border-b border-accent/6 last:border-0"
    >
      <div className={`relative w-3 h-3 rounded-full border-2 flex-shrink-0 ${done ? 'border-safe bg-safe/30' : 'border-accent/30 bg-transparent'}`}
        style={done ? { boxShadow: '0 0 6px #22c55e' } : {}}>
        {done && <span className="absolute inset-0 rounded-full bg-safe/30 animate-ping" />}
      </div>
      <span className={`font-data text-[10px] flex-1 ${done ? 'text-accent/80' : 'text-accent/30'}`}>{name}</span>
      <span className={`font-data text-[9px] ${done ? 'text-safe' : 'text-accent/30'} font-bold`}>{time}</span>
    </motion.div>
  );
}

const TABS = [
  { id: 'INTELLIGENCE', icon: Cpu,       label: 'Intel' },
  { id: 'ROUTE',        icon: Navigation2,label: 'Route' },
  { id: 'PREDICTIVE',   icon: Zap,        label: 'AI' },
  { id: 'DRIVER',       icon: Eye,        label: 'Driver' },
  { id: 'CARGO',        icon: Package,    label: 'Cargo' },
  { id: 'COMPLIANCE',   icon: FileCheck,  label: 'Legal' },
];

export default function VehicleDashboard() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { vehicles } = useStore();
  const [activeTab, setActiveTab] = useState('INTELLIGENCE');
  const [vehicleData, setVehicleData] = useState(null);
  const [events, setEvents]           = useState([]);

  const vehicle = vehicles.find(v => v.id === id) || vehicleData?.vehicle;

  useEffect(() => {
    const fetch = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6001';
      try {
        const [vRes, eRes] = await Promise.all([
          axios.get(`${apiUrl}/api/vehicles/${id}`),
          axios.get(`${apiUrl}/api/trips/${id}/events`)
        ]);
        setVehicleData(vRes.data);
        setEvents(eRes.data);
      } catch {}
    };
    fetch();
  }, [id]);

  if (!vehicle) return (
    <div className="h-screen w-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full" />
      <span className="font-data text-[10px] text-accent/40 uppercase tracking-widest">Synchronising Neural Link...</span>
    </div>
  );

  const checkpoints = [
    { name: 'Khaniwade Toll Plaza',  status: 'COMPLETED', time: '14:20 IST' },
    { name: 'Charoti Checkpoint',    status: 'COMPLETED', time: '16:45 IST' },
    { name: 'Nashik Industrial Zone',status: 'PENDING',   time: '21:00 IST' },
    { name: 'Dhule Interchange',     status: 'PENDING',   time: '02:30 IST' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* ── Top bar ── */}
      <motion.div
        initial={{ y: -56 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="h-14 flex items-center justify-between px-5 border-b border-accent/12 z-30 flex-shrink-0"
        style={{ background: 'rgba(5,7,15,0.94)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/overview')}
            className="p-1.5 rounded-lg border border-accent/15 hover:border-accent/40 hover:bg-accent/5 text-accent/40 hover:text-accent transition-all">
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="font-hud text-sm font-bold text-accent tracking-widest"
              style={{ textShadow: '0 0 12px rgba(0,229,255,0.4)' }}>
              {vehicle.registration_number}
            </div>
            <div className="font-data text-[9px] text-accent/40 uppercase">{vehicle.vehicle_type} · {vehicle.cargo_type}</div>
          </div>
          <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full border"
            style={{
              background: vehicle.last_speed > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.1)',
              borderColor: vehicle.last_speed > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(250,204,21,0.4)'
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: vehicle.last_speed > 0 ? '#22c55e' : '#facc15' }} />
            <span className="font-mono text-[8px] uppercase font-bold"
              style={{ color: vehicle.last_speed > 0 ? '#22c55e' : '#facc15' }}>
              {vehicle.last_speed > 0 ? 'Moving' : 'Idle'}
            </span>
          </div>
        </div>

        <button onClick={() => window.location.href = import.meta.env.VITE_HUB_URL || 'http://localhost:5000'}
          className="mx-4 px-3 py-1.5 rounded font-mono text-[10px] tracking-widest uppercase transition-all text-accent/50 hover:text-accent hover:bg-accent/5 border border-accent/15">
          Back to Hub
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:6001'}/api/vehicles/${id}/report`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase border border-accent/15 hover:border-accent/40 text-accent/50 hover:text-accent transition-all hover:bg-accent/5">
            <Download size={11} /> Report
          </button>
          <button onClick={() => navigate(`/digital-twin/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-hud text-[10px] font-bold uppercase tracking-widest transition-all"
            style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', boxShadow: '0 0 12px rgba(0,229,255,0.2)' }}>
            <Cpu size={11} /> Digital Twin
          </button>
        </div>
      </motion.div>

      {/* ── Main layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative min-h-0 border-r border-accent/10">
          <VehicleMap vehicle={vehicle} />

          {/* Floating HUD stats */}
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-2 rounded-2xl border border-accent/20 z-10"
            style={{ background: 'rgba(5,7,15,0.9)', backdropFilter: 'blur(12px)' }}
          >
            <SpeedGauge speed={vehicle.last_speed || 0} />
            <div className="w-px h-12 bg-accent/10 mx-1" />
            {[
              { label: 'HEADING',   value: `${Math.round(vehicle.last_heading || 0)}° ${getDir(vehicle.last_heading)}`, color: '#00e5ff' },
              { label: 'ETA DELAY', value: '+12 MIN',   color: '#facc15' },
              { label: 'SIGNAL',    value: 'STABLE',    color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center min-w-[60px] px-2">
                <span className="font-mono text-[7px] uppercase tracking-widest text-accent/30">{label}</span>
                <span className="font-data text-[11px] font-bold" style={{ color, textShadow: `0 0 8px ${color}88` }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Intelligence panel ── */}
        <motion.div
          initial={{ x: 440 }} animate={{ x: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.1 }}
          className="w-[400px] flex flex-col border-l border-accent/10 overflow-hidden"
          style={{ background: 'rgba(5,7,15,0.9)', backdropFilter: 'blur(12px)' }}
        >
          {/* Tab bar */}
          <div className="flex border-b border-accent/10 overflow-x-auto flex-shrink-0">
            {TABS.map(({ id: tid, icon: Icon, label }) => (
              <button key={tid} onClick={() => setActiveTab(tid)}
                className={`flex-1 min-w-[50px] py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${
                  activeTab === tid
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-accent/30 hover:text-accent/60 hover:bg-accent/3'
                }`}>
                <Icon size={13} />
                <span className="font-mono text-[7px] uppercase tracking-wide">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'INTELLIGENCE' && (
                <motion.div key="intel"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="space-y-5"
                >
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-accent/30 mb-3 flex items-center gap-2">
                      <Cpu size={9} className="text-accent" /> System Telemetry
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <TelChip icon={Gauge}       label="Fuel"       value="78%"    color="#22c55e" pulse />
                      <TelChip icon={Thermometer} label="Engine"     value="92 °C"  color="#facc15" />
                      <TelChip icon={Wifi}        label="GPS Signal" value="Stable" color="#22c55e" pulse />
                      <TelChip icon={Activity}    label="DOD Status" value="Active" color="#00e5ff" pulse />
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-accent/30 mb-3 flex items-center gap-2">
                      <Activity size={9} className="text-accent" /> Intel Feed
                    </div>
                    {events.length > 0
                      ? events.map((e, i) => <EventCard key={i} event={e} idx={i} />)
                      : (
                        <div className="py-8 text-center border border-dashed border-accent/10 rounded-xl">
                          <div className="font-data text-[10px] text-accent/25 uppercase tracking-widest">
                            No anomalies detected · last 4 hrs
                          </div>
                        </div>
                      )
                    }
                  </div>

                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-accent/30 mb-3 flex items-center gap-2">
                      <Shield size={9} className="text-accent" /> Blockchain Integrity
                    </div>
                    <div className="p-3.5 rounded-xl border border-accent/15 bg-accent/4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[9px] text-accent/70 uppercase">Cargo Seal</span>
                        <span className="font-data text-[10px] font-bold text-safe">INTACT ✓</span>
                      </div>
                      <div className="font-data text-[8px] text-accent/30 break-all leading-relaxed">
                        TX: 0x8a92b...c38d1e2f4 · Block #18,294,512
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ROUTE' && (
                <motion.div key="route"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  {/* Origin → Destination */}
                  <div className="p-4 rounded-xl border border-accent/15 bg-accent/3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-safe" style={{ boxShadow: '0 0 8px #22c55e' }} />
                        <div className="w-px flex-1 bg-accent/15" style={{ minHeight: 32 }} />
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-accent animate-pulse" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between" style={{ minHeight: 64 }}>
                        <div>
                          <div className="font-mono text-[8px] text-accent/30 uppercase">Origin</div>
                          <div className="font-hud text-[12px] font-semibold text-accent/90 mt-0.5">JNPT Nhava Sheva, Mumbai</div>
                        </div>
                        <div>
                          <div className="font-mono text-[8px] text-accent/30 uppercase">Destination</div>
                          <div className="font-hud text-[12px] font-semibold text-accent/90 mt-0.5">Patparganj ICD, Delhi</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-accent/10 grid grid-cols-3 gap-2">
                      {[{ l:'Distance', v:'1,420 km'}, {l:'ETA', v:'06:30 IST'}, {l:'Progress', v:'34%'}].map(({l,v})=>(
                        <div key={l} className="text-center">
                          <div className="font-data text-xs font-bold text-accent">{v}</div>
                          <div className="font-mono text-[7px] text-accent/30 uppercase mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="font-mono text-[8px] text-accent/30 uppercase tracking-widest mb-2">Checkpoints</div>
                  {checkpoints.map((cp, i) => <Checkpoint key={i} {...cp} idx={i} />)}
                </motion.div>
              )}

              {activeTab === 'PREDICTIVE' && (
                <motion.div key="pred"
                  initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                  className="space-y-4"
                >
                  {[
                    { label: 'Congestion Risk — NH48 Nashik', level: 72, color: '#f97316', detail: 'Peak hours 19:00–21:00 IST. Suggest early departure.' },
                    { label: 'Weather Alert — Pune Bypass',   level: 45, color: '#facc15', detail: 'Light rain forecast. Reduced visibility expected.' },
                    { label: 'Driver Fatigue Index',          level: 28, color: '#22c55e', detail: 'Current fatigue level within safe operational bounds.' },
                  ].map(({ label, level, color, detail }) => (
                    <div key={label} className="p-3.5 rounded-xl border" style={{ borderColor: color + '25', background: color + '06' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-hud text-[11px] font-semibold tracking-wide" style={{ color }}>{label}</span>
                        <span className="font-data text-sm font-bold" style={{ color, textShadow: `0 0 8px ${color}` }}>{level}%</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: color + '18' }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${level}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 6px ${color}` }}
                        />
                      </div>
                      <p className="font-data text-[9px] text-accent/50 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {(activeTab === 'DRIVER' || activeTab === 'CARGO' || activeTab === 'COMPLIANCE') && (
                <motion.div key={activeTab}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center gap-4 py-16"
                >
                  <div className="w-14 h-14 rounded-2xl border border-accent/15 bg-accent/5 flex items-center justify-center animate-float">
                    {activeTab === 'DRIVER'     && <Eye size={26} className="text-accent/40" />}
                    {activeTab === 'CARGO'      && <Package size={26} className="text-accent/40" />}
                    {activeTab === 'COMPLIANCE' && <FileCheck size={26} className="text-accent/40" />}
                  </div>
                  <div className="text-center">
                    <div className="font-hud text-sm font-bold text-accent/60 tracking-widest uppercase">{activeTab} MODULE</div>
                    <div className="font-data text-[9px] text-accent/25 uppercase mt-1 tracking-widest">Loading real-time data stream...</div>
                  </div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-accent/15 border-t-accent/60 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
