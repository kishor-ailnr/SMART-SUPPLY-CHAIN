import React from 'react';
import Navbar from '../components/Navbar';
import { useStore } from '../store';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Droplet, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fuelData = [
  { time: '00:00', fuel: 4000, optimized: 3800 },
  { time: '04:00', fuel: 8000, optimized: 7500 },
  { time: '08:00', fuel: 15000, optimized: 13200 },
  { time: '12:00', fuel: 22000, optimized: 19600 },
  { time: '16:00', fuel: 28000, optimized: 24500 },
  { time: '20:00', fuel: 32000, optimized: 28000 },
  { time: '24:00', fuel: 38000, optimized: 32000 },
];

const cargoPerformanceData = [
  { route: 'DEL-LHR', onTime: 92, delayed: 8 },
  { route: 'BOM-JFK', onTime: 88, delayed: 12 },
  { route: 'MAA-DXB', onTime: 95, delayed: 5 },
  { route: 'BLR-FRA', onTime: 90, delayed: 10 },
];

const predictEtaData = [
  { checkpoint: 'Origin', baseline: 0, actual: 0 },
  { checkpoint: 'WP1', baseline: 2.5, actual: 2.4 },
  { checkpoint: 'WP2', baseline: 5.0, actual: 5.2 },
  { checkpoint: 'WP3', baseline: 7.5, actual: 7.4 },
  { checkpoint: 'Dest', baseline: 10.0, actual: 9.8 },
];

export default function Analytics() {
  const { flights } = useStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      <Navbar />
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex justify-between items-end">
           <div>
             <h1 className="text-3xl font-display font-bold tracking-widest text-accent mb-1">FLEET ANALYTICS & INTELLIGENCE</h1>
             <p className="text-sm text-text-secondary uppercase">Real-time predictive insights powered by Gemini AI</p>
           </div>
           <div className="flex gap-4">
             <div className="bg-bg-secondary border border-border-color p-3 rounded text-center">
               <div className="text-xs text-text-secondary uppercase mb-1">Active Fleet</div>
               <div className="text-xl font-bold font-mono text-safe">{flights.length}</div>
             </div>
             <div className="bg-bg-secondary border border-border-color p-3 rounded text-center">
               <div className="text-xs text-text-secondary uppercase mb-1">Global Efficiency</div>
               <div className="text-xl font-bold font-mono text-accent">94.2%</div>
             </div>
           </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-bg-secondary border-l-4 border-accent p-4 rounded flex gap-4 items-start shadow-lg">
           <Zap className="text-accent w-6 h-6 shrink-0 mt-1" />
           <div>
             <h3 className="font-bold text-accent uppercase tracking-widest text-sm mb-1">AI Route Optimization Detected</h3>
             <p className="text-sm text-text-primary">
               Redirecting FLIGHT AI101 to Waypoint LIRF and adjusting cruise altitude to FL390 will bypass the incoming severe weather front, resulting in an estimated <b>14% fuel saving (approx. $4,200)</b> and maintaining original ETA.
             </p>
           </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-[400px]">
          
          {/* Fuel Consumption */}
          <div className="bg-bg-secondary border border-border-color rounded p-4 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-accent" /> Fuel Consumption vs AI Optimized (Liters)
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef233c" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef233c" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dc653" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2dc653" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#37474f" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#37474f" fontSize={10} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#101828" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: '#00b4d8' }} itemStyle={{ color: '#caf0f8' }}/>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Area type="monotone" dataKey="fuel" name="Standard Burn" stroke="#ef233c" fillOpacity={1} fill="url(#colorFuel)" />
                  <Area type="monotone" dataKey="optimized" name="AI Optimized Burn" stroke="#2dc653" fillOpacity={1} fill="url(#colorOpt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictive ETA */}
          <div className="bg-bg-secondary border border-border-color rounded p-4 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Predictive ETA Journey Maps (Hours)
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictEtaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="checkpoint" stroke="#37474f" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#37474f" fontSize={10} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#101828" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: '#00b4d8' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Line type="stepAfter" dataKey="baseline" name="Baseline ETA" stroke="#90a4ae" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" name="Live AI Prediction" stroke="#00b4d8" strokeWidth={3} dot={{ r: 4, fill: '#00b4d8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cargo Performance */}
          <div className="bg-bg-secondary border border-border-color rounded p-4 flex flex-col col-span-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" /> Cargo Delivery Metrics by Sector (%)
            </h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cargoPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="route" stroke="#37474f" fontSize={10} tickMargin={10} />
                  <YAxis stroke="#37474f" fontSize={10} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#101828" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1220', borderColor: '#00b4d8' }} cursor={{fill: '#101828'}} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Bar dataKey="onTime" name="On Time Delivery" fill="#2dc653" stackId="a" />
                  <Bar dataKey="delayed" name="Delayed/Rerouted" fill="#ff6b35" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
