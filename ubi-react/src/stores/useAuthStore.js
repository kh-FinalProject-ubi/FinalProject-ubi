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
      regionCity: null, // ✅ 여기도 초기화 필요
      regionDistrict: null,
  
      setAuth: ({
        token,
        address,
        memberName,
        memberStandard,
        memberNo,
        authority,

        regionCity, // ✅ 지역 추가
        regionDistrict,
      }) =>
        set({
          token,
          address,
          memberName,
          memberStandard,
          memberNo,
          authority, // ✅ 지역 추가
          regionCity,
          regionDistrict,

        }),

      clearAuth: () =>
        set({
          token: null,
          address: null,
          memberName: null,
          memberStandard: null,
          memberNo: null,
          authority: null,
          regionCity: null, // ✅ 추가
          regionDistrict: null,

        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
