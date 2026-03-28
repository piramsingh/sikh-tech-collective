'use client'

import { useEffect, useRef } from 'react'

function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0, animId = 0

    type Node = {
      x: number; y: number
      vx: number; vy: number
      r: number; alpha: number
      pulse: number; pulseSpeed: number
      colorIdx: number
    }

    let nodes: Node[] = []

    function resize() {
      w = canvas!.offsetWidth
      h = canvas!.offsetHeight
      canvas!.width = w * window.devicePixelRatio
      canvas!.height = h * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
      init()
    }

    function init() {
      const count = Math.floor((w * h) / 14000)
      nodes = Array.from({ length: Math.min(count, 110) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.4 + 0.6,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.012,
        colorIdx: Math.floor(Math.random() * 4),
      }))
    }

    const LINK_DIST = 200
    const PALETTE = [
      { r: 90,  g: 180, b: 255 },
      { r: 180, g: 100, b: 255 },
      { r: 255, g: 80,  b: 160 },
      { r: 255, g: 150, b: 50  },
    ]

    function draw() {
      ctx!.clearRect(0, 0, w, h)

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > LINK_DIST) continue
          const a = (1 - d / LINK_DIST) * 0.6
          const c = PALETTE[nodes[i].colorIdx]
          ctx!.beginPath()
          ctx!.moveTo(nodes[i].x, nodes[i].y)
          ctx!.lineTo(nodes[j].x, nodes[j].y)
          ctx!.strokeStyle = `rgba(${c.r},${c.g},${c.b},${a})`
          ctx!.lineWidth = 1
          ctx!.stroke()
        }
      }

      for (const n of nodes) {
        n.pulse += n.pulseSpeed
        const glow = 0.7 + 0.3 * Math.sin(n.pulse)
        const radius = n.r * glow
        const c = PALETTE[n.colorIdx]

        const grad = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 10)
        grad.addColorStop(0,   `rgba(${c.r},${c.g},${c.b},${n.alpha * 0.55 * glow})`)
        grad.addColorStop(0.4, `rgba(${c.r},${c.g},${c.b},${n.alpha * 0.18 * glow})`)
        grad.addColorStop(1,   'rgba(0,0,0,0)')
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, radius * 10, 0, Math.PI * 2)
        ctx!.fillStyle = grad
        ctx!.fill()

        ctx!.beginPath()
        ctx!.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${c.r},${c.g},${c.b},${n.alpha * glow})`
        ctx!.fill()

        n.x += n.vx; n.y += n.vy
        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
}

function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute orb-center" style={{
        width: '70vw', height: '70vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(90,180,255,0.4) 0%, transparent 70%)',
        filter: 'blur(80px)', top: '-20%', left: '-10%',
      }} />
      <div className="absolute orb-br" style={{
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(160,80,255,0.35) 0%, transparent 70%)',
        filter: 'blur(90px)', top: '20%', left: '25%',
      }} />
      <div className="absolute orb-tr" style={{
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,70,150,0.3) 0%, transparent 70%)',
        filter: 'blur(85px)', top: '-10%', right: '-5%',
      }} />
      <div className="absolute" style={{
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,40,0.3) 0%, transparent 70%)',
        filter: 'blur(90px)', bottom: '-15%', right: '10%',
        animation: 'orb-drift-b 20s ease-in-out infinite alternate',
      }} />
    </div>
  )
}

export default function HeroBackground() {
  return (
    <>
      <GradientOrbs />
      <NetworkCanvas />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.72) 100%)',
        zIndex: 2,
      }} />
    </>
  )
}
