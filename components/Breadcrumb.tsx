interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <header className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-zinc-600 text-sm">›</span>}
          {crumb.href ? (
            <a href={crumb.href} className="text-sm text-zinc-400 hover:text-white transition-colors">
              {crumb.label}
            </a>
          ) : (
            <span className="text-sm font-semibold text-white">{crumb.label}</span>
          )}
        </span>
      ))}
    </header>
  )
}
