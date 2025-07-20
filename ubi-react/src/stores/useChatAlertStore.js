import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatAlertStore = create(
  persist(
    (set, get) => ({
      /* ── 알림 ───────────────────── */
      unreadMap: {},
      alarmOpen: false,

      rooms: [],

      // ✅ 이거 추가
      setRooms: (roomList) => set({ rooms: roomList }),

      selectedRoom: null,
      setSelectedRoom: (room) => set({ selectedRoom: room }),

      incrementUnread: (roomNo) =>
        set((state) => ({
          unreadMap: {
            ...state.unreadMap,
            [roomNo]: (state.unreadMap[roomNo] || 0) + 1,
          },
        })),

      clearUnread: (roomNo) =>
        set((s) => {
          const { [roomNo]: _, ...rest } = s.unreadMap;
          return { unreadMap: rest };
        }),

      openAlarm: () => set({ alarmOpen: true }),
      closeAlarm: () => set({ alarmOpen: false }),
    }),
    { name: "chat-alert" }
  )
);

// ✅ totalUnread selector
export const useTotalUnread = () =>
  useChatAlertStore((state) =>
    Object.values(state.unreadMap).reduce((a, b) => a + b, 0)
  );

export default useChatAlertStore;
