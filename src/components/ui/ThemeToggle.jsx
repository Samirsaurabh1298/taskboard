import React from 'react'
import { useThemeStore } from '../../store/themeStore.js'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      style={{
        position: 'relative',
        width: 52,
        height: 28,
        borderRadius: 99,
        border: '1px solid var(--border-light)',
        background: isDark ? 'var(--bg-raised)' : 'var(--bg-raised)',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'border-color 0.2s, background 0.2s',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Track icons */}
      <span style={{
        position: 'absolute',
        left: 6,
        fontSize: 11,
        lineHeight: 1,
        opacity: isDark ? 0.4 : 1,
        transition: 'opacity 0.2s',
        userSelect: 'none',
      }}>
        ☀️
      </span>
      <span style={{
        position: 'absolute',
        right: 5,
        fontSize: 11,
        lineHeight: 1,
        opacity: isDark ? 1 : 0.4,
        transition: 'opacity 0.2s',
        userSelect: 'none',
      }}>
        🌙
      </span>

      {/* Sliding knob */}
      <span style={{
        position: 'absolute',
        top: 3,
        left: isDark ? 26 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: isDark ? '#5b6af0' : '#f5a623',
        boxShadow: isDark
          ? '0 0 8px rgba(91,106,240,0.6)'
          : '0 0 8px rgba(245,166,35,0.5)',
        transition: 'left 0.22s cubic-bezier(0.34, 1.46, 0.64, 1), background 0.2s, box-shadow 0.2s',
      }} />
    </button>
  )
}
