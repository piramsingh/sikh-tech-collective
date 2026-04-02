import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — The Sikh Tech Collective',
}

export default function PrivacyPage() {
  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '56px' }}>
      <Nav />
      <div className="max-w-[680px] mx-auto px-6 py-20">
        <h1 className="text-3xl font-semibold text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: April 2, 2026</p>

        <div className="space-y-10 text-zinc-400 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Overview</h2>
            <p>
              The Sikh Tech Collective ("we", "us", "our") is an open platform for Sikh builders
              to share projects and connect with the community. This policy explains what data we
              collect, how we use it, and your rights around it.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Information We Collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><span className="text-zinc-300">Account information</span> — name and email address when you sign up</li>
              <li><span className="text-zinc-300">Profile information</span> — bio, skills, photo, and website URL if you choose to add them</li>
              <li><span className="text-zinc-300">Project information</span> — project names, descriptions, links, and screenshots you submit</li>
              <li><span className="text-zinc-300">Authentication data</span> — managed securely by Supabase; we do not store raw passwords</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">How We Use Your Information</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To display your profile and projects on the platform</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To let other members find and connect with you</li>
            </ul>
            <p className="mt-4">We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Third-Party Services</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><span className="text-zinc-300">Supabase</span> — database and authentication</li>
              <li><span className="text-zinc-300">Resend</span> — transactional email delivery</li>
              <li><span className="text-zinc-300">Vercel</span> — hosting and deployment</li>
              <li><span className="text-zinc-300">Google OAuth</span> — optional sign-in with Google</li>
            </ul>
            <p className="mt-4">Each of these services has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Data Retention</h2>
            <p>
              Your data is retained for as long as your account is active. If you'd like your
              account and data deleted, email us and we'll remove it within 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Your Rights</h2>
            <p>You can at any time:</p>
            <ul className="space-y-2 list-disc list-inside mt-2">
              <li>Edit or delete your profile and projects from your dashboard</li>
              <li>Request full deletion of your account and associated data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg mb-3">Contact</h2>
            <p>
              Questions? Reach us at{' '}
              <a href="mailto:hello@sikhtechcollective.com" className="text-white underline hover:text-zinc-300 transition-colors">
                hello@sikhtechcollective.com
              </a>
            </p>
          </section>

        </div>
      </div>
      <Footer />
    </main>
  )
}
