'use client'

interface BorderBeamProps {
  duration?: number
  colorFrom?: string
  colorTo?: string
}

/**
 * Smooth border beam using a GPU-accelerated conic-gradient rotation.
 * Place inside a `relative overflow-hidden rounded-*` container.
 */
export function BorderBeam({
  duration = 4,
  colorFrom = '#7BB8FF',
  colorTo = '#FF5EBA',
}: BorderBeamProps) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-[-200%] animate-[border-beam-spin_var(--duration)_linear_infinite]"
      style={{
        background: `conic-gradient(transparent 270deg, ${colorFrom}, ${colorTo}, transparent)`,
        '--duration': `${duration}s`,
      } as React.CSSProperties}
    />
  )
}
