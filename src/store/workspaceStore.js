import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
    }),
    { name: 'tb-workspace' }
  )
)
