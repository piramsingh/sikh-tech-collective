'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import HeroBackground from '@/components/HeroBackground'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=/reset-password`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden grain" style={{ background: '#080808' }}>
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: 'blur(6px)', zIndex: 2 }} />
      <a href="/login" className="absolute top-6 left-6 text-2xl text-white/60 hover:text-white transition-colors" style={{ zIndex: 3 }}>
        ←
      </a>
      <div className="relative w-full max-w-sm space-y-6 px-6" style={{ zIndex: 3 }}>
        {sent ? (
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-semibold text-white">Check your email</h1>
            <p className="text-sm text-zinc-400">We sent a password reset link to <span className="text-white">{email}</span></p>
            <a href="/login" className="block text-sm text-zinc-500 hover:text-white transition-colors pt-4">
              Back to login
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-semibold text-white">Forgot password</h1>
              <p className="text-sm text-zinc-400">Enter your email and we'll send you a reset link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="text-center text-sm text-zinc-500">
              Remember it?{' '}
              <a href="/login" className="text-white underline">Sign in</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
