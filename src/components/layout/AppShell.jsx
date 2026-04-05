import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore.js'
import { useWorkspaceStore } from '../../store/workspaceStore.js'
import { useUIStore } from '../../store/uiStore.js'
import { api } from '../../api/index.js'
import { Avatar, Skeleton, ThemeToggle } from '../ui/index.jsx'

export function AppShell({ children }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function Sidebar({ open }) {
  const { user, logout } = useAuthStore()
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore()
  const navigate = useNavigate()
  const { boardId } = useParams()

  const { data: workspaces = [], isLoading: wsLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: api.getWorkspaces,
  })

  const activeWs = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0]

  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ['boards', activeWs?.id],
    queryFn: () => api.getBoards(activeWs.id),
    enabled: !!activeWs,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{
      width: open ? 240 : 0, flexShrink: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
    }}>
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '18px', letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Task<span style={{ color: 'var(--accent)' }}>Board</span>
          </div>
        </div>

        {/* Workspace switcher */}
        <div style={{ padding: '12px 12px 8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 8px' }}>
            Workspaces
          </div>
          {wsLoading
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 8px' }}>
                {[...Array(3)].map((_, i) => <Skeleton key={i} height={32} radius={8} />)}
              </div>
            : workspaces.map(ws => (
                <WorkspaceItem
                  key={ws.id}
                  workspace={ws}
                  active={ws.id === activeWs?.id}
                  onClick={() => {
                    setActiveWorkspace(ws.id)
                    navigate(`/workspace/${ws.id}`)
                  }}
                />
              ))
          }
        </div>

        {/* Boards for active workspace */}
        {activeWs && (
          <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 8px' }}>
              Boards
            </div>
            {boardsLoading
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 8px' }}>
                  {[...Array(2)].map((_, i) => <Skeleton key={i} height={28} radius={6} />)}
                </div>
              : boards.map(board => (
                  <BoardItem
                    key={board.id}
                    board={board}
                    active={board.id === boardId}
                    onClick={() => navigate(`/workspace/${activeWs.id}/board/${board.id}`)}
                  />
                ))
            }
          </div>
        )}

        {/* User footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <Avatar user={user} size={30} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '14px', padding: '4px',
              borderRadius: 4, transition: 'color 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ⏻
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkspaceItem({ workspace, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '7px 10px', borderRadius: 8,
        background: active ? 'var(--accent-subtle)' : hov ? 'var(--bg-hover)' : 'transparent',
        border: active ? '1px solid var(--accent)' : '1px solid transparent',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '2px', transition: 'all 0.12s',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: workspace.color || 'var(--accent)',
      }} />
      <span style={{
        fontSize: '13px', fontWeight: active ? 600 : 400,
        color: active ? 'var(--accent)' : 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {workspace.name}
      </span>
    </button>
  )
}

function BoardItem({ board, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '6px 10px', borderRadius: 6,
        background: active ? 'var(--bg-hover)' : hov ? 'var(--bg-raised)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '2px', transition: 'all 0.12s',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {board.isPublic ? '🌐' : '🔒'}
      </span>
      <span style={{
        fontSize: '12px', fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {board.title}
      </span>
    </button>
  )
}

function Topbar({ onMenuClick, sidebarOpen }) {
  const { activityOpen, toggleActivity } = useUIStore()
  const { boardId } = useParams()
  const navigate = useNavigate()

  const { data: board } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => api.getBoard(boardId),
    enabled: !!boardId,
  })

  return (
    <div style={{
      height: 52, flexShrink: 0,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-surface)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: '12px',
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '16px', padding: '4px',
          display: 'flex', alignItems: 'center',
        }}
      >
        ☰
      </button>

      {board && (
        <>
          <div style={{ color: 'var(--border)', fontSize: '16px' }}>›</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '15px', color: 'var(--text-primary)',
          }}>
            {board.title}
          </span>
          {board.isPublic && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/public/board/${board.publicToken}`
                navigator.clipboard?.writeText(url)
                  .then(() => alert('Public link copied!'))
                  .catch(() => alert(`Share link: ${url}`))
              }}
              title="Copy public share link"
              style={{
                padding: '4px 10px', borderRadius: 6,
                background: 'var(--success-subtle)', border: '1px solid var(--success)',
                color: 'var(--success)', fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              🔗 Share
            </button>
          )}
        </>
      )}

      <div style={{ flex: 1 }} />

      <ThemeToggle />

      {boardId && (
        <button
          onClick={toggleActivity}
          style={{
            padding: '5px 12px', borderRadius: 6,
            background: activityOpen ? 'var(--accent-subtle)' : 'var(--bg-raised)',
            border: `1px solid ${activityOpen ? 'var(--accent)' : 'var(--border)'}`,
            color: activityOpen ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'all 0.15s',
          }}
        >
          ⚡ Activity
        </button>
      )}
    </div>
  )
}
