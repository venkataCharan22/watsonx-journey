import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { isMobile, reducedMotion } from '../lib/device'

// Container staggers its glyph children in (condense) and out (evaporate).
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.012, staggerDirection: -1 } },
}
const glyphVar = {
  hidden: { opacity: 0, y: 26, x: 14, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -14, filter: 'blur(5px)', transition: { duration: 0.28 } },
}
// opacity-only variant for reduced-motion / mobile
const glyphSimple = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// deterministically flag ~2 glyphs per run to twinkle
function twinkles(text, i) {
  return text.charCodeAt(i % text.length) % 11 === (i % 11)
}

// Glyph spans are grouped per WORD (inline-block) — bare per-glyph spans let
// the browser break lines mid-word on narrow screens ("watsonx.da / ta").
function Glyphs({ text, grad, twinkleColor, simple }) {
  const v = simple ? glyphSimple : glyphVar
  let gi = 0
  return text.split(/(\s+)/).map((tok, ti) => {
    if (!tok) return null
    const start = gi
    gi += tok.length
    if (/^\s+$/.test(tok)) return <span key={`s${ti}`}>{tok}</span>
    return (
      <span key={`w${ti}`} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
        {[...tok].map((ch, j) => {
          const i = start + j
          const tw = !simple && !grad && twinkles(text, i)
          return (
            <motion.span
              key={j}
              variants={v}
              className={`${grad ? 'grad-text' : ''} ${tw ? 'twinkle' : ''}`}
              style={{ display: 'inline-block', ...(tw ? { '--twinkle': twinkleColor } : null) }}
            >
              {ch}
            </motion.span>
          )
        })}
      </span>
    )
  })
}

// Light twinkle particles scattered around a text block.
function SparkleCanvas({ accent }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const parent = canvas.parentElement
    const ctx = canvas.getContext('2d')
    let raf, last = 0, alive = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let pts = []
    const seed = () => {
      const r = parent.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = r.width + 'px'
      canvas.style.height = r.height + 'px'
      const n = Math.max(8, Math.min(16, Math.round(r.width / 36)))
      pts = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * r.width,
        y: Math.random() * r.height,
        r: 0.6 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.2,
        star: Math.random() < 0.25,
      }))
    }
    seed()
    const draw = (t) => {
      if (!alive) return
      if (t - last > 33) {
        last = t
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const time = t / 1000
        for (const p of pts) {
          const a = 0.35 + 0.45 * Math.sin(time * p.speed + p.phase)
          if (a <= 0.02) continue
          ctx.globalAlpha = Math.max(0, a)
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r + 0.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = Math.max(0, a) * 0.6
          ctx.fillStyle = accent
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2)
          ctx.fill()
          if (p.star && a > 0.6) {
            ctx.strokeStyle = `rgba(255,255,255,${(a - 0.6) * 1.5})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x - 3.5, p.y); ctx.lineTo(p.x + 3.5, p.y)
            ctx.moveTo(p.x, p.y - 3.5); ctx.lineTo(p.x, p.y + 3.5)
            ctx.stroke()
          }
        }
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    const onResize = () => seed()
    window.addEventListener('resize', onResize)
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [accent])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -1 }} />
}

// A constellation text block: eyebrow (star-label) + headline glyphs + caption,
// living in negative space with a white halo so it stays legible on light.
export default function ConstellationText({
  accent = '#0f62fe',
  eyebrow,
  headline = [], // array of { text, grad?, br? }
  caption,
  align = 'left',
  style,
  // Lighter on phones / reduced-motion: opacity-only glyphs, no twinkle, no
  // sparkle canvas — keeps scroll buttery on mobile GPUs.
  simple = isMobile || reducedMotion,
  sparkles = !isMobile && !reducedMotion,
  children,
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'fixed',
        maxWidth: 'min(560px, 86vw)',
        textAlign: align,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <span className="frost-breath" />
      {sparkles && !simple && <SparkleCanvas accent={accent} />}

      {eyebrow && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', marginBottom: 14, color: accent }}>
          <motion.span
            className="leader-line"
            initial={{ width: 0 }}
            animate={{ width: 30 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <span className="font-mono text-halo" style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500 }}>
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className="text-halo"
        style={{ fontFamily: "'IBM Plex Sans'", fontWeight: 300, fontSize: 'clamp(26px, 4.2vw, 50px)', lineHeight: 1.12, letterSpacing: '-0.01em', color: 'var(--ink-0)', margin: 0 }}
      >
        {headline.map((seg, i) =>
          seg.br ? (
            <br key={i} />
          ) : (
            <Glyphs key={i} text={seg.text} grad={seg.grad} twinkleColor={accent} simple={simple} />
          ),
        )}
      </h2>

      {caption && (
        <motion.p
          variants={glyphSimple}
          className="text-halo"
          style={{ marginTop: 16, fontSize: 'clamp(14px,1.7vw,17px)', fontWeight: 400, color: 'var(--ink-1)', lineHeight: 1.5, maxWidth: 440, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}
        >
          {caption}
        </motion.p>
      )}

      {children}
    </motion.div>
  )
}
