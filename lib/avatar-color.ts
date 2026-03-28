const COLORS = [
  { bg: '#5C3D99', text: '#E9D5FF' },
  { bg: '#1D6B5A', text: '#A7F3D0' },
  { bg: '#92400E', text: '#FDE68A' },
  { bg: '#1E3A8A', text: '#BFDBFE' },
  { bg: '#881337', text: '#FECDD3' },
  { bg: '#065F46', text: '#6EE7B7' },
  { bg: '#7C2D12', text: '#FED7AA' },
  { bg: '#4C1D95', text: '#DDD6FE' },
  { bg: '#164E63', text: '#A5F3FC' },
  { bg: '#713F12', text: '#FEF08A' },
]

export function avatarColor(seed: string | null | undefined) {
  const s = seed ?? '?'
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}
