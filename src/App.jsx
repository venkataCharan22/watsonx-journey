import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
import DeepDive from './components/DeepDive'
import { useStore, SCROLL_SCREENS } from './store'
import { CSS_GRADIENT, ACCENT } from './lib/gradient'

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(id)
          setTimeout(onComplete, 450)
          return 100
        }
        return prev + Math.random() * 9 + 3
      })
    }, 90)
    return () => clearInterval(id)
  }, [onComplete])

  return (
    <motion.div className="loading-screen" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center' }}>
        <div className="font-mono" style={{ fontSize: 13, letterSpacing: '0.14em', color: ACCENT.blue, marginBottom: 14 }}>
          IBM watsonx · DATA &amp; AI MODERNIZATION
        </div>
        <h1 style={{ fontSize: 'clamp(24px,3.6vw,38px)', fontWeight: 600, letterSpacing: '-0.02em' }}>
          The journey of a <span className="grad-text">legacy pipeline</span>
        </h1>
      </motion.div>
      <div className="loading-bar-track">
        <div className="loading-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-mono"
        style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 12, letterSpacing: '0.1em' }}
      >
        {Math.min(Math.round(progress), 100)}%
      </motion.p>
    </motion.div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [showScene, setShowScene] = useState(false)
  const cineRef = useRef(null) // fixed 3D layer — faded out by scroll as the deep-dive enters
  const spacerRef = useRef(null) // measures the cinematic scroll range
  const loadedRef = useRef(false)

  useEffect(() => {
    loadedRef.current = loaded
  }, [loaded])

  useEffect(() => {
    const t = setTimeout(() => setShowScene(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Drive the cinematic from scroll — but only within the spacer's range, so the
  // deep-dive content below doesn't distort the 0→1 progress. Then fade the 3D
  // layer out as the deep-dive scrolls in.
  useEffect(() => {
    const { setScroll, setInDeepDive } = useStore.getState()
    let spacerH = Math.max(1, SCROLL_SCREENS * window.innerHeight)
    const recompute = () => {
      spacerH = Math.max(1, spacerRef.current?.offsetHeight || SCROLL_SCREENS * window.innerHeight)
      apply()
    }
    const apply = () => {
      const y = window.scrollY
      setScroll(Math.min(1, y / spacerH))
      // hand off from cinematic to content near the end of the spacer
      const vh = window.innerHeight
      const fadeStart = spacerH - vh * 0.6
      const fadeEnd = spacerH + vh * 0.1
      const op = 1 - Math.min(1, Math.max(0, (y - fadeStart) / (fadeEnd - fadeStart || 1)))
      if (cineRef.current && loadedRef.current) {
        cineRef.current.style.opacity = String(op)
        cineRef.current.style.pointerEvents = op < 0.04 ? 'none' : ''
      }
      // freeze the occluded canvas so the deep-dive scrolls at 60fps
      setInDeepDive(y > spacerH - vh * 0.5)
    }
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        apply()
        ticking = false
      })
    }
    const onOrient = () => setTimeout(recompute, 200)
    recompute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', recompute)
    window.addEventListener('orientationchange', onOrient)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', recompute)
      window.removeEventListener('orientationchange', onOrient)
    }
  }, [])

  return (
    <>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}</AnimatePresence>

      {/* Fixed cinematic layer (scroll fades its opacity via cineRef) */}
      {showScene && (
        <div ref={cineRef} style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: loaded ? 1 : 0, transition: 'opacity 0.9s ease' }}>
            <Scene />
            <Overlay />
          </div>
        </div>
      )}

      {/* Tall invisible spacer that creates the cinematic scroll range */}
      <div ref={spacerRef} aria-hidden style={{ height: `${SCROLL_SCREENS * 100}svh`, pointerEvents: 'none' }} />

      {/* Real content that scrolls in after the cinematic */}
      <DeepDive />

      {/* thin gradient hairline at the very top — ties back to the IBM poster */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: CSS_GRADIENT, zIndex: 70, pointerEvents: 'none' }} />
    </>
  )
}
