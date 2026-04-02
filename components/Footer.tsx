import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="px-4 sm:px-6 md:px-10 py-12 md:py-16"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10">
        {/* Brand */}
        <div>
          <span
            className="block text-xl mb-2"
            style={{
              color: '#D4A843',
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            STC
          </span>
          <p className="text-zinc-600 text-xs max-w-xs leading-relaxed">
            An open playground for Sikh builders to build for the Panth.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-zinc-600 text-xs tracking-widest uppercase mb-1">
              Navigate
            </span>
            {[
              { href: '/', label: 'Home' },
              { href: '/projects', label: 'Projects' },
              { href: '/privacy', label: 'Privacy Policy' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-zinc-500 hover:text-white transition-colors text-sm"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-zinc-700 text-xs">
          © {new Date().getFullYear()} The Sikh Tech Collective. All rights reserved.
        </p>
        <p
          className="text-xs"
          style={{ color: 'rgba(212,168,67,0.4)' }}
        >
          built for the panth.
        </p>
      </div>
    </footer>
  )
}
