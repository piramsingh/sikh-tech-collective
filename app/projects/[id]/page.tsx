import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import ScreenshotGallery from '@/components/ScreenshotGallery'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      cover_url,
      project_images(*),
      project_builders(
        profiles(id, full_name, bio, photo_url, website_url)
      )
    `)
    .eq('id', id)
    .single()

  if (!project) notFound()

  const builders = (project.project_builders as { profiles: { id: string; full_name: string; bio: string | null; photo_url: string | null; website_url: string | null } }[])
    .map(pb => pb.profiles)
    .filter(Boolean)

  const images = (project.project_images as { id: string; url: string; caption: string | null; display_order: number }[])
    .sort((a, b) => a.display_order - b.display_order)

  const headerImage = project.cover_url ?? images[0]?.url ?? null

  // Screenshots excludes the cover if it's being used as the hero
  const galleryImages = project.cover_url ? images : images.slice(1)

  return (
    <main style={{ background: '#191919', minHeight: '100vh', paddingTop: '56px' }}>
      <Nav breadcrumb={[
        { label: 'Projects', href: '/projects' },
        { label: project.name },
      ]} />

      {/* Hero cover */}
      {headerImage && (
        <div className="relative w-full overflow-hidden h-[180px] sm:h-[240px] md:h-[300px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${headerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Gradient fade to background at the bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 40%, #191919 100%)',
            }}
          />
          {/* Title overlaid bottom-left */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-[720px] mx-auto px-6 pb-6">
              <h1 className="text-white font-semibold leading-tight text-2xl sm:text-3xl md:text-[32px]">
                {project.name}
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Content column */}
      <div className="max-w-[720px] mx-auto px-6" style={{ paddingBottom: '96px' }}>

        {/* Title (only shown if no hero image) */}
        {!headerImage && (
          <h1 className="text-white font-semibold leading-tight" style={{ fontSize: '32px', paddingTop: '8px', marginBottom: '24px' }}>
            {project.name}
          </h1>
        )}
        <div style={{ paddingTop: headerImage ? '8px' : '0' }} />

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: '56px' }}>
          {/* Builder pills */}
          {builders.map(builder => (
            <Link
              key={builder.id}
              href={`/members/${builder.id}`}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none' }}
            >
              <Avatar name={builder.full_name} photoUrl={builder.photo_url} size={20} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{builder.full_name}</span>
            </Link>
          ))}

          {/* External link pill */}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors text-white/50 hover:text-white/85 hover:bg-white/10"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
              <span className="text-sm">{(() => { try { return new URL(project.live_url).hostname.replace('www.', '') } catch { return project.live_url } })()}</span>
            </a>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p
            className="leading-relaxed whitespace-pre-wrap"
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '17px',
              lineHeight: '1.75',
              marginBottom: '56px',
              maxWidth: '65ch',
            }}
          >
            {project.description}
          </p>
        )}

        {/* Gallery */}
        <ScreenshotGallery images={galleryImages} projectName={project.name} />


      </div>

      <Footer />
    </main>
  )
}
