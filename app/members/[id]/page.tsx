import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, bio, photo_url, website_url, github_url, twitter_url, linkedin_url, skills')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: memberProjects } = await supabase
    .from('project_builders')
    .select('projects(id, name, description, cover_url, project_images(url, display_order))')
    .eq('profile_id', id)

  const builtProjects = (memberProjects ?? [])
    .map((pb: { projects: { id: string; name: string; description: string | null; cover_url: string | null; project_images: { url: string; display_order: number }[] } | null }) => pb.projects)
    .filter(Boolean) as { id: string; name: string; description: string | null; cover_url: string | null; project_images: { url: string; display_order: number }[] }[]

  const skills: string[] = profile.skills ?? []

  const socialLinks = [
    { href: profile.github_url, label: 'GitHub', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )},
    { href: profile.twitter_url, label: 'X / Twitter', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )},
    { href: profile.linkedin_url, label: 'LinkedIn', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )},
    { href: profile.website_url, label: 'Website', icon: (
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
        <path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
      </svg>
    )},
  ].filter(s => s.href)

  return (
    <main style={{ background: '#191919', minHeight: '100vh', paddingTop: '56px' }}>
      <Nav breadcrumb={[
        { label: 'Builders', href: '/builders' },
        { label: profile.full_name ?? 'Builder' },
      ]} />

      <div className="max-w-[720px] mx-auto px-6" style={{ paddingTop: '48px', paddingBottom: '96px' }}>

        {/* Profile header */}
        <div className="flex items-start gap-5" style={{ marginBottom: '32px' }}>
          <Avatar name={profile.full_name} photoUrl={profile.photo_url} size={80} textSize="text-2xl" />
          <div className="space-y-2 pt-1 min-w-0">
            <h1 className="text-white font-semibold" style={{ fontSize: '24px' }}>
              {profile.full_name ?? 'Anonymous builder'}
            </h1>
            {profile.bio && (
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>
                {profile.bio}
              </p>
            )}

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className="text-white/30 hover:text-white/80 transition-colors"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginBottom: '40px' }}>
            {skills.map(skill => (
              <span
                key={skill}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '40px' }} />

        {/* Projects */}
        {builtProjects.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-6" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              Projects
            </p>
            <div className="space-y-3">
              {builtProjects.map(project => {
                const images = (project.project_images ?? []).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
                const thumb = project.cover_url ?? images[0]?.url ?? null
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 rounded-xl overflow-hidden transition-colors hover:bg-white/5"
                    style={{ border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none' }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-16 shrink-0"
                      style={thumb ? {
                        backgroundImage: `url(${thumb})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : {
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    />
                    <div className="min-w-0 py-3 pr-4 flex-1">
                      <p className="text-white text-sm font-medium">{project.name}</p>
                      {project.description && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <svg className="shrink-0 mr-4" width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {builtProjects.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '14px' }}>No projects yet.</p>
        )}

      </div>

      <Footer />
    </main>
  )
}
