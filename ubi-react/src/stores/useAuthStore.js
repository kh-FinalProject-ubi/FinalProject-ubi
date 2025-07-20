import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      // 초기 상태
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
      suspensionNotice: null,  // ✅ 추가

      // 통째로 세팅
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
        regionCity,
        regionDistrict,
        tempRegionCity,
        tempRegionDistrict,
        suspensionNotice, // ✅ 추가
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
          role,
          regionCity,
          regionDistrict,
          tempRegionCity,
          tempRegionDistrict,
          suspensionNotice: suspensionNotice || null,
        }),

      // 부분 업데이트용
      updateAuth: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
        })),

      // suspensionNotice만 따로 변경
      setSuspensionNotice: (value) =>
        set((state) => ({
          ...state,
          suspensionNotice: value,
        })),

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
          suspensionNotice: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
