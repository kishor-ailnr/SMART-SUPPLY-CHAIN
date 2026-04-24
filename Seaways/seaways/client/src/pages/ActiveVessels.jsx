import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LiveMap from '../components/map/LiveMap';
import { useStore } from '../store/useStore';
import { Ship, AlertTriangle, Wind, Compass, Search, Filter, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ActiveVessels = () => {
  const navigate = useNavigate();
  const { vessels, setVessels, alerts, setAlerts } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6004';
      const res = await axios.get(`${apiUrl}/api/vessels`);
      setVessels(res.data);
      const alertRes = await axios.get(`${apiUrl}/api/alerts`);
      setAlerts(alertRes.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.imo_number.includes(searchTerm)
  );

  const [isAddingVoyage, setIsAddingVoyage] = useState(false);
  const [newVoyage, setNewVoyage] = useState({ name: '', imo: '', from: '', to: '', mid: '', type: 'Container Ship' });

  // Global Navigation System: Great-Circle Path Generation
  const getGreatCirclePath = (start, end, segments = 8) => {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const f = i / segments;
      // Linear interpolation of lat/lng (Simplified Great-Circle for performance)
      const lat = start[1] + (end[1] - start[1]) * f;
      const lng = start[0] + (end[0] - start[0]) * f;
      points.push([lng, lat]);
    }
    return points;
  };

  const handleAddVoyage = async () => {
      const start = [72.82, 18.97]; // Mumbai Default
      const end = [55.27, 25.20]; // Dubai Default
      
      const midPoints = newVoyage.mid.split(';').map(p => {
          const [lat, lng] = p.trim().split(',').map(Number);
          return [lng, lat];
      }).filter(p => !isNaN(p[0]) && !isNaN(p[1]));

      // Connect everything via Great Circle segments
      let fullPath = [];
      const nodes = [start, ...midPoints, end];
      for (let i = 0; i < nodes.length - 1; i++) {
          fullPath = [...fullPath, ...getGreatCirclePath(nodes[i], nodes[i+1], i === 0 ? 10 : 5)];
      }

      const id = Date.now().toString();
      const vessel = {
          id,
          name: newVoyage.name || 'GLOBAL_NAV_VESSEL',
          imo_number: `IMO_${Math.floor(1000000 + Math.random() * 9000000)}`,
          vessel_type: newVoyage.type,
          flag_state: 'INTL',
          lat: start[1],
          lng: start[0],
          sog: 14.8,
          cog: 285,
          riskLevel: 'SAFE',
          voyage: {
              departure_port: newVoyage.from || 'MUMBAI',
              arrival_port: newVoyage.to || 'DUBAI',
              route_key: JSON.stringify(fullPath)
          }
      };
      setVessels([vessel, ...vessels]);
      setIsAddingVoyage(false);
  };

  return (
    <div className="h-screen w-screen bg-[#060d1a] flex relative overflow-hidden">
      {/* Sidebar - Fleet List */}
      <div className="w-96 z-20 flex flex-col glass border-r border-white/10 m-3 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-all">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-display font-bold text-white tracking-widest">FLEET_OPS</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-accent font-mono animate-pulse">
              <span className="w-2 h-2 bg-accent rounded-full" /> LIVE
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text" 
                placeholder="Search Vessel..."
                className="w-full pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddingVoyage(true)}
              className="p-2 bg-accent/20 text-accent rounded-lg border border-accent/30 hover:bg-accent/30 transition-all"
            >
              <Ship size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isAddingVoyage && (
            <div className="p-4 glass border border-accent/30 rounded-xl space-y-3 mb-4 bg-accent/5">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-widest">Manual Voyage Entry</h3>
                  <button onClick={() => setIsAddingVoyage(false)} className="text-white/40 hover:text-white">&times;</button>
                </div>
                <input type="text" placeholder="Vessel Name" className="w-full text-xs" value={newVoyage.name} onChange={e => setNewVoyage({...newVoyage, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="From (Port)" className="w-full text-xs" value={newVoyage.from} onChange={e => setNewVoyage({...newVoyage, from: e.target.value})} />
                    <input type="text" placeholder="To (Port)" className="w-full text-xs" value={newVoyage.to} onChange={e => setNewVoyage({...newVoyage, to: e.target.value})} />
                </div>
                <textarea 
                    placeholder="Checkpoints (lat,lng ; lat,lng ...)" 
                    className="w-full text-[10px] h-20 bg-black/20 border border-white/10 rounded p-2 text-white custom-scrollbar"
                    value={newVoyage.mid}
                    onChange={e => setNewVoyage({...newVoyage, mid: e.target.value})}
                />
                <div className="flex gap-2">
                    <button onClick={handleAddVoyage} className="flex-1 py-2 bg-accent text-[#060d1a] font-bold text-[10px] rounded uppercase shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform">CONNECT_VOYAGE</button>
                </div>
            </div>
          )}
          {filteredVessels.map(v => (
            <motion.div 
               key={v.id}
               whileHover={{ x: 5 }}
               onClick={() => navigate(`/vessel/${v.id}`)}
               className="group glass p-4 rounded-xl border border-white/5 hover:border-accent/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${v.nav_status === 'Underway' ? 'bg-safe-dim text-safe' : 'bg-white/5 text-white/30'}`}>
                    <Ship size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-accent transition-colors">{v.name}</h3>
                    <p className="text-[10px] text-white/40 font-mono">IMO {v.imo_number} // {v.flag_state}</p>
                  </div>
                </div>
                {alerts.some(a => a.vessel_id === v.id && a.severity === 'CRITICAL') && (
                  <AlertTriangle className="text-critical w-4 h-4 animate-bounce" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <p className="text-[8px] text-white/30 uppercase tracking-tighter">Speed Over Ground</p>
                  <p className="text-sm font-mono text-white">{v.sog || '0.0'} <span className="text-[10px] text-white/40">KN</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] text-white/30 uppercase tracking-tighter">Course True</p>
                  <p className="text-sm font-mono text-white">{v.cog || '000'}°</p>
                </div>
              </div>

              {/* Progress Bar (Voyage Placeholder) */}
              <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '45%' }}
                   className="h-full bg-accent" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 relative">
        <LiveMap />
        
        {/* Top Navigation Overlay */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between pointer-events-none">
          <div className="pointer-events-auto">
             {/* Dynamic Stats */}
             <div className="glass px-6 py-3 rounded-xl border border-white/10 flex items-center gap-8 shadow-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full border-2 border-accent/20 flex items-center justify-center p-2">
                   <Compass className="text-accent w-full h-full" />
                 </div>
                 <div>
                   <p className="text-[8px] text-white/40 uppercase tracking-[0.2em]">Global AIS Stream</p>
                   <p className="text-sm font-display text-white italic tracking-widest uppercase">Operational Ready</p>
                 </div>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex gap-10">
                 <div>
                   <p className="text-[8px] text-white/40 uppercase">Vessels Active</p>
                   <p className="text-lg font-mono text-white">{vessels.length}</p>
                 </div>
                 <div>
                   <p className="text-[8px] text-white/40 uppercase">Alerts (24h)</p>
                   <p className="text-lg font-mono text-critical">{alerts.length}</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <button className="glass p-3 rounded-xl text-white/60 hover:text-accent border border-white/10 transition-all">
              <Filter size={20} />
            </button>
            <button onClick={() => window.location.href = import.meta.env.VITE_HUB_URL || 'http://localhost:5000'}
              className="glass px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-accent font-bold text-xs tracking-widest transition-all">
              BACK TO HUB
            </button>
            <button 
              onClick={() => {
                const blob = new Blob([`SEAWAYS OPS REPORT\nGenerated: ${new Date().toISOString()}\nVessels Tracked: ${vessels.length}\nAlerts Active: ${alerts.length}\nStatus: ALL_SYSTEMS_OPERATIONAL`], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `seaways_ops_report_${Date.now()}.txt`;
                a.click();
              }}
              className="glass px-6 py-3 rounded-xl bg-accent text-[#060d1a] font-bold text-xs tracking-widest hover:bg-white transition-all shadow-xl pointer-events-auto"
            >
              EXPORT OPS_REPORT
            </button>
          </div>
        </div>

        {/* Bottom Alert Ticker */}
        <div className="absolute bottom-6 left-6 right-6 z-10 glass border border-critical/20 p-4 rounded-xl flex items-center gap-4 animate-pulse">
           <div className="bg-critical p-2 rounded text-white"><AlertTriangle size={18}/></div>
           <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap flex gap-10">
                {alerts.slice(0, 3).map((a, i) => (
                  <span key={i} className="text-xs font-mono text-white/80">
                    [{a.severity}] {new Date(a.created_at).toLocaleTimeString()} // {a.title}: {a.description}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveVessels;
