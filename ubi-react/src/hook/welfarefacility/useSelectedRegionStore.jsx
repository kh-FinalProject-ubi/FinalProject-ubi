// 📁 src/stores/useSelectedRegionStore.js
import { create } from "zustand";

const useSelectedRegionStore = create((set) => ({
  selectedCity: null,
  selectedDistrict: null,

  // 전체 설정
  setRegion: (city, district) =>
    set({ selectedCity: city, selectedDistrict: district }),

  // 개별 설정
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
}));

export default useSelectedRegionStore;
