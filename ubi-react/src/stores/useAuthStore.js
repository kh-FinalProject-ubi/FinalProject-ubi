import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: null,
  address: null,
  memberName: null,
  setAuth: ({ token, address, memberName }) =>
    set({ token, address, memberName }),
  clearAuth: () => set({ token: null, address: null, memberName: null }),
}));

export default useAuthStore;
