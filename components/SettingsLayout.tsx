'use client'

import { useState } from 'react'
import ProfileForm from './ProfileForm'
import AccountSettings from './AccountSettings'

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

const NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Edit Profile',
    description: 'Photo, bio, skills, links',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account',
    description: 'Email, password, danger zone',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="11" r="1" fill="currentColor"/>
      </svg>
    ),
  },
]

export default function SettingsLayout({
  profile,
  email,
  userId,
}: {
  profile: Profile | null
  email: string
  userId: string
}) {
  const [active, setActive] = useState<'profile' | 'account'>('profile')

  return (
    <div className="flex gap-8 min-h-[600px]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0">
        <nav className="sticky top-24 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id as 'profile' | 'account')}
                className="w-full text-left rounded-xl px-3.5 py-3 transition-all duration-150 group"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    className="transition-colors group-hover:!text-white/70">
                    {item.icon}
                  </span>
                  <span
                    className="text-sm font-medium transition-colors group-hover:text-white"
                    style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)' }}
                  >
                    {item.label}
                  </span>
                </div>
                <p
                  className="text-xs pl-[26px] transition-colors"
                  style={{ color: isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)' }}
                >
                  {item.description}
                </p>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Divider */}
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {active === 'profile' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <a
                href={`/members/${userId}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                View public profile →
              </a>
            </div>
            <p className="text-sm text-zinc-500 mb-8">This is how you appear to other builders.</p>
            <ProfileForm profile={profile} />
          </div>
        )}

        {active === 'account' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Account</h2>
            <p className="text-sm text-zinc-500 mb-8">Manage your login credentials and account.</p>
            <AccountSettings currentEmail={email} />
          </div>
        )}
      </div>
    </div>
  )
}
