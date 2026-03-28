import FadeInUp from './FadeInUp'

const stats = [
  { value: '12+', label: 'Projects' },
  { value: '80+', label: 'Members' },
  { value: '100%', label: 'Open Source' },
]

export default function AboutSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: Statement */}
          <FadeInUp>
            <h2
              className="text-white font-semibold tracking-tight leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              Building for the Panth.
            </h2>
          </FadeInUp>

          {/* Right: Body + Stats */}
          <FadeInUp delay={150}>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light mb-12">
              The Sikh Tech Collective is a community of builders, founders, and
              engineers committed to using technology to serve the Sikh
              community. We build in public, ship fast, and care deeply.
            </p>

            <div className="flex flex-wrap gap-10">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span
                    className="text-3xl font-semibold leading-none mb-1"
                    style={{ color: '#D4A843' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-zinc-500 text-sm tracking-wide uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}
