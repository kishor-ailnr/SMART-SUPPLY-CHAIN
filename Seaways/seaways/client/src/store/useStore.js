import { create } from 'zustand';

export const useStore = create((set) => ({
  vessels: [],
  selectedVesselId: null,
  riskZones: [],
  alerts: [],
  twinSimulations: {},
  activeTab: 'LIVE', // LIVE | TWIN
  
  setVessels: (vessels) => set({ vessels }),
  updateVessel: (vessel) => set((state) => ({
    vessels: state.vessels.map(v => v.vesselId === vessel.vesselId ? { ...v, ...vessel } : v)
  })),
  setSelectedVesselId: (id) => set({ selectedVesselId: id }),
  setRiskZones: (zones) => set({ riskZones: zones }),
  setAlerts: (alerts) => set({ alerts }),
  updateAlert: (alert) => set((state) => ({
    alerts: state.alerts.map(a => a.id === alert.id ? alert : a)
  })),
  setTwinSimulation: (vesselId, data) => set((state) => ({
    twinSimulations: { ...state.twinSimulations, [vesselId]: data }
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  showAlternateRoute: false,
  setShowAlternateRoute: (val) => set({ showAlternateRoute: val }),
  mapLayer: 'DARK',
  setMapLayer: (mapLayer) => set({ mapLayer }),
}));
