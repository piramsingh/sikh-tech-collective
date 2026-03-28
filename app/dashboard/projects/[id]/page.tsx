import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/components/ProjectForm'
import Breadcrumb from '@/components/Breadcrumb'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify current user is a builder on this project
  const { data: membership } = await supabase
    .from('project_builders')
    .select('project_id')
    .eq('project_id', id)
    .eq('profile_id', user.id)
    .single()

  if (!membership) notFound()

  // Fetch project with ALL builders (not filtered by current user)
  const { data: project } = await supabase
    .from('projects')
    .select('*, cover_url, project_builders(profile_id, is_owner, profiles(id, full_name, photo_url)), project_images(*)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const builders = (project.project_builders as { profile_id: string; is_owner: boolean; profiles: { id: string; full_name: string | null; photo_url: string | null } }[])
    .map(pb => ({ ...pb.profiles, is_owner: pb.is_owner }))
    .filter(Boolean)

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Your'

  return (
    <div className="min-h-screen">
      <Breadcrumb crumbs={[
        { label: `${firstName}'s Dashboard`, href: '/dashboard' },
        { label: project.name },
      ]} />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <ProjectForm
          userId={user.id}
          projectId={project.id}
          initial={{
            name: project.name,
            description: project.description ?? '',
            live_url: project.live_url ?? '',
            cover_url: project.cover_url ?? null,
            images: project.project_images ?? [],
            builders,
          }}
        />
      </main>
    </div>
  )
}
