'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/builders', label: 'Builders' },
]

interface UserProfile {
  full_name: string | null
  photo_url: string | null
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface NavProps {
  breadcrumb?: BreadcrumbItem[]
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function Nav({ breadcrumb }: NavProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, photo_url')
          .eq('id', data.user.id)
          .single()
        setProfile(prof)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-8 py-3"
      style={{
        background: 'rgba(8,8,8,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Left: wordmark always */}
      <Link href="/" className="text-white font-semibold tracking-tight flex-1" style={{ fontSize: '16px' }}>
        the sikh tech collective
      </Link>

      {/* Center-right: nav links, with breadcrumb replacing its matching nav link */}
      <div className="flex items-center gap-6 text-sm font-medium mr-8">
        {navLinks.map(({ href, label }) => {
          // If breadcrumb starts with this nav link, render the full breadcrumb here instead
          const isBreadcrumbRoot = breadcrumb && breadcrumb[0]?.href === href
          if (isBreadcrumbRoot) {
            return (
              <div key={href} className="flex items-center gap-1.5">
                {breadcrumb!.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>›</span>}
                    {item.href ? (
                      <Link href={item.href} className="transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {item.label}
                      </Link>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                    )}
                  </span>
                ))}
              </div>
            )
          }
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="transition-colors"
              style={{ color: active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Right: avatar or sign in */}
      <div className="flex justify-end">
      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold focus:outline-none overflow-hidden transition-opacity hover:opacity-80"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(profile?.full_name ?? null)
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl py-1 text-sm"
              style={{
                background: 'rgba(18,18,24,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="shrink-0 opacity-60">
                  <path d="M2 1.5A.5.5 0 012.5 1h4a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-5zM8 1.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-2zM8 7.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-5zM2 8.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v5a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-5z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="shrink-0 opacity-60">
                  <path d="M7.5 1a3 3 0 100 6 3 3 0 000-6zM1 13.5C1 10.46 3.96 8 7.5 8s6.5 2.46 6.5 5.5a.5.5 0 01-.5.5h-12a.5.5 0 01-.5-.5z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
                Edit Profile
              </Link>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="shrink-0 opacity-60">
                  <path d="M3 1a1 1 0 00-1 1v11a1 1 0 001 1h6.5a.5.5 0 000-1H3V2h6.5a.5.5 0 000-1H3zm9.354 4.646a.5.5 0 00-.708.708L13.293 7.5H6.5a.5.5 0 000 1h6.793l-1.647 1.646a.5.5 0 00.708.708l2.5-2.5a.5.5 0 000-.708l-2.5-2.5z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}
        >
          Sign in
        </Link>
      )}
      </div>
    </nav>
  )
}
