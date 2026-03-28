'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  read: boolean
  created_at: string
  data: {
    project_id?: string
    project_name?: string
    inviter_name?: string
  }
}

export default function NotificationsPanel({ notifications: initial }: { notifications: Notification[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [notifications, setNotifications] = useState(initial)
  const [open, setOpen] = useState(false)

  const unread = notifications.filter(n => !n.read).length

  async function markAllRead() {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ read: true }).in('id', ids)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead() }}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: unread > 0 ? '#D4A843' : 'rgba(255,255,255,0.4)' }}
        title="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 0C7.22386 0 7 0.223858 7 0.5V1.08564C4.27302 1.33778 2.12109 3.68979 2.12109 6.5C2.12109 8.68542 1.49548 9.91695 0.921875 10.6133C0.634766 10.9619 0.358398 11.1841 0.169922 11.3145C0.0751953 11.3797 0 11.4236 0 11.5C0 11.7761 0.223858 12 0.5 12H5.00488C5.22852 13.1411 6.26758 14 7.5 14C8.73242 14 9.77148 13.1411 9.99512 12H14.5C14.7761 12 15 11.7761 15 11.5C15 11.4236 14.9248 11.3797 14.8301 11.3145C14.6416 11.1841 14.3652 10.9619 14.0781 10.6133C13.5045 9.91695 12.8789 8.68542 12.8789 6.5C12.8789 3.68979 10.727 1.33778 8 1.08564V0.5C8 0.223858 7.77614 0 7.5 0ZM7.5 13C6.81836 13 6.23047 12.5977 5.96094 12H9.03906C8.76953 12.5977 8.18164 13 7.5 13ZM1.17969 11C1.35254 10.8506 1.54199 10.6621 1.73047 10.4258C2.38477 9.63306 3.12109 8.24458 3.12109 6.5C3.12109 4.00977 5.08887 2 7.5 2C9.91113 2 11.8789 4.00977 11.8789 6.5C11.8789 8.24458 12.6152 9.63306 13.2695 10.4258C13.458 10.6621 13.6475 10.8506 13.8203 11H1.17969Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
        </svg>
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-semibold"
            style={{ background: '#D4A843', color: '#000', fontSize: '10px' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-80 rounded-xl overflow-hidden"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-sm font-medium text-white">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-zinc-500 hover:text-white transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-6 text-sm text-center text-zinc-500">No notifications yet</p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex gap-3 transition-colors hover:bg-white/5 cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: n.read ? 'transparent' : 'rgba(212,168,67,0.05)' }}
                  onClick={() => markRead(n.id)}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(212,168,67,0.15)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="#D4A843" fillRule="evenodd" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    {n.type === 'project_invite' && (
                      <>
                        <p className="text-sm text-white leading-snug">
                          <span className="font-medium">{n.data.inviter_name}</span>
                          {' added you to '}
                          <Link
                            href={`/projects/${n.data.project_id}`}
                            className="font-medium underline underline-offset-2"
                            style={{ color: '#D4A843' }}
                            onClick={e => e.stopPropagation()}
                          >
                            {n.data.project_name}
                          </Link>
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {timeAgo(n.created_at)}
                        </p>
                      </>
                    )}
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#D4A843' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
