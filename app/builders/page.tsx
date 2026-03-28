import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import BuildersGrid from '@/components/BuildersGrid'
import { createClient } from '@/lib/supabase/server'

const BUILDERS_BG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=3840&q=90&fit=crop'

export default async function BuildersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, bio, photo_url, skills')
    .not('full_name', 'is', null)
    .order('full_name', { ascending: true })

  return (
    <main className="bg-dark min-h-screen">
      <Nav />

      <PageHero
        image={BUILDERS_BG}
        eyebrow="Who's building"
        title="builders"
        subtitle="The Sikh engineers, designers, and makers building for the Panth."
      />

      <div className="mx-6 md:mx-10 mb-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {(!profiles || profiles.length === 0) ? (
            <p className="text-zinc-500 text-center py-20">No builders yet. Check back soon.</p>
          ) : (
            <BuildersGrid profiles={profiles} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
