interface PageHeroProps {
  image: string
  eyebrow: string
  title: string
  subtitle: string
}

export default function PageHero({ image, eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative h-[45vh] sm:h-[55vh] md:h-[62vh] min-h-[280px] flex flex-col items-center justify-center overflow-hidden grain">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url('${image}')`,
          filter: 'saturate(1.15) brightness(0.65)',
        }}
      />

      {/* Edge vignette + bottom fade — same recipe as home */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 120% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.6) 100%)',
            'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.85) 100%)',
          ].join(', '),
          zIndex: 1,
        }}
      />

      {/* Text */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-3xl mx-auto" style={{ zIndex: 2 }}>
        <p
          className="text-xs font-medium tracking-[0.3em] uppercase mb-5"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {eyebrow}
        </p>
        <h1
          className="text-white lowercase font-semibold leading-[0.92] tracking-[-0.03em]"
          style={{
            fontSize: 'clamp(1.8rem, 7vw, 7rem)',
            textShadow: '0 2px 40px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>
        <p
          className="mt-5 text-[14px] sm:text-[17px] md:text-[20px] font-medium leading-relaxed max-w-md"
          style={{ color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  )
}
