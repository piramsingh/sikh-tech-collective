import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import ProjectsGrid from '@/components/ProjectsGrid'
import { createClient } from '@/lib/supabase/server'

const PROJECTS_BG = 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=3840&q=90&fit=crop'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, cover_url, tags, project_images(url, display_order), project_builders(profile_id, profiles(id, full_name, photo_url))')
    .order('created_at', { ascending: false })

  return (
    <main className="bg-dark min-h-screen">
      <Nav />

      <PageHero
        image={PROJECTS_BG}
        eyebrow="What we're building"
        title="projects"
        subtitle="Built by Sikh builders. For the Panth."
      />

      <div className="mx-6 md:mx-10 mb-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {(!projects || projects.length === 0) ? (
            <p className="text-zinc-500 text-center py-20">No projects yet. Check back soon.</p>
          ) : (
            <ProjectsGrid projects={projects as never} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
