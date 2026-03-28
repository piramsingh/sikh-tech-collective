import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/components/ProjectForm'
import Breadcrumb from '@/components/Breadcrumb'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen">
      <Breadcrumb crumbs={[
        { label: `${profile?.full_name?.split(' ')[0] ?? 'Your'}'s Dashboard`, href: '/dashboard' },
        { label: 'New Project' },
      ]} />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <ProjectForm
          userId={user.id}
          initial={{
            name: '',
            description: '',
            live_url: '',
            cover_url: null,
            images: [],
            builders: profile ? [{ id: profile.id, full_name: profile.full_name, photo_url: profile.photo_url }] : [],
          }}
        />
      </main>
    </div>
  )
}
