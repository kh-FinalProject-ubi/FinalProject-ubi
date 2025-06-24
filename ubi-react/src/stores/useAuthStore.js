import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      address: null,
      memberName: null,
      memberStandard: null, // ✅ 추가

      setAuth: ({ token, address, memberName, memberStandard }) =>
        set({ token, address, memberName, memberStandard }),

      clearAuth: () =>
        set({
          token: null,
          address: null,
          memberName: null,
          memberStandard: null,
          memberNo: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
