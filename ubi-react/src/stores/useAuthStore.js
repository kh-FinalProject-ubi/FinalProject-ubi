import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      address: null,
      memberName: null,
      memberStandard: null,
      authority: null, // ✅ 추가

      setAuth: ({
        token,
        address,
        memberName,
        memberStandard,
        memberNo,
        authority,
      }) =>
        set({
          token,
          address,
          memberName,
          memberStandard,
          memberNo,
          authority,
        }),

      clearAuth: () =>
        set({
          token: null,
          address: null,
          memberName: null,
          memberStandard: null,
          memberNo: null,
          authority: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
