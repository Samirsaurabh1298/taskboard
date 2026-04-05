import React from 'react'
export { ThemeToggle } from './ThemeToggle.jsx'

// ── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, icon, style, ...props }) {
  const styles = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font-body)', fontWeight: 500, cursor: 'pointer',
    border: 'none', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
    ...(size === 'sm' ? { padding: '5px 12px', fontSize: '12px' } : { padding: '8px 16px', fontSize: '13px' }),
    ...(variant === 'primary' ? {
      background: 'var(--accent)', color: '#fff',
    } : variant === 'ghost' ? {
      background: 'transparent', color: 'var(--text-secondary)',
    } : variant === 'danger' ? {
      background: 'var(--danger-subtle)', color: 'var(--danger)',
    } : {
      background: 'var(--bg-raised)', color: 'var(--text-primary)', border: '1px solid var(--border)',
    }),
    opacity: props.disabled || loading ? 0.5 : 1,
    ...style,
  }
  return (
    <button style={styles} {...props}>
      {loading ? <Spinner size={12} /> : icon}
      {children}
    </button>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid transparent`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em',
      color: color || 'var(--text-secondary)',
      background: bg || 'var(--bg-raised)',
    }}>
      {children}
    </span>
  )
}

// ── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ user, size = 28 }) {
  if (!user) return null
  return (
    <span title={user.name} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: user.color || 'var(--accent)',
      color: '#fff', fontSize: size * 0.38, fontWeight: 700,
      fontFamily: 'var(--font-display)', flexShrink: 0,
    }}>
      {user.avatar}
    </span>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 480 }) {
  // Close on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1,
            display: 'flex', alignItems: 'center', padding: '2px',
          }}>✕</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    background: 'var(--bg-base)', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'border-color 0.15s',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      {props.type === 'textarea'
        ? <textarea {...props} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        : <input {...props} style={inputStyle} />
      }
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, options, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      <select style={{
        width: '100%', padding: '9px 12px', fontSize: '13px',
        background: 'var(--bg-base)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)', outline: 'none',
      }} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'var(--bg-raised)',
      animation: 'pulse 1.4s ease-in-out infinite',
      ...style,
    }} />
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '12px', padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '40px' }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{title}</div>
        {description && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{description}</div>}
      </div>
      {action}
    </div>
  )
}
