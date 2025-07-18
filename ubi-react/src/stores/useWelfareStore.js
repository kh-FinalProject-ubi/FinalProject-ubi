import { create } from "zustand";

const useBenefitStore = create((set) => ({
  benefitsData: null,
  lastFetchedAt: null,
  setBenefitsData: (data) =>
    set({
      benefitsData: data,
      lastFetchedAt: new Date().toISOString(), // 마지막 로딩 시간도 저장
    }),
}));

export default useBenefitStore;
