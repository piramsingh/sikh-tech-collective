'use client'

import { useState } from 'react'
import Link from 'next/link'
import FadeInUp from './FadeInUp'
import Avatar from './Avatar'
import { avatarColor } from '@/lib/avatar-color'

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  AI:             { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  EdTech:         { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  Fintech:        { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  Web3:           { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  Community:      { color: '#D4A843', bg: 'rgba(212,168,67,0.15)' },
  Tools:          { color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
  Health:         { color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  Media:          { color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  Music:          { color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  Faith:          { color: '#D4A843', bg: 'rgba(212,168,67,0.15)' },
  Education:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  Infrastructure: { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  'Open Source':  { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
  Social:         { color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  Productivity:   { color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
}

const CARD_GRADIENTS = [
  { from: '#14532d', to: '#052e16' },
  { from: '#3b0764', to: '#1e0432' },
  { from: '#0c4a6e', to: '#082f49' },
  { from: '#431407', to: '#1c0a03' },
  { from: '#500724', to: '#2d0a15' },
  { from: '#292524', to: '#1c1917' },
]

interface Builder {
  id: string
  full_name: string | null
  photo_url: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  cover_url: string | null
  tags: string[] | null
  project_images: { url: string; display_order: number }[]
  project_builders: { profile_id: string; profiles: Builder }[]
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? projects.filter(p => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.tags ?? []).some(t => t.toLowerCase().includes(q)) ||
          p.project_builders.some(pb => pb.profiles?.full_name?.toLowerCase().includes(q))
        )
      })
    : projects

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
            placeholder="Search projects, tags, or builders…"
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
        <p className="text-zinc-500 py-20 text-center">No projects match &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => {
            const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            const builders = project.project_builders.map(pb => pb.profiles).filter(Boolean)
            const images = [...(project.project_images ?? [])].sort((a, b) => a.display_order - b.display_order)
            const headerImage = project.cover_url ?? images[0]?.url ?? null
            const tags: string[] = project.tags ?? []
            const primaryTag = tags[0] ?? null
            const tagStyle = primaryTag ? (TAG_COLORS[primaryTag] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' }) : null

            return (
              <FadeInUp key={project.id} delay={i * 60} className="h-full">
                <Link href={`/projects/${project.id}`} className="block h-full">
                  <div
                    className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(255,255,255,0.12)]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-36 w-full shrink-0"
                      style={headerImage ? {
                        backgroundImage: `url(${headerImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {
                        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                      }}
                    />
                    <div className="p-6 flex flex-col flex-1">
                      {tagStyle && primaryTag && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 w-fit" style={{ color: tagStyle.color, background: tagStyle.bg }}>
                          {primaryTag}
                        </span>
                      )}
                      <h3 className="text-white text-xl font-medium mb-2 leading-tight">{project.name}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed flex-1 mb-5 line-clamp-3">{project.description ?? ''}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {builders.slice(0, 3).map(b => (
                            <Avatar key={b.id} name={b.full_name} photoUrl={b.photo_url} size={24} className="ring-2 ring-[#0a0a0a]" />
                          ))}
                          {builders.length > 3 && (() => {
                            const c = avatarColor(builders[3]?.full_name)
                            return (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-[#0a0a0a]" style={{ background: c.bg, color: c.text }}>
                                +{builders.length - 3}
                              </div>
                            )
                          })()}
                        </div>
                        <span className="text-zinc-500 text-xs truncate">
                          {builders.length <= 3
                            ? builders.map(b => b.full_name).filter(Boolean).join(', ')
                            : `${builders.slice(0, 3).map(b => b.full_name?.split(' ')[0]).filter(Boolean).join(', ')} +${builders.length - 3} more`
                          }
                        </span>
                      </div>
                    </div>
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
