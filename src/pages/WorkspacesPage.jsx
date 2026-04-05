import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell.jsx'
import { Skeleton, EmptyState } from '../components/ui/index.jsx'
import { useWorkspaceStore } from '../store/workspaceStore.js'
import { useAuthStore } from '../store/authStore.js'
import { api } from '../api/index.js'

export default function WorkspacesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setActiveWorkspace } = useWorkspaceStore()

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: api.getWorkspaces,
  })

  const goToWorkspace = (ws) => {
    setActiveWorkspace(ws.id)
    navigate(`/workspace/${ws.id}`)
  }

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '28px', letterSpacing: '-0.02em', marginBottom: '6px',
            }}>
              Good morning, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Pick a workspace to get started.
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} height={120} radius={12} />)}
            </div>
          ) : workspaces.length === 0 ? (
            <EmptyState icon="📋" title="No workspaces" description="You don't belong to any workspaces yet." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {workspaces.map(ws => (
                <WorkspaceCard key={ws.id} workspace={ws} onClick={() => goToWorkspace(ws)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function WorkspaceCard({ workspace, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '24px', borderRadius: 'var(--radius-lg)',
        background: hov ? 'var(--bg-hover)' : 'var(--bg-surface)',
        border: `1px solid ${hov ? workspace.color || 'var(--accent)' : 'var(--border)'}`,
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'all 0.18s', boxShadow: hov ? 'var(--shadow-md)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        fontFamily: 'var(--font-body)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${workspace.color || 'var(--accent)'}22`,
        border: `1px solid ${workspace.color || 'var(--accent)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800,
        color: workspace.color || 'var(--accent)',
      }}>
        {workspace.name[0]}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px',
        }}>
          {workspace.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {workspace.memberCount} members
        </div>
      </div>
    </button>
  )
}
