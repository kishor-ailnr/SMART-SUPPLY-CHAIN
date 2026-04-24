import { create } from 'zustand';

const useStore = create((set) => ({
  vehicles: [],
  selectedVehicle: null,
  alerts: [],
  user: { name: 'Admin User', role: 'SUPER_ADMIN' },
  isSidebarOpen: true,
  mapMode: 'NH', // 'NH', 'SH', 'SATELLITE', 'WEATHER'

  setVehicles: (vehicles) => set({ vehicles }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  setMapMode: (mode) => set({ mapMode: mode }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  updateVehiclePosition: (id, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
  }))
}));

export default useStore;
