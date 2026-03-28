'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  live_url: string | null
  project_builders: { profile_id: string; is_owner: boolean }[]
}

export default function DashboardProjectList({ projects }: { projects: Project[] }) {
  const [previewId, setPreviewId] = useState<string | null>(null)

  return (
    <>
      <ul className="space-y-3">
        {projects.map(project => (
          <li
            key={project.id}
            className="rounded-xl px-5 py-4 flex items-center justify-between group transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{project.name}</p>
                {project.project_builders[0]?.is_owner ? (
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Owner</span>
                ) : (
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.12)', color: '#D4A843' }}>Collaborator</span>
                )}
              </div>
              {project.live_url && (
                <p className="text-sm text-zinc-500 mt-0.5 truncate">{project.live_url}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit project"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </Link>
              <button
                onClick={() => setPreviewId(project.id)}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/10 transition-colors"
                title="Preview project"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 11C4.80285 11 2.52952 9.62184 1.09622 7.50001C2.52952 5.37816 4.80285 4 7.5 4C10.1971 4 12.4705 5.37816 13.9038 7.50001C12.4705 9.62183 10.1971 11 7.5 11ZM7.5 3C4.30786 3 1.65639 4.70638 0.0760002 7.23501C-0.0253338 7.39715 -0.0253338 7.60288 0.0760002 7.76501C1.65639 10.2936 4.30786 12 7.5 12C10.6921 12 13.3436 10.2936 14.924 7.76501C15.0253 7.60288 15.0253 7.39715 14.924 7.23501C13.3436 4.70638 10.6921 3 7.5 3ZM7.5 9.5C8.60457 9.5 9.5 8.60457 9.5 7.5C9.5 6.39543 8.60457 5.5 7.5 5.5C6.39543 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.39543 9.5 7.5 9.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {previewId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          onClick={e => { if (e.target === e.currentTarget) setPreviewId(null) }}
        >
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col" style={{ height: '85vh', background: '#191919', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-xs text-zinc-500">Preview</span>
              <button onClick={() => setPreviewId(null)} className="text-zinc-500 hover:text-white transition-colors text-lg leading-none">×</button>
            </div>
            <iframe src={`/projects/${previewId}`} className="w-full flex-1" style={{ border: 'none' }} />
          </div>
        </div>
      )}
    </>
  )
}
