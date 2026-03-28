'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialName: string
}

export default function OnboardingFlow({ userId, initialName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)

  const [fullName, setFullName] = useState(initialName)
  const [bio, setBio] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const firstName = fullName.trim().split(' ')[0] || 'there'

  function goTo(next: number, dir: 'forward' | 'back' = 'forward') {
    if (animating) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 220)
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const tag = skillInput.trim().replace(/,$/, '')
      if (tag && !skills.includes(tag)) setSkills(prev => [...prev, tag])
      setSkillInput('')
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills(prev => prev.slice(0, -1))
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleFinish() {
    setSaving(true)
    setError(null)
    try {
      let photoUrl: string | null = null
      if (photoFile) {
        const ext = photoFile.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, photoFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        photoUrl = `${data.publicUrl}?t=${Date.now()}`
      }

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        bio: bio || null,
        website_url: websiteUrl || null,
        photo_url: photoUrl,
        skills,
      })
      if (upsertError) throw upsertError

      goTo(3)
      setTimeout(() => router.push('/dashboard'), 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 translate-y-3'
      : 'opacity-0 -translate-y-3'
    : 'opacity-100 translate-y-0'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#080808' }}
    >
      {/* Progress dots */}
      {step < 3 && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                background: i === step ? '#fff' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`w-full max-w-sm transition-all duration-200 ease-out ${slideClass}`}
      >

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="space-y-10 text-center">
            <div className="space-y-4">
              <p className="text-xs tracking-widest uppercase" style={{ color: '#D4A843' }}>
                Waheguru Ji Ka Khalsa
              </p>
              <h1 className="text-4xl font-semibold text-white leading-tight">
                Welcome to<br />the Collective.
              </h1>
              <p className="text-zinc-400 text-base leading-relaxed">
                Let's set up your builder profile.<br />It only takes a minute.
              </p>
            </div>
            <button
              onClick={() => goTo(1)}
              className="w-full rounded-xl py-3.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: '#fff', color: '#000' }}
            >
              Get started
            </button>
          </div>
        )}

        {/* Step 1 — Photo */}
        {step === 1 && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white">Add a photo</h2>
              <p className="text-zinc-500 text-sm">Put a face to your name.</p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group focus:outline-none"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt=""
                    className="w-28 h-28 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/30 transition-all"
                  />
                ) : (
                  <div
                    className="w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1.5 group-hover:bg-white/10 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.15)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 1C7.22386 1 7 1.22386 7 1.5V7H1.5C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H7V13.5C7 13.7761 7.22386 14 7.5 14C7.77614 14 8 13.7761 8 13.5V8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H8V1.5C8 1.22386 7.77614 1 7.5 1Z" fill="rgba(255,255,255,0.4)" fillRule="evenodd" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs text-zinc-500">Upload</span>
                  </div>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Change photo
                </button>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => goTo(2)}
                className="w-full rounded-xl py-3.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: '#fff', color: '#000' }}
              >
                Continue
              </button>
              <button
                onClick={() => goTo(2)}
                className="w-full py-2 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Name + Bio */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white">About you</h2>
              <p className="text-zinc-500 text-sm">Tell the Panth who you are.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  placeholder="What do you build?"
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Skills</label>
                <div
                  className="flex flex-wrap gap-2 rounded-xl px-3 py-2.5 min-h-[50px] cursor-text"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => document.getElementById('ob-skill-input')?.focus()}
                >
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium"
                      style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.25)' }}
                    >
                      {skill}
                      <button type="button" onClick={() => setSkills(s => s.filter(x => x !== skill))} className="opacity-60 hover:opacity-100">&times;</button>
                    </span>
                  ))}
                  <input
                    id="ob-skill-input"
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder={skills.length === 0 ? 'React, iOS, Design…' : ''}
                    className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Website</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="space-y-3">
              <button
                onClick={handleFinish}
                disabled={saving || !fullName.trim()}
                className="w-full rounded-xl py-3.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ background: '#fff', color: '#000' }}
              >
                {saving ? 'Setting up your profile…' : 'Finish'}
              </button>
              <button
                onClick={() => goTo(1, 'back')}
                className="w-full py-2 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.3)' }}
            >
              <svg width="24" height="24" viewBox="0 0 15 15" fill="none">
                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="#D4A843" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white">You're in, {firstName}.</h2>
              <p className="text-zinc-500 text-sm">Taking you to your dashboard…</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
