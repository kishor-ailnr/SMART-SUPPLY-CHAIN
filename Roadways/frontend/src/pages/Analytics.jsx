import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertCircle, Fuel, IndianRupee, Clock, Activity, BarChart2, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { HUDNavbar } from './Overview';

const weekData = [
  { day: 'MON', trips: 45, fuel: 1200, alerts: 2 },
  { day: 'TUE', trips: 52, fuel: 1450, alerts: 1 },
  { day: 'WED', trips: 48, fuel: 1300, alerts: 3 },
  { day: 'THU', trips: 61, fuel: 1600, alerts: 0 },
  { day: 'FRI', trips: 55, fuel: 1500, alerts: 2 },
  { day: 'SAT', trips: 38, fuel: 900,  alerts: 0 },
  { day: 'SUN', trips: 30, fuel: 750,  alerts: 1 },
];

const delayCauses = [
  { cause: 'Traffic',    value: 45 },
  { cause: 'Weather',    value: 28 },
  { cause: 'Breakdown',  value: 15 },
  { cause: 'Compliance', value: 12 },
];

const DELAY_COLORS = ['#00e5ff', '#facc15', '#f97316', '#8b5cf6'];

const regionData = [
  { region: 'NORTH', score: 92, color: '#00e5ff' },
  { region: 'SOUTH', score: 85, color: '#22c55e' },
  { region: 'WEST',  score: 78, color: '#facc15' },
  { region: 'EAST',  score: 70, color: '#f97316' },
];

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-lg px-3 py-2 text-[10px] font-data border border-accent/20">
      <div className="text-accent/60 mb-1 uppercase tracking-wide">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2" style={{ color: p.color || '#00e5ff' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="uppercase">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── KPI Card ── */
function KPICard({ icon: Icon, label, value, trend, color }) {
  const COLORS = {
    accent:  { c: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: 'rgba(0,229,255,0.25)',   glow: '0 0 20px rgba(0,229,255,0.2)' },
    safe:    { c: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.25)',   glow: '0 0 20px rgba(34,197,94,0.2)' },
    warning: { c: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)',  glow: '0 0 20px rgba(250,204,21,0.2)' },
    danger:  { c: '#f97316', bg: 'rgba(247,151,22,0.08)',  border: 'rgba(247,151,22,0.25)',  glow: '0 0 20px rgba(247,151,22,0.2)' },
    critical: { c: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.25)',  glow: '0 0 20px rgba(220,38,38,0.2)' },
  };
  const { c, bg, border, glow } = COLORS[color] || COLORS.accent;
  const isTrendUp = trend?.startsWith('+');
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: glow }}
      className="rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden cursor-default border"
      style={{ background: bg, borderColor: border, boxShadow: '0 0 0px rgba(0,0,0,0)' }}
    >
      {/* Subtle corner glow */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none"
        style={{ background: c, opacity: 0.08 }} />
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-lg" style={{ background: c + '15' }}>
          <Icon size={18} style={{ color: c }} />
        </div>
        <span className={`font-data text-[10px] font-bold px-2 py-0.5 rounded-full border ${isTrendUp ? 'text-safe border-safe/30 bg-safe/10' : 'text-critical border-critical/30 bg-critical/10'}`}>
          {trend}
        </span>
      </div>
      <div>
        <div className="font-hud text-2xl font-bold" style={{ color: c, textShadow: `0 0 12px ${c}88` }}>{value}</div>
        <div className="font-mono text-[9px] text-accent/40 uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Panel wrapper ── */
function ChartPanel({ title, subtitle, children }) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col gap-4">
      <div>
        <div className="font-hud text-sm font-semibold text-accent uppercase tracking-widest">{title}</div>
        {subtitle && <div className="font-mono text-[9px] text-accent/40 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [activeWeek, setActiveWeek] = useState('trips');

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <HUDNavbar activeRoute="/analytics" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button onClick={() => navigate('/overview')}
            className="p-2 rounded-lg border border-accent/20 hover:border-accent/50 hover:bg-accent/5 text-accent/50 hover:text-accent transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-hud text-xl font-bold text-accent tracking-widest uppercase"
              style={{ textShadow: '0 0 12px rgba(0,229,255,0.4)' }}>Fleet Analytics</h1>
            <p className="font-mono text-[9px] text-accent/40 uppercase tracking-wide">Real-time Performance · India Operations Node</p>
          </div>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp,   label: 'Total Trips (MTD)',  value: '1,248',  trend: '+12.5%', color: 'accent'   },
            { icon: AlertCircle,  label: 'Critical Alerts',    value: '24',     trend: '-5.2%',  color: 'critical' },
            { icon: IndianRupee,  label: 'Avg Delay Cost',     value: '₹42,500',trend: '+2.3%',  color: 'warning'  },
            { icon: Activity,     label: 'Fleet Utilization',  value: '84.2%',  trend: '+4.1%',  color: 'safe'     },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <KPICard {...k} />
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Area chart */}
          <ChartPanel title="Weekly Trip Volume" subtitle="Trips vs Fuel Consumption">
            <div className="flex gap-2 mb-1">
              {[['trips','#00e5ff'],['fuel','#facc15']].map(([k,c]) => (
                <button key={k} onClick={() => setActiveWeek(k)}
                  className={`font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wide border transition-all ${activeWeek===k ? 'text-white border-current bg-current/20' : 'text-accent/40 border-accent/15 hover:border-accent/35'}`}
                  style={activeWeek===k ? { color: c, borderColor: c, backgroundColor: c+'22' } : {}}>
                  {k}
                </button>
              ))}
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#facc15" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,229,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(0,229,255,0.25)" tick={{ fill: '#00e5ff88', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <YAxis stroke="rgba(0,229,255,0.1)" tick={{ fill: '#00e5ff44', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<ChartTooltip />} />
                  {activeWeek === 'trips' && (
                    <Area type="monotone" dataKey="trips" name="TRIPS" stroke="#00e5ff" strokeWidth={2} fill="url(#gTrips)" dot={{ fill: '#00e5ff', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
                  )}
                  {activeWeek === 'fuel' && (
                    <Area type="monotone" dataKey="fuel" name="FUEL (L)" stroke="#facc15" strokeWidth={2} fill="url(#gFuel)" dot={{ fill: '#facc15', r: 3, strokeWidth: 0 }} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>

          {/* Bar chart */}
          <ChartPanel title="Primary Delay Causes" subtitle="By frequency — current month">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={delayCauses} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,229,255,0.06)" vertical={false} />
                  <XAxis dataKey="cause" stroke="rgba(0,229,255,0.2)" tick={{ fill: '#00e5ff88', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <YAxis stroke="rgba(0,229,255,0.1)" tick={{ fill: '#00e5ff44', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,229,255,0.04)' }} />
                  <Bar dataKey="value" name="INCIDENTS" radius={[4,4,0,0]} maxBarSize={40}>
                    {delayCauses.map((_, i) => (
                      <Cell key={i} fill={DELAY_COLORS[i]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-4">
          {/* Fleet health radar placeholder */}
          <div className="lg:col-span-2">
            <ChartPanel title="Fleet Health Monitor" subtitle="Predictive anomaly detection">
              <div className="h-48 flex items-center justify-center relative overflow-hidden rounded-lg"
                style={{ background: 'rgba(0,5,15,0.6)', border: '1px solid rgba(0,229,255,0.1)' }}>
                {/* Concentric rings */}
                {[160,120,80,40].map(r => (
                  <div key={r} style={{ width: r, height: r }}
                    className="absolute rounded-full border border-accent/10" />
                ))}
                {/* Radar sweep */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-40 h-40 rounded-full"
                  style={{ background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,229,255,0.12) 360deg)' }} />
                {/* Blips */}
                {[{x:30,y:-25,c:'#22c55e'},{x:-45,y:10,c:'#facc15'},{x:20,y:40,c:'#00e5ff'}].map((b,i)=>(
                  <motion.div key={i} style={{ left: `calc(50% + ${b.x}px)`, top: `calc(50% + ${b.y}px)` }}
                    animate={{ opacity:[0.5,1,0.5], scale:[0.8,1.2,0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i*0.6 }}
                    className="absolute w-2 h-2 rounded-full" style={{ background: b.c, boxShadow:`0 0 8px ${b.c}` }} />
                ))}
                <span className="font-data text-[9px] text-accent/30 uppercase tracking-widest absolute bottom-3">
                  Predictive Health Model Active
                </span>
              </div>
            </ChartPanel>
          </div>

          {/* Region performance */}
          <ChartPanel title="Region Performance" subtitle="Operational efficiency">
            <div className="space-y-4 mt-1">
              {regionData.map((r, i) => (
                <div key={r.region}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-hud text-[11px] font-semibold tracking-widest" style={{ color: r.color }}>{r.region}</span>
                    <span className="font-data text-[11px] font-bold" style={{ color: r.color }}>{r.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,229,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${r.score}%` }}
                      transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`, boxShadow: `0 0 6px ${r.color}66` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartPanel>
        </div>
      </div>
    </div>
  );
}
