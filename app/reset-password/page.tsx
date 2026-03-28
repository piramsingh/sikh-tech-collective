'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import HeroBackground from '@/components/HeroBackground'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
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
      <div className="relative w-full max-w-sm space-y-6 px-6" style={{ zIndex: 3 }}>
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-white">Set new password</h1>
          <p className="text-sm text-zinc-400">Choose a strong password for your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
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
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
