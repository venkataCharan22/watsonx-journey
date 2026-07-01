import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
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

  useEffect(() => {
    const t = setTimeout(() => setShowScene(true), 150)
    return () => clearTimeout(t)
  }, [])

  // Drive the journey from scroll position.
  useEffect(() => {
    const setScroll = useStore.getState().setScroll
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScroll(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}</AnimatePresence>

      {/* Fixed cinematic layer */}
      {showScene && (
        <div style={{ position: 'fixed', inset: 0, opacity: loaded ? 1 : 0, transition: 'opacity 0.9s ease', zIndex: 1 }}>
          <Scene />
          <Overlay />
        </div>
      )}

      {/* Tall invisible spacer that creates the scroll range driving the journey */}
      <div aria-hidden style={{ height: `${SCROLL_SCREENS * 100}svh`, pointerEvents: 'none' }} />

      {/* thin gradient hairline at the very top — ties back to the IBM poster */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: CSS_GRADIENT, zIndex: 70, pointerEvents: 'none' }} />
    </>
  )
}
