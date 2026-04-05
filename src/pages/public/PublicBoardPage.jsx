import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/index.js'
import { Badge, Avatar, Spinner, EmptyState } from '../../components/ui/index.jsx'
import { getUserById, PRIORITY_CONFIG } from '../../utils/constants.js'

// Inject OG meta tags dynamically
function MetaTags({ board }) {
  React.useEffect(() => {
    if (!board) return
    const taskCount = board.columns.reduce((s, c) => s + c.tasks.length, 0)
    const desc = `${taskCount} tasks across ${board.columns.length} columns`

    document.title = `${board.title} | TaskBoard`
    setMeta('og:title', board.title)
    setMeta('og:description', desc)
    setMeta('og:url', window.location.href)
    setMeta('og:type', 'website')
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', board.title)
    setMeta('twitter:description', desc)
    setMeta('description', desc)

    return () => { document.title = 'TaskBoard' }
  }, [board])
  return null
}

function setMeta(name, content) {
  const attr = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export default function PublicBoardPage() {
  const { token } = useParams()

  const { data: board, isLoading, isError } = useQuery({
    queryKey: ['public-board', token],
    queryFn: () => api.getPublicBoard(token),
    retry: false,
  })

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <Spinner size={32} />
    </div>
  )

  if (isError || !board) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: 16 }}>
      <EmptyState
        icon="🔒"
        title="Board not found"
        description="This board is private or doesn't exist."
        action={<Link to="/login" style={{ color: 'var(--accent)', fontSize: '13px' }}>Sign in to access private boards →</Link>}
      />
    </div>
  )

  const taskCount = board.columns.reduce((s, c) => s + c.tasks.length, 0)

  return (
    <>
      <MetaTags board={board} />
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        {/* Public header */}
        <header style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '18px', color: 'var(--text-primary)', textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}>
              Task<span style={{ color: 'var(--accent)' }}>Board</span>
            </Link>
            <div style={{ color: 'var(--border)', fontSize: '16px' }}>›</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '15px', color: 'var(--text-primary)',
            }}>
              {board.title}
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 99,
              background: 'var(--success-subtle)', border: '1px solid var(--success)',
              color: 'var(--success)', fontSize: '11px', fontWeight: 600,
            }}>
              🌐 Public
            </span>
          </div>
          <Link to="/login" style={{
            padding: '7px 16px', borderRadius: 8,
            background: 'var(--accent)', color: '#fff',
            fontSize: '13px', fontWeight: 700, textDecoration: 'none',
            fontFamily: 'var(--font-display)',
          }}>
            Sign in
          </Link>
        </header>

        {/* Board meta */}
        <div style={{ padding: '32px 32px 0', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '24px', letterSpacing: '-0.02em',
            }}>
              {board.title}
            </h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <StatPill label="Tasks" value={taskCount} />
              <StatPill label="Columns" value={board.columns.length} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Read-only view · Sign in to edit this board
          </p>
        </div>

        {/* Board columns — read only */}
        <div style={{ overflowX: 'auto', padding: '28px 32px' }}>
          <div style={{ display: 'flex', gap: '20px', minWidth: 'max-content', alignItems: 'flex-start' }}>
            {board.columns.map(col => (
              <PublicColumn key={col.id} column={col} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '20px 32px',
          textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px',
        }}>
          Powered by <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>TaskBoard</Link>
          {' '}· This is a publicly shared view
        </footer>
      </div>
    </>
  )
}

function PublicColumn({ column }) {
  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 4px', marginBottom: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          {column.title}
        </span>
        <span style={{
          minWidth: 20, height: 20, borderRadius: 6,
          background: 'var(--bg-raised)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
        }}>
          {column.tasks.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {column.tasks.map(task => <PublicTaskCard key={task.id} task={task} />)}
        {column.tasks.length === 0 && (
          <div style={{
            padding: '20px', textAlign: 'center', color: 'var(--text-muted)',
            fontSize: '12px', border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
          }}>
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

function PublicTaskCard({ task }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const assignee = getUserById(task.assigneeId)

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3,
        height: '100%', borderRadius: '10px 0 0 10px',
        background: priority.color,
      }} />
      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', paddingLeft: 4 }}>
        {task.title}
      </div>
      {task.description && (
        <div style={{
          fontSize: '11px', color: 'var(--text-muted)', paddingLeft: 4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.description}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4 }}>
        <Badge color={priority.color} bg={priority.bg}>{priority.label}</Badge>
        {assignee && <Avatar user={assignee} size={22} />}
      </div>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div style={{
      padding: '4px 12px', borderRadius: 99,
      background: 'var(--bg-raised)', border: '1px solid var(--border)',
      fontSize: '12px', color: 'var(--text-secondary)',
      display: 'flex', gap: '6px',
    }}>
      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
      <span>{label}</span>
    </div>
  )
}
