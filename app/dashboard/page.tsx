import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardProjectList from '@/components/DashboardProjectList'
import NotificationsPanel from '@/components/NotificationsPanel'
import ProjectInviteRequests from '@/components/ProjectInviteRequests'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_builders!inner(profile_id, is_owner)')
    .eq('project_builders.profile_id', user.id)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Pending invites for accept/decline UI
  const { data: rawInvites } = await supabase
    .from('project_invites')
    .select('id, project_id, projects(name), profiles!project_invites_inviter_id_fkey(full_name, photo_url)')
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const pendingInvites = (rawInvites ?? []).map((row: {
    id: string
    project_id: string
    projects: { name: string } | null
    profiles: { full_name: string | null; photo_url: string | null } | null
  }) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: row.projects?.name ?? 'a project',
    inviter_name: row.profiles?.full_name ?? 'Someone',
    inviter_photo: row.profiles?.photo_url ?? null,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" className="text-white font-semibold text-sm tracking-tight">
          the sikh tech collective
        </a>
        <div className="flex items-center gap-4">
          <NotificationsPanel notifications={notifications ?? []} />
          <a href="/dashboard/profile" className="text-sm text-zinc-400 hover:text-white transition-colors">
            {profile?.full_name ?? 'Profile'}
          </a>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">{profile?.full_name?.split(' ')[0] ?? 'Your'}'s Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Here are the projects you've built for the Panth.</p>
          </div>
          <a
            href="/dashboard/projects/new"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}
          >
            <span>+</span> New project
          </a>
        </div>

        {/* Pending invites */}
        <ProjectInviteRequests invites={pendingInvites} />

        {/* Project list or empty state */}
        {(!projects || projects.length === 0) ? (
          <div
            className="rounded-2xl p-16 flex flex-col items-center text-center space-y-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              🛠
            </div>
            <div>
              <p className="text-white font-medium text-lg">No projects yet</p>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                Add your first project to showcase what you've built for the Sikh community.
              </p>
            </div>
            <a
              href="/dashboard/projects/new"
              className="mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              + Add your first project
            </a>
          </div>
        ) : (
          <DashboardProjectList projects={projects ?? []} />
        )}
      </main>
    </div>
  )
}
