import { create } from "zustand";

const useWelfareStore = create((set) => ({
  districts: [], // [districtA, districtB]
  layers: new Map(),
  setDistricts: (newDistricts) => set({ districts: newDistricts }),
  setLayer: (name, layer) =>
    set((state) => {
      const updated = new Map(state.layers);
      updated.set(name, layer);
      return { layers: updated };
    }),
  removeLayer: (name) =>
    set((state) => {
      const updated = new Map(state.layers);
      updated.delete(name);
      return { layers: updated };
    }),
  clearAll: () => set({ districts: [], layers: new Map() }),
}));

export default useWelfareStore;
