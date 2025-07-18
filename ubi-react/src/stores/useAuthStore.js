import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      // 초기 상태 정의
      token: null,
      address: null,
      memberName: null,
      memberStandard: null,
      memberImg: null,
      memberNickname: null,
      authority: null,
      role: null,
      regionCity: null,
      regionDistrict: null,
      tempRegionCity: null,
      tempRegionDistrict: null,
      memberNo: null, // ✅ 빠졌던 필드 추가

      setAuth: ({
        token,
        address,
        memberName,
        memberStandard,
        memberNickname,
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
          memberNickname,
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
          memberImg: null,
          memberNickname: null,
          authority: null,
          role: null,
          regionCity: null,
          regionDistrict: null,
          tempRegionCity: null,
          tempRegionDistrict: null,
          memberNo: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
