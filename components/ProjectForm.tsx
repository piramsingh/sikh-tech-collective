'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'

interface ExistingImage {
  id: string
  url: string
  caption: string
  display_order: number
}

interface Builder {
  id: string
  full_name: string | null
  photo_url: string | null
  is_owner?: boolean
}

interface Props {
  userId: string
  projectId?: string
  initial?: {
    name: string
    description: string
    live_url: string
    cover_url: string | null
    images: ExistingImage[]
    builders?: Builder[]
  }
}

export default function ProjectForm({ userId, projectId, initial }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_url ?? null)
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initial?.images ?? [])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [builders, setBuilders] = useState<Builder[]>(initial?.builders ?? [])
  const [pendingInvites, setPendingInvites] = useState<{ id: string; invitee: Builder }[]>([])
  const [builderSearch, setBuilderSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Builder[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [coBuilderError, setCoBuilderError] = useState<string | null>(null)
  const [addingBuilder, setAddingBuilder] = useState(false)
  const [showInviteSearch, setShowInviteSearch] = useState(!!projectId)
  const searchRef = useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!builderSearch.trim() || builderSearch.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase.rpc('search_builders', { query: builderSearch.trim() })
      const filtered = (data ?? []).filter(
        (b: Builder) =>
          !builders.some(existing => existing.id === b.id) &&
          !pendingInvites.some(inv => inv.invitee.id === b.id) &&
          b.id !== userId
      )
      setSearchResults(filtered)
      setShowDropdown(true)
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [builderSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load existing pending invites for this project
  useEffect(() => {
    if (!projectId) return
    supabase
      .from('project_invites')
      .select('id, invitee_id, profiles!project_invites_invitee_id_fkey(id, full_name, photo_url)')
      .eq('project_id', projectId)
      .eq('status', 'pending')
      .then(({ data }) => {
        if (!data) return
        setPendingInvites(data.map((row: { id: string; invitee_id: string; profiles: { id: string; full_name: string | null; photo_url: string | null } }) => ({
          id: row.id,
          invitee: row.profiles,
        })))
      })
  }, [projectId])

  async function handleInviteBuilder(builder: Builder) {
    setCoBuilderError(null)
    const totalSlots = builders.length + pendingInvites.length
    if (totalSlots >= MAX_BUILDERS) {
      setCoBuilderError(`Projects are limited to ${MAX_BUILDERS} builders.`)
      return
    }
    setAddingBuilder(true)

    if (projectId) {
      // Existing project — create a real pending invite
      const { data: invite, error: inviteError } = await supabase
        .from('project_invites')
        .insert({ project_id: projectId, inviter_id: userId, invitee_id: builder.id, status: 'pending' })
        .select('id')
        .single()

      if (inviteError) {
        setCoBuilderError(inviteError.message)
        setAddingBuilder(false)
        return
      }

      const [{ data: inviterProfile }, { data: project }] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', userId).single(),
        supabase.from('projects').select('name').eq('id', projectId).single(),
      ])

      await supabase.from('notifications').insert({
        user_id: builder.id,
        type: 'project_invite',
        data: {
          invite_id: invite.id,
          project_id: projectId,
          project_name: project?.name ?? 'a project',
          inviter_name: inviterProfile?.full_name ?? 'Someone',
        },
      })

      setPendingInvites(prev => [...prev, { id: invite.id, invitee: builder }])
    } else {
      // New project — stage as a pending invite (real invite created on submit)
      setPendingInvites(prev => [...prev, { id: `temp-${builder.id}`, invitee: builder }])
    }

    setBuilderSearch('')
    setSearchResults([])
    setShowDropdown(false)
    setAddingBuilder(false)
  }

  async function handleCancelInvite(inviteId: string) {
    if (!inviteId.startsWith('temp-')) {
      await supabase.from('project_invites').delete().eq('id', inviteId)
    }
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId))
  }

  function handleCopyInviteLink() {
    navigator.clipboard.writeText(`${window.location.origin}/signup`)
    setCoBuilderError(null)
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function removeCover() {
    setCoverFile(null)
    setCoverPreview(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  async function uploadCover(pid: string): Promise<string | null> {
    if (!coverFile) return coverPreview // keep existing if no new file
    const ext = coverFile.name.split('.').pop()
    const path = `${userId}/${pid}/cover.${ext}`
    const { error } = await supabase.storage.from('covers').upload(path, coverFile, { upsert: true })
    if (error) throw new Error(`Cover upload failed: ${error.message}`)
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    return data.publicUrl
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setScreenshots(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeNewScreenshot(index: number) {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingImage(id: string) {
    setExistingImages(prev => prev.filter(img => img.id !== id))
    setRemovedImageIds(prev => [...prev, id])
  }

  const MAX_BUILDERS = 5

  async function handleRemoveBuilder(builderId: string) {
    if (builderId === userId) return // can't remove yourself
    if (projectId) {
      await supabase
        .from('project_builders')
        .delete()
        .eq('project_id', projectId)
        .eq('profile_id', builderId)
    }
    setBuilders(prev => prev.filter(b => b.id !== builderId))
  }

  async function uploadScreenshots(pid: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of screenshots) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${pid}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('screenshots').upload(path, file)
      if (error) throw new Error(`Upload failed: ${error.message}`)
      const { data } = supabase.storage.from('screenshots').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('project_images').delete().eq('project_id', projectId)
    await supabase.from('project_builders').delete().eq('project_id', projectId)
    await supabase.from('projects').delete().eq('id', projectId)
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let pid: string = projectId ?? ''

      if (!pid) {
        const { data, error } = await supabase
          .from('projects')
          .insert({ name, description, live_url: liveUrl })
          .select('id')
          .single()
        if (error) throw error
        pid = data.id
        // Insert owner first so RLS passes for subsequent inserts
        const { error: ownerError } = await supabase
          .from('project_builders')
          .insert({ project_id: pid, profile_id: userId, is_owner: true })
        if (ownerError) throw ownerError

        // Send real invites for staged pending invitees
        if (pendingInvites.length > 0) {
          const { data: inviterProfile } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
          for (const staged of pendingInvites) {
            const { data: invite } = await supabase
              .from('project_invites')
              .insert({ project_id: pid, inviter_id: userId, invitee_id: staged.invitee.id, status: 'pending' })
              .select('id')
              .single()
            if (invite) {
              await supabase.from('notifications').insert({
                user_id: staged.invitee.id,
                type: 'project_invite',
                data: {
                  invite_id: invite.id,
                  project_id: pid,
                  project_name: name,
                  inviter_name: inviterProfile?.full_name ?? 'Someone',
                },
              })
            }
          }
        }
      }

      const coverUrl = await uploadCover(pid)

      // Auto-generate tags via AI
      const tagRes = await fetch('/api/classify-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const { tags } = tagRes.ok ? await tagRes.json() : { tags: [] }

      if (!projectId) {
        await supabase.from('projects').update({ cover_url: coverUrl, tags }).eq('id', pid)
      } else {
        const { error } = await supabase
          .from('projects')
          .update({ name, description, live_url: liveUrl, cover_url: coverUrl, tags })
          .eq('id', pid)
        if (error) throw error
      }

      for (const imgId of removedImageIds) {
        await supabase.from('project_images').delete().eq('id', imgId)
      }

      const uploadedUrls = await uploadScreenshots(pid)
      const newImageRows = uploadedUrls.map((url, i) => ({
        project_id: pid,
        url,
        display_order: existingImages.length + i,
      }))
      if (newImageRows.length > 0) {
        const { error } = await supabase.from('project_images').insert(newImageRows)
        if (error) throw error
      }

      if (projectId) {
        setSaved(true)
        router.refresh()
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  const inputClass = "w-full rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-white/20"
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
  const labelClass = "text-sm font-medium text-zinc-300"

  const allImages = [
    ...existingImages.map(img => img.url),
    ...previews,
  ]
  const heroImage = coverPreview ?? allImages[0] ?? null
  const galleryImages = coverPreview ? allImages : allImages.slice(1)

  return (
    <div className="space-y-10">

      {/* Preview modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPreview(false) }}
        >
          <div className="relative w-full max-w-3xl rounded-xl overflow-hidden flex flex-col" style={{ height: '85vh', background: '#191919', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-xs text-zinc-500">Preview</span>
              <button onClick={() => setShowPreview(false)} className="text-zinc-500 hover:text-white transition-colors text-lg leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {heroImage && (
                <div className="relative w-full overflow-hidden" style={{ height: '240px' }}>
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #191919 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
                    <h1 className="text-white font-semibold" style={{ fontSize: '28px' }}>{name || 'Untitled project'}</h1>
                  </div>
                </div>
              )}
              <div className="px-6 pb-12" style={{ paddingTop: heroImage ? '12px' : '32px' }}>
                {!heroImage && <h1 className="text-white font-semibold mb-6" style={{ fontSize: '28px' }}>{name || 'Untitled project'}</h1>}
                <div className="flex flex-wrap items-center gap-2 mb-10">
                  {builders.map(b => (
                    <div key={b.id} className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Avatar name={b.full_name} photoUrl={b.photo_url} size={20} />
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{b.full_name}</span>
                    </div>
                  ))}
                  {liveUrl && (
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {(() => { try { return new URL(liveUrl).hostname.replace('www.', '') } catch { return liveUrl } })()}
                      </span>
                    </div>
                  )}
                </div>
                {description && <p className="leading-relaxed whitespace-pre-wrap mb-10" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: '1.75' }}>{description}</p>}
                {galleryImages.length > 0 && (
                  <div className={galleryImages.length === 1 ? '' : 'grid grid-cols-2 gap-3'}>
                    {galleryImages.map((src, i) => (
                      <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                        <img src={src} alt="" className={`w-full object-cover ${galleryImages.length === 1 ? '' : 'h-40'}`} style={{ display: 'block' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors rounded-lg px-3 py-1.5"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253338 7.60288 0.0760002 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
          Preview
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className={labelClass}>Project name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. SikhiDictionary" className={inputClass} style={inputStyle} />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="What did you build and why?" className={inputClass + " resize-none"} style={inputStyle} />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Live URL</label>
          <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://yourproject.com" className={inputClass} style={inputStyle} />
        </div>

        {/* Cover image */}
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Cover image</label>
            <p className="text-xs text-zinc-500 mt-1">Shown as the card header on the projects page. Recommended: 1200×400px or wider landscape image.</p>
          </div>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src={coverPreview} alt="Cover preview" className="w-full h-36 object-cover" />
              <button
                type="button"
                onClick={removeCover}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-full rounded-xl py-8 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
            >
              + Add cover image
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        {/* Screenshots */}
        <div className="space-y-3">
          <label className={labelClass}>Screenshots</label>
          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {existingImages.map(img => (
                <div key={img.id} className="relative rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={img.url} alt="" className="w-full h-36 object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black">×</button>
                </div>
              ))}
            </div>
          )}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={src} alt="" className="w-full h-36 object-cover" />
                  <button type="button" onClick={() => removeNewScreenshot(i)} className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-black">×</button>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-lg py-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
            + Add screenshots
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>

      {/* Builders / Invite */}
      <div className="space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>
          <div>
            <label className={labelClass}>{projectId ? 'Builders' : 'Builders'}</label>
            <p className="text-xs text-zinc-500 mt-1">{projectId ? 'Manage builders on this project.' : 'Invite STC builders to collaborate.'}</p>
          </div>

          <ul className="space-y-2">
            {/* Confirmed builders */}
            {builders.map(b => (
              <li key={b.id} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <Avatar name={b.full_name} photoUrl={b.photo_url} size={28} />
                  <span className="text-sm text-white">{b.full_name ?? 'Unnamed builder'}</span>
                  {b.is_owner || b.id === userId ? (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>Owner</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}>Collaborator</span>
                  )}
                </div>
                {b.id !== userId && (
                  <button onClick={() => handleRemoveBuilder(b.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">Remove</button>
                )}
              </li>
            ))}

            {/* Pending invites */}
            {pendingInvites.map(inv => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.2)' }}>
                <div className="flex items-center gap-3">
                  <Avatar name={inv.invitee.full_name} photoUrl={inv.invitee.photo_url} size={28} />
                  <span className="text-sm text-white">{inv.invitee.full_name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}>Invited</span>
                </div>
                <button onClick={() => handleCancelInvite(inv.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">Cancel</button>
              </li>
            ))}

            {/* Invite row — always shown unless at max */}
            {builders.length + pendingInvites.length < MAX_BUILDERS && (
              <li ref={searchRef} className="relative">
                <div
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 cursor-text"
                  style={{
                    border: showInviteSearch ? '1px dashed rgba(212,168,67,0.35)' : '1px dashed rgba(255,255,255,0.1)',
                    background: showInviteSearch ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                  onClick={() => { if (!showInviteSearch) setShowInviteSearch(true) }}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-base leading-none shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>+</span>
                  {showInviteSearch ? (
                    <input
                      autoFocus
                      type="text"
                      value={builderSearch}
                      onChange={e => { setBuilderSearch(e.target.value); setCoBuilderError(null) }}
                      onFocus={() => builderSearch.length >= 2 && setShowDropdown(true)}
                      onBlur={() => { if (!builderSearch) setShowInviteSearch(false) }}
                      placeholder="Invite a builder…"
                      className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                    />
                  ) : (
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Invite a builder</span>
                  )}
                  {searching && <span className="text-xs text-zinc-500 shrink-0">…</span>}
                </div>
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {searchResults.length > 0 ? searchResults.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        disabled={addingBuilder}
                        onClick={() => handleInviteBuilder(b)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
                      >
                        <Avatar name={b.full_name} photoUrl={b.photo_url} size={28} />
                        <span className="flex-1 text-sm text-white">{b.full_name}</span>
                        <span className="text-xs font-medium shrink-0" style={{ color: '#D4A843' }}>
                          Invite →
                        </span>
                      </button>
                    )) : (
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-sm text-zinc-400">No builders found for &ldquo;{builderSearch}&rdquo;</p>
                        <button type="button" onClick={handleCopyInviteLink} className="text-xs font-medium hover:opacity-80" style={{ color: '#D4A843' }}>
                          Copy invite link →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )}
          </ul>

          {coBuilderError && <p className="text-red-400 text-sm">{coBuilderError}</p>}
        </div>

      {/* Save button */}
      {saved ? (
        <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <span className="text-sm font-medium" style={{ color: '#4ade80' }}>Changes saved</span>
          <a
            href={`/projects/${projectId}`}
            className="text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: '#fff' }}
          >
            View project →
          </a>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          {saving ? 'Saving…' : projectId ? 'Save changes' : 'Create project'}
        </button>
      )}

      {/* Danger zone */}
      {projectId && (
        <div className="rounded-xl p-5 space-y-4" style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.05)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Danger zone</p>
            <p className="text-xs text-zinc-500 mt-0.5">Deleting this project is permanent and cannot be undone.</p>
          </div>
          {confirmDelete ? (
            <div className="space-y-3">
              <p className="text-sm text-white font-medium">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting} className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50" style={{ background: '#ef4444', color: '#fff' }}>
                  {deleting ? 'Deleting…' : 'Yes, delete project'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              Delete project
            </button>
          )}
        </div>
      )}
    </div>
  )
}
