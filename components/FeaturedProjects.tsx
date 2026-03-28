import Link from 'next/link'
import FadeInUp from './FadeInUp'
import Avatar from './Avatar'
import { createClient } from '@/lib/supabase/server'
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
]

export default async function FeaturedProjects() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, cover_url, tags, project_images(url, display_order), project_builders(profile_id, profiles(id, full_name, photo_url))')
    .not('description', 'is', null)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!projects?.length) return null

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeInUp>
          <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-16">
            Featured Projects
          </p>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const tags: string[] = project.tags ?? []
            const primaryTag = tags[0] ?? null
            const tagStyle = primaryTag ? (TAG_COLORS[primaryTag] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' }) : null
            const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            const builders = (project.project_builders as { profile_id: string; profiles: { id: string; full_name: string | null; photo_url: string | null } }[])
              .map(pb => pb.profiles).filter(Boolean)
            const images = (project.project_images as { url: string; display_order: number }[] | null) ?? []
            const firstScreenshot = images.sort((a, b) => a.display_order - b.display_order)[0]?.url ?? null
            const headerImage = project.cover_url ?? firstScreenshot

            return (
              <FadeInUp key={project.id} delay={i * 120}>
                <Link href={`/projects/${project.id}`} className="block h-full">
                  <div
                    className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(255,255,255,0.12)]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {/* Cover image or gradient */}
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
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 w-fit"
                          style={{ color: tagStyle.color, background: tagStyle.bg }}
                        >
                          {primaryTag}
                        </span>
                      )}

                      <h3 className="text-white text-xl font-semibold mb-2 leading-tight">
                        {project.name}
                      </h3>

                      <p className="text-zinc-500 text-sm leading-relaxed flex-1 mb-5 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Builders */}
                      {builders.length > 0 && (
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
                      )}
                    </div>
                  </div>
                </Link>
              </FadeInUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
