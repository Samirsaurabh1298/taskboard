import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'
import { useWorkspaceStore } from '../store/workspaceStore.js'
import { api } from '../api/index.js'
import { Spinner } from '../components/ui/index.jsx'

const DEMO_ACCOUNTS = [
  { email: 'sam@acme.com',   name: 'Samir Saurabh', color: '#5b6af0' },
  { email: 'priya@acme.com', name: 'Priya Nair',    color: '#2dd4a0' },
  { email: 'rahul@acme.com', name: 'Rahul Dev',     color: '#f5a623' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = new URLSearchParams(location.search).get('returnTo') || '/workspaces'
  const { login } = useAuthStore()
  const { setActiveWorkspace } = useWorkspaceStore()

  const [email, setEmail] = useState('sam@acme.com')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await api.login(email, password)
      login(user, token)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-base)',
    }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: 'none',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        padding: '60px',
        flexDirection: 'column', justifyContent: 'space-between',
        '@media(minWidth:768px)': { display: 'flex' },
      }}
      className="login-left"
      >
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '24px', color: 'var(--text-primary)', letterSpacing: '-0.02em',
        }}>
          Task<span style={{ color: 'var(--accent)' }}>Board</span>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '40px', lineHeight: 1.15, color: 'var(--text-primary)',
            letterSpacing: '-0.03em', marginBottom: '20px',
          }}>
            Work flows<br />
            <span style={{ color: 'var(--accent)' }}>without friction.</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, maxWidth: 340 }}>
            Multi-workspace task boards with real-time collaboration. Keep your team aligned across every project.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Drag & drop boards', 'Shareable views', 'Live activity feed', 'Multi-workspace'].map(f => (
            <span key={f} style={{
              padding: '6px 14px', borderRadius: 99,
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              fontSize: '12px', color: 'var(--text-secondary)',
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: '100%', maxWidth: 440,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
      }}>
        {/* Mobile logo */}
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '22px', marginBottom: '40px', color: 'var(--text-primary)',
        }} className="mobile-logo">
          Task<span style={{ color: 'var(--accent)' }}>Board</span>
        </div>

        <div style={{ width: '100%' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '26px', letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
            Sign in with password: <code style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', padding: '1px 6px', borderRadius: 4 }}>demo</code>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Demo account pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Quick select account
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setEmail(acc.email)}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: `1px solid ${email === acc.email ? acc.color : 'var(--border)'}`,
                      background: email === acc.email ? `${acc.color}18` : 'var(--bg-raised)',
                      color: email === acc.email ? acc.color : 'var(--text-secondary)',
                      fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                      fontWeight: email === acc.email ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                  >
                    {acc.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg-raised)',
                  color: 'var(--text-primary)', fontSize: '14px',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--bg-raised)',
                  color: 'var(--text-primary)', fontSize: '14px',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--danger-subtle)', border: '1px solid var(--danger)',
                color: 'var(--danger)', fontSize: '13px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                opacity: loading ? 0.7 : 1, display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.15s',
              }}
            >
              {loading && <Spinner size={14} color="#fff" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  )
}
