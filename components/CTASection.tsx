import Link from 'next/link'
import FadeInUp from './FadeInUp'

export default function CTASection() {
  return (
    <section
      className="py-40 px-6 text-center relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 60%, #1a1208 0%, #110c04 45%, #0a0a0a 100%)',
      }}
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        <FadeInUp>
          <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-6">
            Join the Collective
          </p>
        </FadeInUp>

        <FadeInUp delay={100}>
          <h2
            className="text-white leading-none mb-6"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }}
          >
            Ready to build?
          </h2>
        </FadeInUp>

        <FadeInUp delay={200}>
          <p className="text-zinc-400 text-lg leading-relaxed mb-12 max-w-md mx-auto">
            Applications for Cohort 4 are open. Build something that matters.
          </p>
        </FadeInUp>

        <FadeInUp delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects"
              className="inline-block px-8 py-3 rounded-full font-medium text-sm transition-all hover:opacity-90 hover:scale-105 active:scale-100"
              style={{
                background: '#D4A843',
                color: '#0a0a0a',
              }}
            >
              Apply Now →
            </Link>
            <Link
              href="/projects"
              className="inline-block px-8 py-3 rounded-full font-medium text-sm border transition-all hover:bg-white/5"
              style={{
                borderColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
              }}
            >
              Learn More
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  )
}
