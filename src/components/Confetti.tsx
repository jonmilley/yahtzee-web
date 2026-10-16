import { useEffect, useRef } from 'react'

const COLORS = ['#ffc23d', '#f6f6f1', '#d2453f', '#2747b8', '#8fd8cc']

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  w: number
  h: number
  color: string
}

// Full-screen confetti burst. Bump `burst` to fire another one.
export default function Confetti({ burst }: { burst: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pieces = useRef<Piece[]>([])
  const lastBurst = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr

    const isNewBurst = burst > 0 && burst !== lastBurst.current
    lastBurst.current = burst
    for (let i = 0; isNewBurst && i < 170; i++) {
      pieces.current.push({
        x: w / 2 + (Math.random() - 0.5) * Math.min(w, 700) * 0.5,
        y: h * 0.38,
        vx: (Math.random() - 0.5) * 18,
        vy: -8 - Math.random() * 15,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.4,
        w: 7 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        color: COLORS[i % COLORS.length],
      })
    }

    if (!pieces.current.length) return
    let raf = 0
    const step = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      pieces.current = pieces.current.filter(p => p.y < h + 30)
      for (const p of pieces.current) {
        p.vy = p.vy * 0.985 + 0.38
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.spin
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.rot * 2))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (pieces.current.length) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [burst])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />
}
