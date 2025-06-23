// 📁 src/stores/useSelectedRegionStore.js
import { create } from "zustand";

const useSelectedRegionStore = create((set) => ({
  selectedCity: null,
  selectedDistrict: null,
  setRegion: (city, district) =>
    set({ selectedCity: city, selectedDistrict: district }),
}));

export default useSelectedRegionStore;
