import { create } from "zustand";

const useModalStore = create((set) => ({
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  alertMessage: "", // 알림 메시지 상태 추가
  setAlertMessage: (msg) => set({ alertMessage: msg }),
  clearAlertMessage: () => set({ alertMessage: "" }),
}));

export default useModalStore;
