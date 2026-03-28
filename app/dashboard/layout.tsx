import HeroBackground from '@/components/HeroBackground'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden grain" style={{ background: '#080808' }}>
      <HeroBackground />
      {/* Strong overlay to dim the constellation so content surfaces dominate */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(8,8,8,0.75)', zIndex: 2 }} />
      <div className="relative" style={{ zIndex: 3 }}>
        {children}
      </div>
    </div>
  )
}
