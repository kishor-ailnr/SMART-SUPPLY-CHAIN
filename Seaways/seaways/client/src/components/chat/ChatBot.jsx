import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User } from 'lucide-react';
import axios from 'axios';

const RobotIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
    {/* Antenna */}
    <rect x="48" y="10" width="4" height="15" fill="currentColor" />
    <circle cx="50" cy="8" r="6" className="text-accent animate-pulse" fill="currentColor" />
    {/* Head shape */}
    <rect x="20" y="25" width="60" height="55" rx="10" fill="transparent" stroke="currentColor" strokeWidth="6" />
    <path d="M 10 40 L 20 40 M 80 40 L 90 40" stroke="currentColor" strokeWidth="6" />
    {/* Eyes */}
    <circle cx="35" cy="50" r="5" className="animate-[pulse_4s_ease-in-out_infinite]" fill="currentColor" />
    <circle cx="65" cy="50" r="5" className="animate-[pulse_4s_ease-in-out_infinite]" fill="currentColor" />
    {/* Mouth */}
    <path d="M 40 65 Q 50 70 60 65" stroke="currentColor" strokeWidth="4" fill="transparent" />
  </svg>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'SEAWAYS Central Core Online. I have full context of active vessels and predictive patterns. How can I assist you?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Communication failure with Central Core.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1001] font-inter">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-6 w-[400px] h-[550px] glass-panel flex flex-col overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-ocean-900/90"
          >
            {/* Header */}
            <div className="p-4 bg-ocean-800 border-b border-white/10 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 text-accent bg-accent/10 rounded border border-accent/30 p-1 flex items-center justify-center">
                  <RobotIcon />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white">SEAWAYS Agent</h4>
                  <p className="text-[10px] text-safe font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-safe rounded-full animate-pulse" /> Linked to Gemini
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${m.role === 'user' ? 'bg-accent/10 border-accent/30' : 'bg-ocean-800 border-white/10'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4 text-accent" /> : <div className="w-5 h-5 text-accent"><RobotIcon /></div>}
                  </div>
                  <div className={`p-3 rounded-lg text-[11px] leading-relaxed max-w-[80%] ${m.role === 'user' ? 'bg-accent border border-accent text-ocean-900 font-medium font-mono' : 'bg-ocean-800 border border-white/10 text-white/90'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-ocean-800 border border-white/10 flex items-center justify-center text-accent">
                    <div className="w-5 h-5"><RobotIcon /></div>
                  </div>
                  <div className="p-3 bg-ocean-800 border border-white/10 rounded-lg flex items-center gap-1">
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-ocean-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about risks, ETAs, or routes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-ocean-900 border border-white/10 rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-accent text-white font-mono placeholder:text-white/30"
                />
                <button 
                  onClick={handleSend}
                  className="p-3 bg-accent text-ocean-900 rounded-lg hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-ocean-800 border border-accent/50 text-accent flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(0,212,255,0.2)] hover:scale-105 hover:bg-ocean-700 hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all cursor-pointer p-3 group relative"
        >
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-danger rounded-full border-2 border-ocean-900 animate-pulse" />
          <RobotIcon />
        </button>
      )}
    </div>
  );
};

export default ChatBot;
