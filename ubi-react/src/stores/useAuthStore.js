import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      address: null,
      memberName: null,
      memberStandard: null,
      memberImg: null,
      authority: null,
      role: null, // ✅ 추가
      regionCity: null, // ✅ 여기도 초기화 필요
      regionDistrict: null,
      tempRegionCity: null, // ✅ 추가
      tempRegionDistrict: null, // ✅ 추가

      setAuth: ({
        token,
        address,
        memberName,
        memberStandard,
        memberNo,
        memberImg,
        authority,
        role,
        regionCity, // ✅ 지역 추가
        regionDistrict,
        tempRegionCity, // ✅ 추가
        tempRegionDistrict, // ✅ 추가
      }) =>
        set({
          token,
          address,
          memberName,
          memberStandard,
          memberNo,
          memberImg,
          authority,
          role, // ✅ 지역 추가
          regionCity,
          regionDistrict,
          tempRegionCity, // ✅ 추가
          tempRegionDistrict, // ✅ 추가
        }),

      clearAuth: () =>
        set({
          token: null,
          address: null,
          memberName: null,
          memberStandard: null,
          memberNo: null,
          memberImg: null,
          authority: null,
          role: null,
          regionCity: null, // ✅ 추가
          regionDistrict: null,
          tempRegionCity: null, // ✅ 추가
          tempRegionDistrict: null, // ✅ 추가
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
