'use client'

import { useState } from 'react'
import Link from 'next/link'
import FadeInUp from './FadeInUp'
import Avatar from './Avatar'

interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  photo_url: string | null
  skills: string[] | null
}

export default function BuildersGrid({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? profiles.filter(p => {
        const q = query.toLowerCase()
        return (
          (p.full_name ?? '').toLowerCase().includes(q) ||
          (p.bio ?? '').toLowerCase().includes(q) ||
          (p.skills ?? []).some(s => s.toLowerCase().includes(q))
        )
      })
    : profiles

  return (
    <>
      {/* Search bar */}
      <div className="mb-10">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            width="15" height="15" viewBox="0 0 15 15" fill="none"
          >
            <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, bio, or skill…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500 py-20 text-center">No builders match &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((profile, i) => {
            const skills: string[] = profile.skills ?? []
            return (
              <FadeInUp key={profile.id} delay={i * 60}>
                <Link href={`/members/${profile.id}`} className="block h-full">
                  <div
                    className="rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(255,255,255,0.12)]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar name={profile.full_name} photoUrl={profile.photo_url} size={52} textSize="text-lg" />
                      <p className="text-white font-semibold leading-tight truncate">{profile.full_name}</p>
                    </div>

                    {profile.bio && (
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
                        {profile.bio}
                      </p>
                    )}

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {skills.slice(0, 4).map(skill => (
                          <span
                            key={skill}
                            className="text-xs px-2.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </FadeInUp>
            )
          })}
        </div>
      )}
    </>
  )
}
