import { avatarColor as colorFor } from '@/lib/avatar-color'

interface AvatarProps {
  name: string | null | undefined
  photoUrl: string | null | undefined
  size?: number        // px, default 24
  textSize?: string    // tailwind text class, default 'text-xs'
  className?: string
}

export default function Avatar({ name, photoUrl, size = 24, textSize = 'text-xs', className = '' }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? '?'
  const color = colorFor(name ?? '?')

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name ?? ''}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-semibold ${textSize} ${className}`}
      style={{ width: size, height: size, background: color.bg, color: color.text }}
    >
      {initial}
    </div>
  )
}
