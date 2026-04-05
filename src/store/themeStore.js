import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
      initTheme: () => {
        applyTheme(get().theme)
      },
    }),
    { name: 'tb-theme', storage: createJSONStorage(() => localStorage) }
  )
)

// Apply theme immediately on module load (before React renders)
applyTheme(useThemeStore.getState().theme)
