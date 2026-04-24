import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Clock, ShieldAlert, CloudLightning, Ship, Shield, CheckCircle, Flame } from 'lucide-react';

const EventsPrediction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const vessel = useStore(state => state.vessels).find(v => v.vesselId === id);

  return (
    <div className="w-screen h-screen flex flex-col bg-ocean-900 text-white font-inter overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 glass-panel bg-ocean-800 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/vessel/${id}`)} className="p-2 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-space font-bold text-lg tracking-widest text-accent uppercase flex items-center gap-2">
               {vessel?.name || 'TRACKED VESSEL'} <span className="px-2 py-0.5 bg-warning/20 border border-warning/50 rounded text-[9px] text-warning tracking-tighter">AI EVENTS ENGINE ACTIVE</span>
            </h1>
            <p className="text-[10px] text-white/50 font-mono">Synthesizing 7 APIs • 85% Confidence Threshold</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 border border-white/10 bg-ocean-900 rounded text-xs hover:border-accent transition-colors">Export PDF</button>
            <button className="px-4 py-2 border border-accent/50 bg-accent/10 text-accent rounded text-xs font-bold hover:bg-accent/20 transition-colors">Share ETA</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
         {/* Filters sidebar */}
         <div className="w-64 border-r border-white/10 bg-ocean-900/50 p-6 flex flex-col gap-6 shrink-0">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">Category Filter</h3>
              <div className="space-y-2">
                 <FilterCheckbox label="Weather Systems" icon={<CloudLightning className="w-3 h-3 text-accent" />} count={12} checked />
                 <FilterCheckbox label="Security & Piracy" icon={<ShieldAlert className="w-3 h-3 text-danger" />} count={1} checked />
                 <FilterCheckbox label="Port Congestion" icon={<Ship className="w-3 h-3 text-warning" />} count={4} checked />
                 <FilterCheckbox label="Regulatory" icon={<Shield className="w-3 h-3 text-safe" />} count={2} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 border-b border-white/10 pb-2">Active Data Hooks</h3>
              <div className="flex flex-wrap gap-2">
                 <Badge text="Open-Meteo" />
                 <Badge text="Stormglass" />
                 <Badge text="GDELT" />
                 <Badge text="NewsAPI" />
                 <Badge text="Global Fishing Watch" opacity="opacity-50" />
              </div>
            </div>
         </div>

         {/* Events Timeline */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gradient-to-br from-ocean-900 to-ocean-800">
            <div className="max-w-3xl mx-auto space-y-6 relative before:absolute before:inset-0 before:ml-[28px] before:w-0.5 before:bg-white/10">
               
               <EventCard 
                  time="T+0h 00m" date="NOW"
                  title="Current Telemetry Baseline"
                  type="info" icon={<CheckCircle />} color="text-safe" bg="bg-safe/10 border-safe/30"
                  desc="Vessel operating within normal parameters. SOG 14.2 knots. AI engines synced."
                  sources={['MarineTraffic']}
               />

               <EventCard 
                  time="T+8h 30m" date="Oct 24, 18:30 UTC"
                  title="Severe Weather Intercept: Developing Squall"
                  type="risk" icon={<CloudLightning />} color="text-danger" bg="bg-danger/10 border-danger/50"
                  desc="Agent #1 (Weather) detects a rapidly developing low-pressure system intersecting predicted trajectory. Anticipated crosswinds of 42kts and swell height peaking at 5.5m. High risk to exposed deck cargo."
                  action="RECOMMENDATION: Alter course 15° starboard (-2 hours ETA impact) to bypass storm cell."
                  sources={['Open-Meteo', 'Stormglass']}
               />

               <EventCard 
                  time="T+14h 00m" date="Oct 25, 00:00 UTC"
                  title="Dark Vessel Anomaly Detected"
                  type="warn" icon={<ShieldAlert />} color="text-amber" bg="bg-amber/10 border-amber/50 flex-row-reverse"
                  desc="Agent #2 (Security) flagged unusual AIS shadowing in adjacent sector grid. 3 targets exhibit spoofing patterns characteristic of illegal transshipment. Maintain heightened radar watch."
                  sources={['Global Fishing Watch', 'GDELT']}
               />

               <EventCard 
                  time="T+22h 15m" date="Oct 25, 08:15 UTC"
                  title="Port Congestion Build-up at Destination"
                  type="warn" icon={<Ship />} color="text-warning" bg="bg-warning/10 border-warning/50"
                  desc="Agent #3 (Port Intel) reports a wildcat strike at terminal 4. Anticipated queuing time has increased from 4h to 22h. "
                  action="FINANCIAL IMPACT: Agent #5 calculates slowing to 10 knots saves $14,200 in fuel while absorbing wait time."
                  sources={['NewsAPI', 'X/Twitter Ports']}
               />

               <div className="h-20" /> {/* Spacer */}
            </div>
         </div>
      </div>
    </div>
  );
};

const FilterCheckbox = ({ label, icon, count, checked }) => (
  <label className="flex items-center justify-between text-xs p-2 hover:bg-white/5 rounded cursor-pointer transition-colors group">
    <div className="flex items-center gap-2">
      <input type="checkbox" className="accent-accent" defaultChecked={checked} />
      {icon}
      <span className="text-white/80 group-hover:text-white">{label}</span>
    </div>
    <span className="text-[10px] text-white/30 font-mono bg-ocean-900 border border-white/5 px-1.5 rounded">{count}</span>
  </label>
)

const Badge = ({ text, opacity = "" }) => (
  <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded bg-ocean-700 border border-white/10 text-white/50 ${opacity}`}>{text}</span>
)

const EventCard = ({ time, date, title, desc, action, type, icon, color, bg, sources }) => (
  <div className="relative z-10 flex gap-6">
    <div className={`w-14 shrink-0 text-right mt-1`}>
      <div className="text-xs font-bold font-mono">{time}</div>
      <div className="text-[9px] text-white/40 uppercase font-mono">{date}</div>
    </div>
    <div className={`w-14 h-14 shrink-0 rounded-full border-4 border-ocean-900 bg-ocean-800 flex items-center justify-center -ml-[35px] z-20 ${color}`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div className={`flex-1 glass-panel p-5 rounded-lg border ${bg} hover:-translate-y-1 transition-transform`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className={`font-bold uppercase tracking-wider text-sm ${color}`}>{title}</h4>
          <div className="flex gap-1">
             {sources.map(s => <Badge key={s} text={s} />)}
          </div>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed font-inter mb-3 border-l-2 pl-3 border-white/20">{desc}</p>
        
        {action && (
          <div className="mt-4 p-3 bg-ocean-900/40 border border-white/10 rounded">
             <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest mb-1">
                <Flame className="w-3 h-3" /> Agent Action Triggered
             </div>
             <p className="text-xs text-white uppercase tracking-wider">{action}</p>
          </div>
        )}
    </div>
  </div>
)

export default EventsPrediction;
