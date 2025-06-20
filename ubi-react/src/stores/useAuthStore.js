import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      address: null,
      memberName: null,
      setAuth: ({ token, address, memberName }) =>
        set({ token, address, memberName }),
      clearAuth: () => set({ token: null, address: null, memberName: null }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);

export default useAuthStore;
