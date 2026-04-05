import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/index.js'
import { Skeleton } from '../ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'

function timeAgo(iso) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }) }
  catch { return '' }
}

const ACTION_ICONS = {
  moved:   { icon: '⇄', color: 'var(--accent)' },
  created: { icon: '✦', color: 'var(--success)' },
  updated: { icon: '✎', color: 'var(--warning)' },
  deleted: { icon: '✕', color: 'var(--danger)' },
}

export function ActivityFeed({ boardId, open }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['activity', boardId],
    queryFn: () => api.getActivity(boardId),
    refetchInterval: 10000,
    enabled: !!boardId,
  })

  return (
    <div style={{
      width: open ? 280 : 0, overflow: 'hidden',
      borderLeft: open ? '1px solid var(--border)' : 'none',
      background: 'var(--bg-surface)',
      transition: 'width 0.25s ease',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {open && (
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{
            padding: '20px 20px 14px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase',
              color: 'var(--text-secondary)',
            }}>
              Activity
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '12px 0' }}>
            {isLoading && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px' }}>
                    <Skeleton width={28} height={28} radius={99} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Skeleton height={12} />
                      <Skeleton width="60%" height={10} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No activity yet.<br />Make some changes!
              </div>
            )}

            {events.map(event => {
              const cfg = ACTION_ICONS[event.action] || ACTION_ICONS.updated
              return (
                <div key={event.id} style={{
                  display: 'flex', gap: '10px', padding: '10px 20px',
                  borderBottom: '1px solid var(--border)',
                  animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--bg-raised)', border: `1px solid ${cfg.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: cfg.color, flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      <span style={{ fontWeight: 600 }}>{event.actor}</span>
                      {' '}{event.action}{' '}
                      <span style={{
                        color: 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'inline-block', maxWidth: '100%',
                      }}>
                        "{event.taskTitle}"
                      </span>
                      {event.action === 'moved' && event.from && event.to && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          {' '}from <strong style={{ color: 'var(--text-secondary)' }}>{event.from}</strong>
                          {' '}→ <strong style={{ color: 'var(--accent)' }}>{event.to}</strong>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {timeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
