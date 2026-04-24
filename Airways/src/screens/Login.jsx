import React, { useState } from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Compass, PlaneTakeoff, ShieldAlert, Cpu } from 'lucide-react';

export default function Login() {
  const setUser = useStore((state) => state.setUser);
  const setScreen = useStore((state) => state.setScreen);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setUser({ email, role: 'SUPER_ADMIN' });
      setScreen('OVERVIEW');
    }
  };

  return (
    <div className="min-h-screen bg-sky-deep text-text-primary flex items-center justify-center relative overflow-hidden">
      {/* Top Left Hub Button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => window.location.href = 'http://localhost:5000'}
          className="glass-panel px-4 py-2 rounded border border-white/10 text-white/50 hover:text-accent hover:border-accent font-bold text-xs tracking-widest uppercase transition-all">
          BACK TO HUB
        </button>
      </div>
      {/* Background Animated Globals / Radar Mockup */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="w-[800px] h-[800px] border-2 border-accent-border rounded-full border-t-accent"
        />
        <div className="absolute w-[600px] h-[600px] border border-accent-border rounded-full opacity-50" />
        <div className="absolute w-[400px] h-[400px] border border-accent-border rounded-full opacity-30" />
        <div className="absolute w-px h-full bg-accent-border" />
        <div className="absolute h-px w-full bg-accent-border" />
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-10 rounded-xl shadow-2xl z-10 w-full max-w-md relative"
      >
        <div className="flex flex-col items-center mb-8">
          <Compass className="w-16 h-16 text-accent mb-4" />
          <h1 className="font-display font-bold text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-bright">
            AIRWAYS 2.0
          </h1>
          <p className="text-text-secondary text-sm mt-2 uppercase tracking-widest text-center">
            Every Sky. Every Flight. <br/>Predicted. Protected.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase text-text-secondary tracking-wider mb-2">Operator Identity</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="user@airways.local"
            />
          </div>
          <div>
            <label className="block text-xs uppercase text-text-secondary tracking-wider mb-2">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-md px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-bright text-sky-deep font-bold py-3 px-4 rounded-md uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <PlaneTakeoff className="w-5 h-5" /> Initialize System
          </button>
        </form>

        <div className="mt-8 flex justify-between items-center text-[10px] text-text-muted uppercase tracking-widest border-t border-border-color pt-4">
          <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-safe" /> AES-256</span>
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-accent" /> AI ACTIVE</span>
          <span>v2.0.0</span>
        </div>
      </motion.div>
    </div>
  );
}
