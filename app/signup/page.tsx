'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HeroBackground from '@/components/HeroBackground'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden grain" style={{ background: '#080808' }}>
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(6px)', zIndex: 2 }} />
      <a href="/" className="absolute top-6 left-6 text-2xl text-white/60 hover:text-white transition-colors" style={{ zIndex: 3 }}>
        ←
      </a>
      <div className="relative w-full max-w-sm space-y-6 px-6" style={{ zIndex: 3 }}>
        <h1 className="text-2xl font-semibold text-center text-white">Create Builder Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: '#D4A843', color: '#000' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <a href="/login" className="text-white underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
