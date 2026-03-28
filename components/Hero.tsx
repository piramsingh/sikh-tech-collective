'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BorderBeam } from './BorderBeam'
import HeroBackground from './HeroBackground'

// ─── FadeUp helper ───────────────────────────────────────────────────────────

function FadeUp({ delay, children, className, style }: {
  delay: number
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grain"
      style={{ background: '#080808' }}
    >
      <HeroBackground />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-4xl mx-auto" style={{ zIndex: 3 }}>
        <FadeUp
          delay={0.1}
          className="text-white lowercase font-semibold"
          style={{
            fontSize: 'clamp(3rem, 8.5vw, 7.5rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            maxWidth: '14ch',
            textShadow: '0 2px 60px rgba(0,0,0,0.8)',
          } as React.CSSProperties}
        >
          <h1 style={{ fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' }}>
            the sikh tech collective
          </h1>
        </FadeUp>

        <FadeUp delay={0.26} className="mt-6 max-w-md mx-auto">
          <p className="text-[17px] md:text-[20px] font-medium text-center leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.72)' }}>
            an open playground for sikh builders to build for the panth.
          </p>
        </FadeUp>

        <FadeUp delay={0.46} className="mt-9">
          {/* Outer wrapper clips the rotating gradient to show only the border */}
          <div className="relative inline-flex rounded-full p-px overflow-hidden transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]">
            <BorderBeam duration={4} colorFrom="#7BB8FF" colorTo="#FF5EBA" />
            <Link
              href="/projects"
              className="relative inline-flex items-center gap-1.5 px-8 py-3.5 rounded-full text-sm font-semibold z-10"
              style={{
                background: 'rgba(8,8,8,0.75)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                color: '#ffffff',
              }}
            >
              view projects →
            </Link>
          </div>
        </FadeUp>
      </div>

      {/* Bottom fade to page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent 0%, #0a0a0a 100%)',
        zIndex: 4,
      }} />
    </section>
  )
}
