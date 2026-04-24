import React, { useState } from 'react';
import { useStore } from '../store';
import { Navigation, Bell, LogOut, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, setUser, setScreen, currentScreen, notifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    setUser(null);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 border-b border-border-color bg-bg-secondary flex items-center justify-between px-6 z-50 shadow-md relative">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('OVERVIEW')}>
        <Navigation className="text-accent w-6 h-6" />
        <span className="font-display font-bold text-2xl text-accent tracking-widest">AIRWAYS 2.0</span>
      </div>
      
      <div className="flex gap-6 font-display tracking-widest text-sm navtex-text">
        <button 
          onClick={() => setScreen('OVERVIEW')}
          className={`transition-colors uppercase ${currentScreen === 'OVERVIEW' ? 'text-accent underline underline-offset-8' : 'text-text-secondary hover:text-text-primary'}`}
        >
          LIVE TRACKING
        </button>
        <button 
          onClick={() => setScreen('ANALYTICS')}
          className={`transition-colors uppercase ${currentScreen === 'ANALYTICS' ? 'text-accent underline underline-offset-8' : 'text-text-secondary hover:text-text-primary'}`}
        >
          FLEET ANALYTICS
        </button>
        <button 
          onClick={() => setScreen('ADMIN')}
          className={`transition-colors uppercase ${currentScreen === 'ADMIN' ? 'text-accent underline underline-offset-8' : 'text-text-secondary hover:text-text-primary'}`}
        >
          SUPER ADMIN
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs uppercase bg-bg-tertiary px-3 flex items-center py-1 rounded border border-border-color gap-2 cursor-pointer" onClick={() => setScreen('ADMIN')}>
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse"></span>
          {user?.role || 'SUPER_ADMIN'}
        </span>
        <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
          <Bell className="w-5 h-5 text-text-secondary hover:text-text-primary transition-colors" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-emergency text-white text-[9px] font-bold px-1 rounded-full">{unreadCount}</span>}
        </div>
        <button onClick={handleLogout} className="text-text-secondary hover:text-port-red transition-colors ml-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 right-6 w-80 bg-bg-tertiary border border-border-accent shadow-2xl rounded p-2 z-50 max-h-96 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-2 px-2 py-1 border-b border-border-color">
              <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">System Alerts</span>
              <button className="text-[10px] flex items-center gap-1 text-accent hover:text-text-primary"><CheckSquare className="w-3 h-3"/> MARK ALL READ</button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-xs text-text-muted text-center py-4">No new notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-2 border-l-2 mb-1 rounded flex flex-col gap-1 ${n.is_read ? 'border-border-color opacity-50 bg-bg-primary' : 'border-accent bg-bg-hover'}`}>
                  <span className="text-[10px] font-mono text-accent-bright uppercase">{n.type} • {n.created_at}</span>
                  <span className="text-xs">{n.message}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
