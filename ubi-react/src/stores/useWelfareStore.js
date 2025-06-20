import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBenefitStore = create(
  persist(
    (set) => ({
      benefitsData: null,
      setBenefitsData: (data) => set({ benefitsData: data }),
    }),
    {
      name: "benefit-storage",
    }
  )
);

export default useBenefitStore;
