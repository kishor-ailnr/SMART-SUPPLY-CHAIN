import React from 'react';
import { Ship, Plane, Truck, Train, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const transportModes = [
  {
    id: 'seaways',
    name: 'Seaways',
    description: 'Maritime Logistics & Port Operations',
    icon: <Ship size={32} />,
    image: '/seaways.png',
    url: import.meta.env.VITE_SEAWAYS_URL || 'http://localhost:5004', 
    color: '#00d2ff'
  },
  {
    id: 'airways',
    name: 'Airways',
    description: 'Global Air Freight & Aviation Intelligence',
    icon: <Plane size={32} />,
    image: '/airways.png',
    url: import.meta.env.VITE_AIRWAYS_URL || 'http://localhost:5002', 
    color: '#ff00cc'
  },
  {
    id: 'roadways',
    name: 'Roadways',
    description: 'Smart Surface Transport & Fleet Management',
    icon: <Truck size={32} />,
    image: '/roadways.png',
    url: import.meta.env.VITE_ROADWAYS_URL || 'http://localhost:5001', 
    color: '#ffd700'
  },
  {
    id: 'railways',
    name: 'Railways',
    description: 'Next-Gen Rail Networks & Cargo Sync',
    icon: <Train size={32} />,
    image: '/railways.png',
    url: import.meta.env.VITE_RAILWAYS_URL || 'http://localhost:5003', 
    color: '#00ff88'
  }
];

function App() {
  return (
    <div className="dashboard-container">
      <header className="header">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '1rem', 
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box size={48} color="#fff" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Nexus Transport Hub
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Unified Logistics Intelligence Platform. Access and manage your global transportation network from a single command center.
        </motion.p>
      </header>

      <div className="grid">
        {transportModes.map((mode, index) => (
          <motion.a
            key={mode.id}
            href={mode.url}
            className="card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <img src={mode.image} alt={mode.name} className="card-image" />
            <div className="card-overlay" />
            <div className="card-content">
              <div className="card-icon" style={{ color: mode.color }}>
                {mode.icon}
              </div>
              <h2>{mode.name}</h2>
              <p>{mode.description}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <footer style={{ marginTop: '5rem', opacity: 0.5, fontSize: '0.875rem' }}>
        <p>&copy; 2026 Nexus Transport Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
