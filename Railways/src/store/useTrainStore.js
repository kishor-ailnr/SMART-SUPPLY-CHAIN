import { create } from 'zustand';

const useTrainStore = create((set) => ({
  trains: [],
  selectedTrainId: null,
  wsConnected: false,
  setTrains: (trains) => set({ trains }),
  updateTrainPositions: (positions) => set((state) => {
    const updatedTrains = state.trains.map(t => {
      const pos = positions.find(p => p.id === t.id);
      return pos ? { ...t, lat: pos.lat, lng: pos.lng, speed: pos.speed, heading: pos.heading, delay: pos.delay } : t;
    });
    return { trains: updatedTrains };
  }),
  setSelectedTrainId: (id) => set({ selectedTrainId: id }),
  setWsConnected: (connected) => set({ wsConnected: connected })
}));

export default useTrainStore;
