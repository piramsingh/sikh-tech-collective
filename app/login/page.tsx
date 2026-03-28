'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HeroBackground from '@/components/HeroBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden grain" style={{ background: '#080808' }}>
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(6px)', zIndex: 2 }} />
      <a href="/" className="absolute top-6 left-6 text-2xl text-white/60 hover:text-white transition-colors" style={{ zIndex: 3 }}>
        ←
      </a>
      <div className="relative w-full max-w-sm space-y-6 px-6" style={{ zIndex: 3 }}>
        <h1 className="text-2xl font-semibold text-center text-white">Builder Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="text-right">
            <a href="/forgot-password" className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: '#D4A843', color: '#000' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          No account?{' '}
          <a href="/signup" className="text-white underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}
