import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Anchor, Compass, Shield, Ship, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email || 'admin@seaways.com', password || 'admin123'); // Default to demo if empty for convenience
      navigate('/');
    } catch (err) {
      setError('AUTHENTICATION_FAILURE: Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-[#060d1a] overflow-hidden flex items-center justify-center">
      {/* Top Left Hub Button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => window.location.href = 'http://localhost:5000'}
          className="glass px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-accent hover:border-accent font-bold text-[10px] tracking-widest uppercase transition-all">
          Nexus Hub
        </button>
      </div>
      {/* Background Animation: Animated Sea Lane Network */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-px h-[50vh] bg-accent blur-sm animate-pulse" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-accent/30 blur-sm" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-accent/30 blur-sm" />
        
        {/* Radar Sweep Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] radar-sweep rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass border border-accent/20 p-8 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,212,255,0.1)]"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-accent/10 p-4 rounded-full border border-accent/30 mb-4">
            <Compass className="w-12 h-12 text-accent animate-[spin_10s_linear_infinite]" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-[0.2em] text-white">SEAWAYS 2.0</h1>
          <p className="text-accent text-[10px] tracking-[0.5em] uppercase mt-2">Maritime Vessel Intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50 px-1">Access Protocol (Email)</label>
            <input 
              type="email" 
              className="w-full bg-tertiary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent outline-none transition-all font-mono"
              placeholder="vessel.operator@seaways.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/50 px-1">Security Key (Password)</label>
            <input 
              type="password" 
              className="w-full bg-tertiary/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-accent outline-none transition-all font-mono"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-critical/10 border border-critical/30 text-critical text-[10px] p-3 rounded-lg font-mono uppercase tracking-widest mb-4 animate-shake">
               {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full group relative overflow-hidden bg-accent text-[#060d1a] font-bold py-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <>INITIATE COMMAND CENTRE <Shield className="w-4 h-4" /></>}
            </span>
            {!loading && <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />}
          </button>
        </form>

        <div className="mt-8 flex justify-between items-center text-[10px] text-white/30 tracking-widest px-1 border-t border-white/10 pt-6">
          <div className="flex items-center gap-1"><Ship size={12}/> {10} TRACKED</div>
          <div className="flex items-center gap-1"><Compass size={12}/> UTC 0.0.0</div>
          <div className="flex items-center gap-1"><Shield size={12}/> V2.0.0 READY</div>
        </div>
      </motion.div>

      {/* Floating Vessel Markers (Decoration) */}
      {[...Array(5)].map((_, i) => (
        <motion.div
           key={i}
           animate={{ 
             x: [0, (i % 2 === 0 ? 100 : -100)],
             y: [0, (i % 3 === 0 ? 50 : -50)]
           }}
           transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
           className="absolute opacity-10"
           style={{ top: `${20 + i * 15}%`, left: `${10 + i * 20}%` }}
        >
          <Ship size={32} className="text-accent" />
        </motion.div>
      ))}
    </div>
  );
};

export default Login;
