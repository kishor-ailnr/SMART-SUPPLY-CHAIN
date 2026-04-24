import { create } from 'zustand';

const useStore = create((set, get) => ({
  // WebSocket connection
  ws: null,
  wsConnected: false,
  setWs: (ws) => set({ ws }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  
  // Flight data
  flights: [],
  selectedFlightId: null,
  setFlights: (flights) => set({ flights }),
  setSelectedFlight: (id) => set({ selectedFlightId: id }),
  
  // Vehicle data
  vehicles: [],
  selectedVehicleId: null,
  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedVehicle: (id) => set({ selectedVehicleId: id }),
  
  // Cargo data
  cargoShipments: [],
  iotAlerts: [],
  setCargoShipments: (cargo) => set({ cargoShipments: cargo }),
  addIotAlert: (alert) => set(state => ({ iotAlerts: [alert, ...state.iotAlerts].slice(0, 100) })),
  
  // Map state
  mapView: '2D',
  mapLayers: {
    flights: true, vehicles: true, checkpoints: true,
    geofences: false, weather: false, sigmets: true, notams: false
  },
  setMapView: (view) => set({ mapView: view }),
  toggleLayer: (layer) => set(state => ({
    mapLayers: { ...state.mapLayers, [layer]: !state.mapLayers[layer] }
  })),
  
  // Chatbot
  chatOpen: false,
  chatHistory: [],
  chatLoading: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  addChatMessage: (msg) => set(state => ({ chatHistory: [...state.chatHistory, msg] })),
  setChatLoading: (loading) => set({ chatLoading: loading }),
  
  // Security alerts
  securityAlerts: [],
  addSecurityAlert: (alert) => set(state => ({
    securityAlerts: [alert, ...state.securityAlerts].slice(0, 50)
  })),
  
  // UI state
  activeBottomTab: 'flights',
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

export default useStore;
