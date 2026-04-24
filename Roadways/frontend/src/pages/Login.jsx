import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Shield, Lock, Eye, EyeOff, Radio, Activity } from 'lucide-react';

/* Floating particle dot */
function Particle({ i }) {
  const x  = Math.random() * 100;
  const y  = Math.random() * 100;
  const dur= 15 + Math.random() * 30;
  const sz = 1 + Math.random() * 2;
  return (
    <motion.div
      style={{ left: `${x}%`, top: `${y}%`, width: sz, height: sz }}
      animate={{ x: [0, Math.random() * 80 - 40, 0], y: [0, Math.random() * 80 - 40, 0], opacity: [0.3, 0.9, 0.3] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
      className="absolute rounded-full bg-accent"
    />
  );
}

export default function Login() {
  const [email, setEmail]       = useState('admin@roadways.in');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [time, setTime]         = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/overview'), 1400);
  };

  const STATUS_ITEMS = [
    { label: 'AES-256 ENCRYPTED', icon: Shield, ok: true },
    { label: 'NHINET NODE ONLINE', icon: Radio,  ok: true },
    { label: 'ALL AGENTS ACTIVE',  icon: Activity, ok: true },
  ];

  return (
    <div className="relative h-screen w-screen bg-bg-primary flex items-center justify-center overflow-hidden hud-grid">
      {/* Top Left Hub Button */}
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => window.location.href = 'http://localhost:5000'}
          className="glass px-4 py-2 rounded-lg border border-accent/25 text-accent/50 hover:text-accent hover:border-accent font-hud text-[10px] tracking-widest uppercase transition-all">
          Nexus Hub
        </button>
      </div>

      {/* ── Ambient radial glow ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => <Particle key={i} i={i} />)}
      </div>

      {/* ── Radar sweep background ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-full h-full rounded-full border border-accent/30"
          style={{ background: 'conic-gradient(from 0deg, transparent 270deg, rgba(0,229,255,0.15) 360deg)' }}
        />
        {[300, 500, 700].map(r => (
          <div key={r} style={{ width: r, height: r, top: '50%', left: '50%', transform: `translate(-50%,-50%)` }}
            className="absolute rounded-full border border-accent/10" />
        ))}
      </div>

      {/* ── IST Clock top-right ── */}
      <div className="absolute top-6 right-8 text-right pointer-events-none">
        <div className="font-data text-accent text-lg tracking-widest">{time} IST</div>
        <div className="font-mono text-[9px] text-accent/50 uppercase tracking-widest mt-0.5">National Highway Intelligence Network</div>
      </div>

      {/* ── Login card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* card border glow */}
        <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-accent/30 via-transparent to-accent/10 pointer-events-none" />
        <div className="glass rounded-xl p-8 shadow-glass relative overflow-hidden">
          {/* scan-line effect */}
          <motion.div
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent pointer-events-none"
            style={{ position: 'absolute' }}
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8 select-none">
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(0,229,255,0.3)', '0 0 40px rgba(0,229,255,0.5)', '0 0 20px rgba(0,229,255,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/40 flex items-center justify-center mb-4"
            >
              <Truck size={30} className="text-accent" />
            </motion.div>
            <h1 className="font-hud text-4xl font-bold text-accent tracking-widest uppercase"
              style={{ textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>
              ROADWAYS 2.0
            </h1>
            <p className="font-mono text-[10px] text-accent/60 uppercase tracking-[0.3em] mt-1">
              India Freight Intelligence Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-accent/70 uppercase tracking-widest">Access Terminal</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50" size={14} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-accent/25 hover:border-accent/50 focus:border-accent rounded-lg py-3 pl-10 pr-4 font-data text-xs text-accent outline-none transition-all placeholder:text-accent/30 focus:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                  placeholder="EMAIL@DOMAIN.IN"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-accent/70 uppercase tracking-widest">Security Key</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/50" size={14} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-accent/25 hover:border-accent/50 focus:border-accent rounded-lg py-3 pl-10 pr-10 font-data text-xs text-accent outline-none transition-all placeholder:text-accent/30 focus:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                  placeholder="••••••••••"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-accent/40 hover:text-accent transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: '0 0 30px rgba(0,229,255,0.4)', borderColor: 'rgba(0,229,255,0.8)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 py-3.5 rounded-lg font-hud text-sm font-bold tracking-widest uppercase relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(0,229,255,0.05))', border: '1px solid rgba(0,229,255,0.5)', color: '#00e5ff', boxShadow: '0 0 0px rgba(0,0,0,0)' }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full" />
                    Authenticating...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Initialize Tracking Core →
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Status bar */}
          <div className="mt-6 pt-5 border-t border-accent/10 flex justify-between items-center">
            {STATUS_ITEMS.map(({ label, icon: Icon, ok }) => (
              <span key={label} className="flex items-center gap-1 font-mono text-[8px] text-accent/50 uppercase tracking-tight">
                <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-safe animate-pulse' : 'bg-critical'}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        <span className="font-mono text-[9px] text-accent/30 uppercase tracking-widest">
          Ministry of Road Transport & Highways · Data Node 04 · NHINET v2.0
        </span>
      </div>
    </div>
  );
}
