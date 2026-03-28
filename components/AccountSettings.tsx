'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountSettings({ currentEmail }: { currentEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail || newEmail === currentEmail) return
    setEmailSaving(true)
    setEmailMsg(null)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailSaving(false)
    if (error) {
      setEmailMsg({ ok: false, text: error.message })
    } else {
      setEmailMsg({ ok: true, text: `Confirmation sent to ${newEmail}. Check your inbox to confirm the change.` })
      setNewEmail('')
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'Password must be at least 8 characters.' })
      return
    }
    setPasswordSaving(true)
    setPasswordMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) {
      setPasswordMsg({ ok: false, text: error.message })
    } else {
      setPasswordMsg({ ok: true, text: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to delete account')
      }
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
  const labelClass = "block text-sm font-medium text-zinc-300 mb-2"

  return (
    <div className="space-y-12">

      {/* Email */}
      <section>
        <h2 className="text-base font-semibold text-white mb-1">Email address</h2>
        <p className="text-sm text-zinc-500 mb-5">Current: <span className="text-zinc-300">{currentEmail}</span></p>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className={labelClass}>New email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="new@email.com"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          {emailMsg && (
            <p className={`text-sm ${emailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{emailMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={emailSaving || !newEmail}
            className="rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {emailSaving ? 'Sending…' : 'Update email'}
          </button>
        </form>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Password */}
      <section>
        <h2 className="text-base font-semibold text-white mb-1">Password</h2>
        <p className="text-sm text-zinc-500 mb-5">Choose a strong password of at least 8 characters.</p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{passwordMsg.text}</p>
          )}
          <button
            type="submit"
            disabled={passwordSaving || !newPassword || !confirmPassword}
            className="rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {passwordSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Danger zone */}
      <section>
        <h2 className="text-base font-semibold mb-1" style={{ color: '#f87171' }}>Danger zone</h2>
        <p className="text-sm text-zinc-500 mb-5">
          Permanently delete your account and all your data. This cannot be undone.
        </p>
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className={labelClass}>
              Type <span className="text-white font-mono">delete my account</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="delete my account"
              className={inputClass}
              style={{ ...inputStyle, border: '1px solid rgba(248,113,113,0.2)' }}
            />
          </div>
          {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
          <button
            type="submit"
            disabled={deleting || deleteConfirm !== 'delete my account'}
            className="rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
            style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </form>
      </section>

    </div>
  )
}
