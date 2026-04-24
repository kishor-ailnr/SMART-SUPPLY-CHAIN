import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Train, Activity, Eye, FileText } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/overview');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg-primary text-text-primary">
      {/* Top Left Hub Button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => window.location.href = 'http://localhost:5000'}
          className="glass-panel px-4 py-2 rounded border border-rail-border text-white/50 hover:text-rail-accent hover:border-rail-accent font-mono text-[10px] tracking-widest uppercase transition-all">
          Nexus Hub
        </button>
      </div>
      {/* Background Cinematic Video/Simulation Mockup */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
        {/* Placeholder track lines mimicking major railways */}
        <div className="absolute w-[80%] h-[80%] border border-track-steel rounded-full animate-pulse-slow"></div>
        <div className="absolute w-[60%] h-[60%] border border-track-dfc rounded-full animate-pulse-slow delay-700"></div>
        <div className="absolute w-[40%] h-[40%] border border-track-electric rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-10 rounded-2xl w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <Train className="w-16 h-16 text-rail-accent mb-4 animate-bounce" />
            <h1 className="text-4xl font-display font-bold tracking-widest text-center">RAILWAYS 2.0</h1>
            <p className="text-text-secondary text-sm mt-2 font-mono text-center">Every Track. Every Train. Predicted. Protected.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-mono text-text-muted mb-1 block">USER CLEARANCE (EMAIL)</label>
              <input type="email" defaultValue="admin@railways2.gov.in" className="w-full bg-bg-tertiary border border-rail-border p-3 rounded font-mono text-white focus:outline-none focus:border-rail-accent" />
            </div>
            <div>
              <label className="text-xs font-mono text-text-muted mb-1 block">PASSCODE</label>
              <input type="password" defaultValue="********" className="w-full bg-bg-tertiary border border-rail-border p-3 rounded font-mono text-white focus:outline-none focus:border-rail-accent" />
            </div>
            <button type="submit" className="mt-4 bg-rail-accent text-bg-primary font-bold py-3 px-4 rounded hover:bg-yellow-500 transition-colors tracking-widest">
              INITIALIZE COMMAND CENTER
            </button>
          </form>

          {/* Animated Signal Lights */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-signal-red signal-animate" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 rounded-full bg-signal-yellow signal-animate" style={{animationDelay: '0.5s'}}></div>
            <div className="w-3 h-3 rounded-full bg-signal-green signal-animate" style={{animationDelay: '1s'}}></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
