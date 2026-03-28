import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsLayout from '@/components/SettingsLayout'
import Breadcrumb from '@/components/Breadcrumb'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen">
      <Breadcrumb crumbs={[
        { label: `${profile?.full_name?.split(' ')[0] ?? 'Your'}'s Dashboard`, href: '/dashboard' },
        { label: 'Settings' },
      ]} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <SettingsLayout
          profile={profile}
          email={user.email ?? ''}
          userId={user.id}
        />
      </main>
    </div>
  )
}
