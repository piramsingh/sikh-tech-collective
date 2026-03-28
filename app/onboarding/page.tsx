import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingFlow from '@/components/OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If they already have a profile with a name, skip onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (profile?.full_name) redirect('/dashboard')

  const initialName = user.user_metadata?.full_name ?? ''

  return (
    <OnboardingFlow userId={user.id} initialName={initialName} />
  )
}
