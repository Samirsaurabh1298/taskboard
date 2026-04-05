import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '../components/layout/AppShell.jsx'
import { Skeleton, EmptyState } from '../components/ui/index.jsx'
import { api } from '../api/index.js'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()

  const { data: workspaces = [] } = useQuery({ queryKey: ['workspaces'], queryFn: api.getWorkspaces })
  const workspace = workspaces.find(w => w.id === workspaceId)

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => api.getBoards(workspaceId),
    enabled: !!workspaceId,
  })

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 860 }}>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Workspace</div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '26px', letterSpacing: '-0.02em',
              }}>
                {workspace?.name || '…'}
              </h1>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Boards — {boards.length}
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} height={130} radius={12} />)}
            </div>
          ) : boards.length === 0 ? (
            <EmptyState icon="📌" title="No boards yet" description="Create your first board to start organizing work." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {boards.map((board, i) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  delay={i * 50}
                  onClick={() => navigate(`/workspace/${workspaceId}/board/${board.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function BoardCard({ board, onClick, delay }) {
  const [hov, setHov] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '22px', borderRadius: 'var(--radius-lg)',
        background: hov ? 'var(--bg-hover)' : 'var(--bg-surface)',
        border: `1px solid ${hov ? 'var(--border-light)' : 'var(--border)'}`,
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: '14px',
        transition: 'all 0.18s', boxShadow: hov ? 'var(--shadow-md)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        fontFamily: 'var(--font-body)',
        animation: `fadeIn 0.25s ease ${delay}ms both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '22px' }}>📋</span>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '3px 8px',
          borderRadius: 99, fontFamily: 'var(--font-body)',
          background: board.isPublic ? 'var(--success-subtle)' : 'var(--bg-raised)',
          color: board.isPublic ? 'var(--success)' : 'var(--text-muted)',
          border: `1px solid ${board.isPublic ? 'var(--success)' : 'var(--border)'}`,
        }}>
          {board.isPublic ? '🌐 Public' : '🔒 Private'}
        </span>
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px',
        }}>
          {board.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {board.taskCount} tasks
        </div>
      </div>
    </button>
  )
}
