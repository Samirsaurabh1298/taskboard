import { create } from 'zustand'

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activityOpen: false,
  activeModal: null,      // { type: 'task-form', data: {...} }
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleActivity: () => set(s => ({ activityOpen: !s.activityOpen })),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}))
