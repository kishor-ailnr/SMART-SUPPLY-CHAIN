import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null, // null when not logged in
  setUser: (user) => set({ user }),
  
  currentScreen: 'LOGIN', // LOGIN, OVERVIEW, FLIGHT, TWIN
  currentFlightId: null,
  
  setScreen: (screen, flightId = null) => set({ 
    currentScreen: screen, 
    currentFlightId: flightId !== null ? flightId : null 
  }),
  
  flights: [],
  setFlights: (flights) => set({ flights }),
  
  updateFlightPositions: (updates) => set((state) => {
    const newFlights = [...state.flights];
    for (const update of updates) {
      const idx = newFlights.findIndex(f => f.id === update.flight_id);
      if (idx !== -1) {
        newFlights[idx] = { ...newFlights[idx], ...update };
      }
    }
    return { flights: newFlights };
  }),

  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  
  cargoList: [],
  setCargoList: (cargoList) => set({ cargoList })
}));
