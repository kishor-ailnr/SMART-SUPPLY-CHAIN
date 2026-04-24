import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Zap, Navigation2, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const QUICK_PROMPTS = [
  { icon: Navigation2, text: 'Fastest route to Mumbai?' },
  { icon: TrendingUp,  text: 'Predict congestion next 30 min' },
  { icon: AlertTriangle, text: 'Why is NH48 congested?' },
  { icon: Zap,         text: 'Best departure time today?' },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen]   = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'ROADWAYS AI Core online. I can help with route optimization, congestion prediction, and fleet intelligence. How can I assist?' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef             = useRef();

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:6001/api/chat', { message: msg });
      setMessages(p => [...p, { role: 'assistant', text: res.data.reply, source: res.data.source }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: 'Signal disrupted. Reconnecting to intelligence network...', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 60, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-80 h-[480px] rounded-2xl flex flex-col overflow-hidden border border-accent/25 shadow-[0_0_40px_rgba(0,229,255,0.15)]"
            style={{ background: 'rgba(5,7,15,0.96)', backdropFilter: 'blur(16px)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-accent/15"
              style={{ background: 'rgba(0,229,255,0.04)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center"
                  style={{ boxShadow: '0 0 10px rgba(0,229,255,0.2)' }}>
                  <Bot size={13} className="text-accent" />
                </div>
                <div>
                  <div className="font-hud text-[11px] font-semibold text-accent tracking-widest uppercase">AI Traffic Core</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                    <span className="font-mono text-[8px] text-safe/70 uppercase">Gemini Neural Link Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                className="text-accent/40 hover:text-accent transition-colors p-1 rounded-lg hover:bg-accent/8">
                <X size={14} />
              </button>
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 border-b border-accent/10">
                <div className="font-mono text-[8px] text-accent/30 uppercase tracking-widest mb-1.5">Quick queries</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
                    <button key={text} onClick={() => send(text)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-accent/15 hover:border-accent/40 hover:bg-accent/5 text-left transition-all group">
                      <Icon size={9} className="text-accent/40 group-hover:text-accent shrink-0 transition-colors" />
                      <span className="font-mono text-[8px] text-accent/50 group-hover:text-accent/80 transition-colors leading-tight">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2.5 rounded-xl font-data text-[10px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-bg-primary font-semibold rounded-br-sm'
                      : `border rounded-bl-sm ${msg.isError ? 'border-danger/30 text-danger/80 bg-danger/5' : 'border-accent/15 text-accent/80 bg-accent/4'}`
                  }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #00e5ff, #00b8d4)', boxShadow: '0 0 12px rgba(0,229,255,0.3)' } : {}}>
                    {msg.text}
                    {msg.source && (
                      <div className="mt-1.5 pt-1.5 border-t border-current/10 font-mono text-[7px] opacity-40 uppercase tracking-wide">
                        Source: {msg.source}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="border border-accent/15 rounded-xl rounded-bl-sm px-3 py-2.5 flex gap-1.5 items-center bg-accent/4">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                        className="w-1.5 h-1.5 rounded-full bg-accent" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); send(); }}
              className="px-3 py-2.5 flex gap-2 border-t border-accent/10"
              style={{ background: 'rgba(5,7,15,0.6)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask route, traffic, predictions..."
                className="flex-1 bg-black/40 border border-accent/20 focus:border-accent rounded-lg px-3 py-2 font-data text-[10px] text-accent outline-none transition-all placeholder:text-accent/25 focus:shadow-[0_0_10px_rgba(0,229,255,0.1)]"
              />
              <motion.button type="submit" disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.35)' }}>
                <Send size={13} className="text-accent" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(0,229,255,0.5)' }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(v => !v)}
        className="w-12 h-12 rounded-full flex items-center justify-center relative border"
        style={{
          background: isOpen ? 'rgba(220,38,38,0.15)' : 'rgba(0,229,255,0.12)',
          borderColor: isOpen ? 'rgba(220,38,38,0.5)' : 'rgba(0,229,255,0.4)',
          boxShadow: isOpen ? '0 0 20px rgba(220,38,38,0.3)' : '0 0 0px rgba(0,0,0,0)',
        }}
      >
        {!isOpen && <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-40" />}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={18} className="text-critical" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={18} className="text-accent" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
