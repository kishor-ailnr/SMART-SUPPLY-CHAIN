import React, { useState } from 'react';
import { useStore } from '../store';
import Navbar from '../components/Navbar';
import { Users, Package, AlertTriangle, Plus, Trash2, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const activeDot = L.divIcon({ html: `<div class="w-4 h-4 bg-accent rounded-full animate-ping"></div><div class="w-4 h-4 bg-accent rounded-full absolute top-0 left-0"></div>`, className: '' });
const checkDot = L.divIcon({ html: `<div class="w-4 h-4 bg-safe border border-bg-primary rounded-full"></div>`, className: '' });
const pendingDot = L.divIcon({ html: `<div class="w-4 h-4 bg-text-secondary border border-bg-primary rounded-full"></div>`, className: '' });

export default function AdminPanel() {
  const { user, cargoList } = useStore();
  const [activeTab, setActiveTab] = useState('CARGO');
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [trackingCargo, setTrackingCargo] = useState(null);

  // Cargo Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: `C-${Math.floor(Math.random() * 10000)}`,
    flight_number: 'AI101',
    aircraft_name: 'Boeing 787',
    origin: 'VIDP',
    destination: 'EGLL',
    cargo_type: 'SECURE',
    weight_kg: 5000,
    volume_cbm: 20.5,
    sender_details: 'Global Logistics Inc.',
    receiver_details: 'UK Freight Ltd.',
    departure_time: new Date().toISOString().slice(0,16),
    eta: new Date(Date.now() + 86400000).toISOString().slice(0,16),
    checkpoints: ['OMDB', 'LIRF', 'LFPG'] // 3 intermediate
  });

  const handleEditCargo = (cargo) => {
    setFormData({
       ...cargo,
       checkpoints: cargo.checkpoints ? cargo.checkpoints.slice(1, -1).map(c => c.checkpoint_name) : ['OMDB', 'LIRF', 'LFPG']
    });
    setIsEditing(true);
    setShowCargoModal(true);
  };

  const handleDeleteCargo = async (id) => {
    if (!confirm('Are you sure you want to delete this cargo record?')) return;
    try {
      const res = await fetch(`http://localhost:6002/api/cargo/${id}`, { method: 'DELETE' });
      if (res.ok) window.location.reload();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleCargoSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:6002/api/cargo/${formData.id}` : 'http://localhost:6002/api/cargo';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          checkpoints: [
            { checkpoint_name: formData.origin, sequence_order: 1, lat: 28.5562, lng: 77.1000 },
            { checkpoint_name: formData.checkpoints[0], sequence_order: 2, lat: 25.2532, lng: 55.3657 },
            { checkpoint_name: formData.checkpoints[1], sequence_order: 3, lat: 41.8003, lng: 12.2389 },
            { checkpoint_name: formData.checkpoints[2], sequence_order: 4, lat: 49.0097, lng: 2.5479 },
            { checkpoint_name: formData.destination, sequence_order: 5, lat: 51.4700, lng: -0.4543 }
          ]
        })
      });
      if (res.ok) {
         setShowCargoModal(false);
         window.location.reload(); 
      }
    } catch (err) {
      alert("Failed to submit cargo");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-bg-secondary border-r border-border-color p-4 flex flex-col gap-2">
          <div className="text-accent font-display text-xl mb-4 font-bold tracking-widest">SUPER ADMIN</div>
          <button 
            onClick={() => setActiveTab('CARGO')}
            className={`flex items-center gap-3 p-3 rounded transition-colors ${activeTab === 'CARGO' ? 'bg-bg-hover text-accent border border-accent border-opacity-30' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
          >
            <Package className="w-5 h-5"/> Cargo Management
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-3 p-3 rounded transition-colors ${activeTab === 'USERS' ? 'bg-bg-hover text-accent border border-accent border-opacity-30' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
          >
            <Users className="w-5 h-5"/> User Access Control
          </button>
          <button 
            onClick={() => setActiveTab('SYSTEM')}
            className={`flex items-center gap-3 p-3 rounded transition-colors ${activeTab === 'SYSTEM' ? 'bg-bg-hover text-accent border border-accent border-opacity-30' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
          >
            <AlertTriangle className="w-5 h-5"/> System Health
          </button>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'CARGO' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-8 border-b border-border-color pb-4">
                <h2 className="text-2xl font-display font-bold tracking-widest">CARGO MANIFEST REGISTRY</h2>
                  <button 
                  onClick={() => {
                    setFormData({
                      id: `C-${Math.floor(Math.random() * 10000)}`,
                      flight_number: 'AI101',
                      aircraft_name: 'Boeing 787',
                      origin: 'VIDP',
                      destination: 'EGLL',
                      cargo_type: 'SECURE',
                      weight_kg: 5000,
                      volume_cbm: 20.5,
                      sender_details: 'Global Logistics Inc.',
                      receiver_details: 'UK Freight Ltd.',
                      departure_time: new Date().toISOString().slice(0,16),
                      eta: new Date(Date.now() + 86400000).toISOString().slice(0,16),
                      checkpoints: ['OMDB', 'LIRF', 'LFPG']
                    });
                    setIsEditing(false);
                    setShowCargoModal(true);
                  }}
                  className="bg-accent text-sky-deep font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-accent-bright transition-colors"
                >
                  <Plus className="w-5 h-5" /> REGISTER NEW CARGO
                </button>
              </div>

              <div className="bg-bg-secondary rounded border border-border-color">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-tertiary border-b border-border-color text-text-secondary uppercase font-mono text-xs">
                    <tr>
                      <th className="p-4">Cargo ID</th>
                      <th className="p-4">Flight</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Weight (KG)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargoList.length === 0 ? (
                      <tr><td colSpan="7" className="p-4 text-center text-text-muted">No cargo records found.</td></tr>
                    ) : (
                      cargoList.map(c => (
                        <tr key={c.id} className="border-b border-border-color hover:bg-bg-hover">
                          <td className="p-4 font-mono text-accent">{c.id}</td>
                          <td className="p-4">{c.flight_number}</td>
                          <td className="p-4">{c.origin} ✈ {c.destination}</td>
                          <td className="p-4">{c.cargo_type}</td>
                          <td className="p-4 font-mono">{c.weight_kg}</td>
                          <td className="p-4"><span className="bg-safe-dim text-safe px-2 py-1 rounded text-xs">{c.status}</span></td>
                          <td className="p-4 flex gap-3 text-text-secondary">
                             <button onClick={() => setTrackingCargo(c)} className="hover:text-accent"><Map className="w-4 h-4"/></button>
                             <button onClick={() => handleEditCargo(c)} className="hover:text-safe text-xs uppercase tracking-widest font-bold">Edit</button>
                             <button onClick={() => handleDeleteCargo(c.id)} className="hover:text-danger"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'USERS' && (
            <div className="flex items-center justify-center h-full text-text-secondary border-2 border-dashed border-border-color rounded-xl">
               USER MANAGEMENT MODULE (In Development)
            </div>
          )}

          {activeTab === 'SYSTEM' && (
            <div className="flex items-center justify-center h-full text-text-secondary border-2 border-dashed border-border-color rounded-xl">
               SERVER HEALTH: OPTIMAL <br/>
               MEMORY: 42%
            </div>
          )}
        </div>
      </div>

      {/* Cargo Registration Modal */}
      {showCargoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-secondary w-full max-w-2xl border border-border-accent rounded-lg shadow-2xl flex flex-col max-h-full"
          >
            <div className="p-4 border-b border-border-color flex justify-between items-center">
              <h3 className="font-display font-bold text-xl text-accent tracking-widest">{isEditing ? 'EDIT CARGO DATA' : 'MANUAL CARGO ENTRY'}</h3>
              <button onClick={() => { setShowCargoModal(false); setIsEditing(false); }} className="text-text-secondary hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCargoSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Cargo Tracking ID (Auto/Manual)</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={isEditing} required/>
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Flight Number</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.flight_number} onChange={e => setFormData({...formData, flight_number: e.target.value})} required/>
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Origin (ICAO)</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm uppercase" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Destination (ICAO)</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm uppercase" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Weight (KG)</label>
                  <input type="number" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Cargo Type</label>
                  <select className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.cargo_type} onChange={e => setFormData({...formData, cargo_type: e.target.value})}>
                     <option>STANDARD</option>
                     <option>PERISHABLE</option>
                     <option>FRAGILE</option>
                     <option>HAZMAT</option>
                     <option>SECURE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Status</label>
                  <select className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.status || 'PENDING'} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option>PENDING</option>
                     <option>IN TRANSIT</option>
                     <option>DELIVERED</option>
                     <option>EXCEPTION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Aircraft Info</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.aircraft_name} onChange={e => setFormData({...formData, aircraft_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Volume (CBM)</label>
                  <input type="number" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.volume_cbm} onChange={e => setFormData({...formData, volume_cbm: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Sender Details</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.sender_details} onChange={e => setFormData({...formData, sender_details: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Receiver Details</label>
                  <input type="text" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.receiver_details} onChange={e => setFormData({...formData, receiver_details: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Departure Time</label>
                  <input type="datetime-local" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-text-secondary mb-1">Expected ETA</label>
                  <input type="datetime-local" className="w-full bg-bg-tertiary border border-border-color rounded p-2 text-sm" value={formData.eta} onChange={e => setFormData({...formData, eta: e.target.value})} />
                </div>
              </div>

              <div className="p-4 bg-bg-tertiary border border-border-color rounded mt-2">
                <span className="text-xs text-text-secondary block mb-2 font-bold uppercase tracking-widest">3 Intermediate Route Checkpoints</span>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" className="w-full bg-bg-primary border border-border-color rounded p-2 text-xs uppercase text-center" value={formData.checkpoints[0]} onChange={e => { const cps=[...formData.checkpoints]; cps[0]=e.target.value; setFormData({...formData, checkpoints: cps}) }} placeholder="WP 1" required />
                  <input type="text" className="w-full bg-bg-primary border border-border-color rounded p-2 text-xs uppercase text-center" value={formData.checkpoints[1]} onChange={e => { const cps=[...formData.checkpoints]; cps[1]=e.target.value; setFormData({...formData, checkpoints: cps}) }} placeholder="WP 2" required />
                  <input type="text" className="w-full bg-bg-primary border border-border-color rounded p-2 text-xs uppercase text-center" value={formData.checkpoints[2]} onChange={e => { const cps=[...formData.checkpoints]; cps[2]=e.target.value; setFormData({...formData, checkpoints: cps}) }} placeholder="WP 3" required />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-accent text-sky-deep font-bold py-3 rounded mt-4 hover:bg-accent-bright transition-colors uppercase tracking-widest">
                {isEditing ? 'Save Changes' : 'Commit to Secure Registry'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Cargo Tracking Map Modal */}
      {trackingCargo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-secondary w-full max-w-5xl h-[80vh] border border-border-accent rounded-lg shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-bg-tertiary">
              <div>
                <h3 className="font-display font-bold text-xl text-accent tracking-widest flex items-center gap-2"><Map className="w-5 h-5"/> CARGO LIVE TRACKING</h3>
                <div className="text-xs text-text-secondary mt-1 font-mono uppercase">ID: {trackingCargo.id} | FLIGHT: {trackingCargo.flight_number} | ROUTE: {trackingCargo.origin} to {trackingCargo.destination}</div>
              </div>
              <button onClick={() => setTrackingCargo(null)} className="text-text-secondary hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
               {/* Map Area */}
               <div className="flex-1 bg-sky-deep relative">
                 <MapContainer center={[trackingCargo.checkpoints?.[2]?.lat || 20, trackingCargo.checkpoints?.[2]?.lng || 40]} zoom={3} className="w-full h-full">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {trackingCargo.checkpoints && (
                      <>
                        <Polyline positions={trackingCargo.checkpoints.map(cp => [cp.lat, cp.lng])} color="#00b4d8" weight={2} dashArray="5, 10" />
                        {trackingCargo.checkpoints.map((cp, i) => (
                           <Marker key={i} position={[cp.lat, cp.lng]} icon={i === 1 ? activeDot : (i < 1 ? checkDot : pendingDot)}>
                             <Popup className="glass-panel font-mono text-xs text-accent uppercase">
                               Waypoint {cp.sequence_order}: {cp.checkpoint_name}
                             </Popup>
                           </Marker>
                        ))}
                      </>
                    )}
                 </MapContainer>
               </div>
               
               {/* Timeline Area */}
               <div className="w-80 border-l border-border-color bg-bg-primary p-6 overflow-y-auto">
                 <h4 className="font-bold text-sm text-text-primary uppercase mb-4 tracking-widest border-b border-border-color pb-2">Journey Timeline</h4>
                 <div className="flex flex-col gap-6 relative">
                    {/* Vertical line */}
                    <div className="absolute top-2 bottom-2 left-2 w-0.5 bg-border-color z-0"></div>
                    
                    {trackingCargo.checkpoints?.map((cp, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10 items-start">
                         <div className={`w-4 h-4 rounded-full mt-1 shrink-0 flex items-center justify-center ${idx === 1 ? 'bg-accent shadow-[0_0_10px_#00b4d8]' : (idx < 1 ? 'bg-safe' : 'bg-bg-tertiary border border-border-color')}`}>
                           {idx < 1 && <span className="text-[8px] text-bg-primary font-bold">✓</span>}
                         </div>
                         <div>
                           <div className={`text-xs font-bold uppercase ${idx === 1 ? 'text-accent' : (idx < 1 ? 'text-safe' : 'text-text-secondary')}`}>{cp.checkpoint_name}</div>
                           <div className="text-[10px] text-text-muted mt-1 uppercase font-mono">
                              STA: {trackingCargo.eta}<br/>
                              {idx === 1 ? 'CURRENT LOCATION' : (idx < 1 ? 'DEPARTED' : 'PENDING')}
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
