'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

interface Invite {
  id: string
  project_id: string
  project_name: string
  inviter_name: string
  inviter_photo: string | null
}

export default function ProjectInviteRequests({ invites: initial }: { invites: Invite[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [invites, setInvites] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAccept(invite: Invite) {
    setLoading(invite.id)
    // Insert self as builder
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('project_builders').insert({ project_id: invite.project_id, profile_id: user.id, is_owner: false })
    await supabase.from('project_invites').update({ status: 'accepted' }).eq('id', invite.id)
    // Mark related notification read
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .contains('data', { invite_id: invite.id })

    setInvites(prev => prev.filter(i => i.id !== invite.id))
    setLoading(null)
    router.refresh()
  }

  async function handleDecline(invite: Invite) {
    setLoading(invite.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('project_invites').update({ status: 'declined' }).eq('id', invite.id)
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .contains('data', { invite_id: invite.id })

    setInvites(prev => prev.filter(i => i.id !== invite.id))
    setLoading(null)
  }

  if (invites.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-400">Project Invites</h2>
      <ul className="space-y-3">
        {invites.map(invite => (
          <li
            key={invite.id}
            className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={invite.inviter_name} photoUrl={invite.inviter_photo} size={36} />
              <div className="min-w-0">
                <p className="text-sm text-white leading-snug">
                  <span className="font-medium">{invite.inviter_name}</span>
                  {' invited you to join '}
                  <Link href={`/projects/${invite.project_id}`} className="font-medium underline underline-offset-2" style={{ color: '#D4A843' }}>
                    {invite.project_name}
                  </Link>
                </p>
                <p className="text-xs mt-0.5 text-zinc-500">Do you want to join this project?</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleDecline(invite)}
                disabled={loading === invite.id}
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Decline
              </button>
              <button
                onClick={() => handleAccept(invite)}
                disabled={loading === invite.id}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: '#D4A843', color: '#000' }}
              >
                {loading === invite.id ? '…' : 'Join project'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
