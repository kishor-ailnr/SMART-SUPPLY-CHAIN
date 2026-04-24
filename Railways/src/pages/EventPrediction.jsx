import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter } from 'lucide-react';

export default function EventPrediction() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      time: "in 2h 15min",
      timestamp: "18:45 IST",
      location: "Kanpur Central (CNB) - Block Section",
      category: "STATION",
      title: "PLATFORM CAPACITY SURGE",
      desc: "Station intelligence agent predicts platform 4 & 5 exhaustion at Kanpur Central due to delayed departure of 12423. Expect train to be held at outer signal. Recommendation: Controller to coordinate early platform clearance.",
      risk: "CAUTION",
      sources: "NTES, Station Camera API",
      historical: "Platform conflict rate here is 14% on Thursdays."
    },
    {
      id: 2,
      time: "in 6h 30min",
      timestamp: "23:00 IST",
      location: "Prayagraj (PRYJ) - DDU Section",
      category: "WEATHER",
      title: "DENSE FOG HALT",
      desc: "NOAA GFS predicts visibility drop to 180m within the IGP corridor. Fog Safe Device (FSD) protocol activation mandatory. Proceed with Restricted Speed (60km/h max). Divisional controller to alert Loco Pilot.",
      risk: "MAJOR DELAY",
      sources: "NOAA GFS, Open-Meteo",
      historical: "Section fog delay average in Dec-Jan is 85 mins."
    },
    {
      id: 3,
      time: "in 11h 10min",
      timestamp: "03:40 IST",
      location: "DDU - GAYA Section",
      category: "INFRASTRUCTURE",
      title: "MAINTENANCE BLOCK AHEAD",
      desc: "Pre-planned OHE power block starting 04:00 IST for maintenance. If current train delay compounding continues, train will clash with maintenance window. Prepare diversion via alternative BG route if delay exceeds 30m.",
      risk: "EMERGENCY",
      sources: "AAI Block Register, DRM Tweets",
      historical: ""
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary p-6 text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 glass-panel rounded hover:bg-bg-tertiary text-rail-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold tracking-widest text-white">EVENTS PREDICTION DETAILS</h1>
          <p className="font-mono text-sm text-text-muted">COMPLETE TRAIN RUN CHRONOLOGY</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-panel text-rail-accent flex items-center gap-2 px-4 py-2 rounded text-xs font-mono hover:bg-bg-hover">
            <Filter className="w-4 h-4" /> FILTER
          </button>
          <button className="glass-panel text-rail-accent flex items-center gap-2 px-4 py-2 rounded text-xs font-mono hover:bg-bg-hover">
            <Download className="w-4 h-4" /> GENERATE REPORT (PDF)
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {events.map((evt) => {
          let riskColor = "text-status-delayedMinor border-status-delayedMinor";
          let bgDim = "bg-status-delayedMinorDim";
          if (evt.risk === "MAJOR DELAY") {
             riskColor = "text-status-delayedMajor border-status-delayedMajor";
             bgDim = "bg-status-delayedMajorDim";
          }
          if (evt.risk === "EMERGENCY") {
             riskColor = "text-status-criticalDelay border-status-criticalDelay";
             bgDim = "bg-status-criticalDelayDim";
          }

          return (
            <div key={evt.id} className="glass-panel p-6 rounded-lg relative overflow-hidden group hover:border-rail-accent transition-colors">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${bgDim} bg-opacity-100`}></div>
              
              <div className="ml-4 flex justify-between items-start mb-4">
                 <div>
                   <div className="flex items-center gap-3 mb-1">
                     <span className="font-mono text-white text-lg">{evt.timestamp}</span>
                     <span className="bg-bg-tertiary px-2 py-0.5 rounded font-mono text-[10px] text-text-muted border border-rail-border">{evt.time}</span>
                   </div>
                   <p className="font-mono text-sm text-rail-accent">{evt.location}</p>
                 </div>
                 <div className="text-right">
                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded border ${riskColor} ${bgDim}`}>{evt.risk}</span>
                    <p className="text-[10px] font-mono text-text-muted mt-2">{evt.category}</p>
                 </div>
              </div>

              <div className="ml-4 space-y-3">
                <h3 className="font-mono text-xl font-bold text-white">{evt.title}</h3>
                <p className="font-mono text-sm text-text-secondary leading-relaxed">{evt.desc}</p>
                <div className="bg-bg-tertiary p-3 rounded border border-rail-border mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-text-muted block mb-1">DATA SOURCES</span>
                      <span className="text-xs font-mono text-white">{evt.sources}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-text-muted block mb-1">HISTORICAL FREQUENCY</span>
                      <span className="text-xs font-mono text-white">{evt.historical || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
