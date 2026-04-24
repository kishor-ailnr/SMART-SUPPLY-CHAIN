import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, Activity, Map as MapIcon, Shield, Box, Database, FileText, 
  Wind, Droplets, Thermometer, Anchor, Zap, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import LiveMap from '../components/map/LiveMap';
import Vessel3D from '../components/sim/Vessel3D';

const LiveDashboard = () => {
  const { id } = useParams();
  const { setSelectedVesselId, mapLayer, setMapLayer } = useStore();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('INTELLIGENCE');

  useEffect(() => {
    setSelectedVesselId(id);
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:6004/api/vessel/${id}`);
      setData(res.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <div className="h-screen w-screen bg-primary flex items-center justify-center text-accent text-2xl font-display">SYNCHRONIZING_TELEMETRY...</div>;

  const tabs = [
    { id: 'INTELLIGENCE', icon: Shield, label: 'Intelligence' },
    { id: 'VOYAGE', icon: MapIcon, label: 'Voyage' },
    { id: 'DIGITAL_TWIN', icon: Activity, label: 'Digital Twin' },
    { id: 'CARGO', icon: Box, label: 'Cargo & IoT' },
    { id: 'COMPLIANCE', icon: FileText, label: 'Compliance' },
  ];

  return (
    <div className="h-screen w-screen bg-[#060d1a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="text-white/60" />
          </Link>
          <div className="h-10 w-px bg-white/10" />
          <button onClick={() => window.location.href = 'http://localhost:5000'}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-accent font-bold text-[10px] tracking-widest uppercase transition-all">
            Nexus Hub
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-[0.2em]">{data.name}</h1>
            <p className="text-[10px] text-accent tracking-[0.4em] uppercase">IMO {data.imo_number} // {data.vessel_type}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right">
             <p className="text-[8px] text-white/40 uppercase font-mono">Current Position</p>
             <p className="text-xs text-white font-mono">{data.position?.lat.toFixed(4)}°N / {data.position?.lng.toFixed(4)}°E</p>
           </div>
           <div className={`px-4 py-2 rounded border font-bold text-[10px] tracking-widest ${data.riskLevel === 'HIGH' ? 'border-critical/50 text-critical bg-critical/10' : 'border-safe/50 text-safe bg-safe/10'}`}>
             {data.riskLevel || 'SAFE'}
           </div>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left Side: Map Overlay Background */}
        <div className="flex-1 relative">
           <LiveMap />
           
           {/* Floating Action Buttons */}
           <div className="absolute bottom-10 left-10 z-10 flex gap-4">
              <button 
                onClick={() => setMapLayer('SATELLITE')}
                className={`glass px-6 py-3 rounded-xl border font-bold text-xs tracking-widest transition-all ${mapLayer === 'SATELLITE' ? 'bg-accent text-[#060d1a] border-accent' : 'border-accent/30 text-accent hover:bg-accent/10'}`}
              >
                SATELLITE_MODE
              </button>
              <button 
                onClick={() => setMapLayer('DARK')}
                className={`glass px-6 py-3 rounded-xl border font-bold text-xs tracking-widest transition-all ${mapLayer === 'DARK' ? 'bg-white/10 text-white border-white/50' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
              >
                NAUTICAL_CHART
              </button>
           </div>
        </div>

        {/* Right Side: Intelligence Panel */}
        <div className="w-[500px] glass border-l border-white/10 flex flex-col z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all relative ${activeTab === tab.id ? 'text-accent' : 'text-white/30 hover:text-white/60'}`}
              >
                <tab.icon size={18} />
                <span className="text-[8px] uppercase font-bold tracking-tighter">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <AnimatePresence mode="wait">
               {activeTab === 'INTELLIGENCE' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full space-y-6">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-4 rounded-xl border border-white/5">
                            <p className="text-[8px] text-white/40 uppercase mb-2">SOG</p>
                            <p className="text-2xl font-mono text-white">{data.position?.sog || '0.0'} <span className="text-xs text-white/40 font-normal">kn</span></p>
                        </div>
                        <div className="glass p-4 rounded-xl border border-white/5">
                            <p className="text-[8px] text-white/40 uppercase mb-2">COG</p>
                            <p className="text-2xl font-mono text-white">{data.position?.cog || '000'} <span className="text-xs text-white/40 font-normal">°T</span></p>
                        </div>
                        </div>

                        {/* Navigation Advisory (Safe Route Logic) */}
                        <div className="glass p-6 rounded-2xl border border-accent/20 bg-accent/5">
                            <h3 className="text-[10px] text-accent font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Shield size={14} /> Navigation Advisory
                            </h3>
                            {data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH' ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-white/80 leading-relaxed uppercase tracking-tighter">Extreme risk detected. Potential for vessel interference or structural stress from sea state.</p>
                                    <button className="w-full py-3 bg-safe/20 border border-safe/40 text-safe rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-safe/30 transition-all flex items-center justify-center gap-2">
                                        <Activity size={12} /> Display Predicted Safe Path
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-safe">
                                        <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Optimal Path Verified</p>
                                    </div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-tight">The current navigation is safe. No alternate route is needed at this time.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                        <h3 className="text-[10px] text-accent font-bold uppercase tracking-widest flex items-center gap-2">
                            <Shield size={12}/> AI Deployment Status
                        </h3>
                        {data.alerts?.map((alert, i) => (
                            <div key={i} className="glass border border-critical/20 p-4 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-critical px-2 py-0.5 text-[8px] text-white font-bold">{alert.severity}</div>
                            <p className="text-xs font-bold text-white mb-1">{alert.title}</p>
                            <p className="text-[10px] text-white/60 leading-relaxed">{alert.description}</p>
                            <p className="text-[8px] text-white/40 mt-2 font-mono">{new Date(alert.created_at).toLocaleTimeString()}</p>
                            </div>
                        ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Ambient IoT Reading</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center gap-2 glass p-3 rounded-lg">
                                <Thermometer className="text-accent" size={16} />
                                <span className="text-sm font-mono text-white">4.2°C</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 glass p-3 rounded-lg">
                                <Droplets className="text-accent" size={16} />
                                <span className="text-sm font-mono text-white">82%</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 glass p-3 rounded-lg">
                                <Zap className="text-accent" size={16} />
                                <span className="text-sm font-mono text-white">98%</span>
                            </div>
                        </div>
                        </div>
                    </div>
                  </motion.div>
               )}

                {activeTab === 'DIGITAL_TWIN' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col gap-6">
                     <div className="h-[240px] w-full glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                       <Vessel3D vessel={data} />
                     </div>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        <div className="flex items-center justify-between mb-2">
                           <h3 className="text-accent text-[10px] font-bold uppercase tracking-[0.2em]">Stochastic Prediction Matrix // 20H</h3>
                           <Link to={`/vessel/${id}/twin`} className="text-[8px] text-white/40 hover:text-white underline uppercase tracking-widest">Full Screen Twin</Link>
                        </div>

                        {[...Array(20)].map((_, i) => {
                           const hour = i + 1;
                           let risk = 'SAFE';
                           let prediction = 'OPTIMAL_NAVIGATION';
                           let solution = 'Maintain current course and speed.';
                           
                           if (hour === 4) { risk = 'WARNING'; prediction = 'HEAVY_SEA_STATE'; solution = 'Reduce speed by 2 knots; secure deck cargo.'; }
                           else if (hour === 12) { risk = 'CRITICAL'; prediction = 'TRAFFIC_CONVERGENCE'; solution = 'Execute course adjustment to 290°; alert bridge crew.'; }
                           else if (hour === 18) { risk = 'WARNING'; prediction = 'VISIBILITY_REDUCTION'; solution = 'Activate extra lighting; continuous radar monitoring.'; }

                           return (
                              <div key={i} className={`relative p-4 rounded-xl border group transition-all ${
                                 risk === 'CRITICAL' ? 'border-critical/30 bg-critical/5' : 
                                 risk === 'WARNING' ? 'border-warning/30 bg-warning/5' : 
                                 'border-white/5 bg-white/2'
                              }`}>
                                 <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[10px] font-mono font-bold ${risk === 'CRITICAL' ? 'text-critical' : risk === 'WARNING' ? 'text-warning' : 'text-accent'}`}>T+{hour}H</span>
                                       <span className="text-[10px] font-bold text-white uppercase tracking-wider">{prediction.replace('_', ' ')}</span>
                                    </div>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${risk === 'CRITICAL' ? 'bg-critical text-white' : risk === 'WARNING' ? 'bg-warning text-black' : 'text-safe border border-safe/20'}`}>{risk}</span>
                                 </div>
                                 <p className="text-[10px] text-white/60 leading-relaxed italic mb-3">Action: {solution}</p>
                                 <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full ${risk === 'CRITICAL' ? 'bg-critical' : 'bg-accent'}`} style={{ width: `${100 - (i*3)}%` }} />
                                 </div>
                                 {i < 19 && <div className="absolute -bottom-4 left-6 w-px h-4 bg-white/10" />}
                              </div>
                           );
                        })}
                     </div>
                  </motion.div>
                )}

                {activeTab === 'VOYAGE' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex flex-col h-full">
                    <div className="glass p-6 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-end mb-8 relative">
                        <div className="z-10 bg-[#0a1628] pr-4">
                          <p className="text-[8px] text-white/40 uppercase mb-1">Departure</p>
                          <p className="text-sm font-bold text-white font-display tracking-widest">{data.voyage?.departure_port || 'ORIG_NULL'}</p>
                        </div>
                        
                        <div className="absolute top-[60%] left-0 right-0 h-1 bg-gradient-to-r from-safe to-warning -z-0 rounded-full opacity-40">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_15px_#00d4ff] border border-white" />
                              <p className="text-[7px] text-accent font-bold mt-2 uppercase tracking-tighter bg-[#0a1628] px-1">MID_WAY</p>
                           </div>
                        </div>

                        <div className="z-10 bg-[#0a1628] pl-4 text-right">
                          <p className="text-[8px] text-white/40 uppercase mb-1">Arrival</p>
                          <p className="text-sm font-bold text-white font-display tracking-widest">{data.voyage?.arrival_port || 'DEST_NULL'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                         <div>
                           <p className="text-[8px] text-white/40 uppercase">ETA</p>
                           <p className="text-xs font-mono text-white">{data.voyage?.eta || 'PENDING'}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[8px] text-white/40 uppercase">Remaining Dist</p>
                           <p className="text-xs font-mono text-white">450.2 nm</p>
                         </div>
                      </div>
                    </div>

                    <div className="flex-1 glass p-4 rounded-xl border border-white/5">
                       <h4 className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4">Voyage Checkpoints</h4>
                       <div className="space-y-4">
                          <CheckpointItem label="Suez Canal Entry" time="T-24H" status="COMPLETED" />
                          <CheckpointItem label="Strait of Hormuz" time="T+12H" status="PENDING" isMid />
                          <CheckpointItem label="Port of Jebel Ali" time="T+36H" status="PENDING" />
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'CARGO' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                       <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                         <Box size={14} className="text-accent" /> Manifest Data
                       </h3>
                       <div className="space-y-3">
                         <div className="flex justify-between text-[10px]">
                           <span className="text-white/40">Cargo Type</span>
                           <span className="text-white font-mono">{data.voyage?.cargo_type || 'General Merchandise'}</span>
                         </div>
                         <div className="flex justify-between text-[10px]">
                           <span className="text-white/40">Insured Value</span>
                           <span className="text-safe font-mono">${(data.voyage?.cargo_value || 0).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-[10px]">
                           <span className="text-white/40">IoT Cluster Status</span>
                           <span className="text-safe animate-pulse">OPTIMAL [12 Nodes]</span>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'COMPLIANCE' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-safe/10 text-safe rounded">
                           <FileText size={16} />
                         </div>
                         <div>
                           <p className="text-xs font-bold text-white">SMC Certificate</p>
                           <p className="text-[8px] text-white/40 uppercase">Valid until 2027-04</p>
                         </div>
                       </div>
                       <ChevronRight size={14} className="text-white/20" />
                    </div>
                    <div className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between opacity-60">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-accent/10 text-accent rounded">
                           <FileText size={16} />
                         </div>
                         <div>
                           <p className="text-xs font-bold text-white">MARPOL Annex VI</p>
                           <p className="text-[8px] text-white/40 uppercase">Audit Completed</p>
                         </div>
                       </div>
                       <ChevronRight size={14} className="text-white/20" />
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckpointItem = ({ label, time, status, isMid }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${status === 'COMPLETED' ? 'bg-safe' : isMid ? 'bg-accent' : 'bg-white/20'}`} />
      <div>
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[8px] text-white/40 uppercase font-mono">{time}</p>
      </div>
    </div>
    <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${status === 'COMPLETED' ? 'bg-safe/20 text-safe' : 'bg-white/5 text-white/40'}`}>{status}</span>
  </div>
);

export default LiveDashboard;
