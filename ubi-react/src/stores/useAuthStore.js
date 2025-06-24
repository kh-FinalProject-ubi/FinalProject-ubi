import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      address: null,
      memberName: null,
      memberStandard: null, // ✅ 추가


      setAuth: ({ token, address, memberName, memberStandard, memberNo }) =>
        set({ token, address, memberName, memberStandard, memberNo}),

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
