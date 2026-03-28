'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  photo_url: string | null
  website_url: string | null
  github_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  skills: string[] | null
}

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(profile?.id ?? null)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url ?? '')
  const [githubUrl, setGithubUrl] = useState(profile?.github_url ?? '')
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url ?? '')
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? [])
  const [skillInput, setSkillInput] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photo_url ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id)
      })
    }
  }, [userId])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const tag = skillInput.trim().replace(/,$/, '')
      if (tag && !skills.includes(tag)) {
        setSkills(prev => [...prev, tag])
      }
      setSkillInput('')
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills(prev => prev.slice(0, -1))
    }
  }

  function removeSkill(skill: string) {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      let photoUrl = profile?.photo_url ?? null

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

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          bio: bio || null,
          website_url: websiteUrl || null,
          github_url: githubUrl || null,
          twitter_url: twitterUrl || null,
          linkedin_url: linkedinUrl || null,
          skills,
          photo_url: photoUrl,
        })

      if (updateError) throw updateError

      setSaved(true)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
  const labelClass = "text-sm font-medium text-zinc-300"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Avatar */}
      <div className="space-y-3">
        <label className={labelClass}>Photo</label>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 focus:outline-none">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile photo" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 hover:ring-white/30 transition-all" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-zinc-400 hover:bg-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {fullName[0] ?? '?'}
              </div>
            )}
          </button>
          <div className="space-y-1">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-white underline">
              {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <p className="text-xs text-zinc-500">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </div>

      {/* Full name */}
      <div className="space-y-2">
        <label className={labelClass}>Full name</label>
        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={inputClass} style={inputStyle} />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className={labelClass}>Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell the Panth a bit about yourself…" className={inputClass + " resize-none"} style={inputStyle} />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className={labelClass}>Skills</label>
        <div
          className="flex flex-wrap gap-2 rounded-lg px-3 py-2.5 min-h-[46px] cursor-text"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={() => document.getElementById('skill-input')?.focus()}
        >
          {skills.map(skill => (
            <span
              key={skill}
              className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium"
              style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.25)' }}
            >
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="opacity-60 hover:opacity-100 leading-none">&times;</button>
            </span>
          ))}
          <input
            id="skill-input"
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder={skills.length === 0 ? 'React, iOS, Design… (press Enter to add)' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
        </div>
        <p className="text-xs text-zinc-600">Press Enter or comma to add a skill</p>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label className={labelClass}>Website</label>
        <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" className={inputClass} style={inputStyle} />
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <label className={labelClass}>Social links</label>
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">GH</span>
            <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className={inputClass + " pl-10"} style={inputStyle} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">𝕏</span>
            <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="https://x.com/username" className={inputClass + " pl-10"} style={inputStyle} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">in</span>
            <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" className={inputClass + " pl-10"} style={inputStyle} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {saved ? (
        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-sm text-emerald-400">Profile saved.</span>
          <a
            href={`/members/${userId}`}
            className="text-sm font-medium text-white hover:opacity-70 transition-opacity"
          >
            View public profile →
          </a>
        </div>
      ) : (
        <button type="submit" disabled={saving} className="w-full rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80" style={{ background: '#fff', color: '#000' }}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      )}
    </form>
  )
}
