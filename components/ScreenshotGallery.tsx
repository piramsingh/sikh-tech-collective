'use client'

interface ScreenshotImage {
  id: string
  url: string
  caption: string | null
  display_order: number
}

export default function ScreenshotGallery({ images, projectName }: { images: ScreenshotImage[]; projectName: string }) {
  if (images.length === 0) return null

  return (
    <div style={{ marginBottom: '80px' }}>
      <p className="text-xs tracking-[0.25em] uppercase mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Screenshots
      </p>

      {/* Horizontal scroll carousel */}
      <div
        className="relative"
        style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          width: '100vw',
        }}
      >
        {/* Fade hints */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: '80px',
            background: 'linear-gradient(to right, #191919 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: '80px',
            background: 'linear-gradient(to left, #191919 0%, transparent 100%)',
          }}
        />

        <div
          className="screenshot-scroll flex gap-5 overflow-x-auto"
          style={{
            padding: '8px 60px 32px',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                width: 'min(720px, calc(100vw - 120px))',
              }}
            >
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption ?? projectName}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '460px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                  }}
                />
                {img.caption && (
                  <div
                    className="px-6 py-4"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {img.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
