import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollStage from './components/ScrollStage'
import { CSS_GRADIENT, ACCENT } from './lib/palette'

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(id)
          setTimeout(onComplete, 400)
          return 100
        }
        return prev + Math.random() * 10 + 4
      })
    }, 85)
    return () => clearInterval(id)
  }, [onComplete])

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(120% 90% at 50% 20%, #0b1226, #05070f 82%)',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', padding: '0 24px' }}>
        <div className="font-mono" style={{ fontSize: 12, letterSpacing: '0.16em', color: ACCENT.cyan, marginBottom: 14 }}>
          IBM watsonx · MIGRATION SUITE
        </div>
        <h1 style={{ fontWeight: 300, fontSize: 'clamp(22px,4vw,34px)', letterSpacing: '-0.01em', color: '#f4f7ff', lineHeight: 1.2 }}>
          Informatica PowerCenter <span className="grad-text">→ watsonx.data</span>
        </h1>
      </motion.div>
      <div style={{ width: 300, maxWidth: '70vw', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden', marginTop: 26 }}>
        <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: CSS_GRADIENT, borderRadius: 999, transition: 'width 0.2s ease' }} />
      </div>
    </motion.div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <h1 className="sr-only">Migrate from Informatica PowerCenter to IBM watsonx.data integration — Analyze. Decide. Migrate.</h1>
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}</AnimatePresence>
      <ScrollStage />
      {/* chapter rail + live progress */}
      <div className="chapter-rail" data-chapter="0">
        <div className="chapter-fill" />
        <div className="chapter-ticks">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="tick" style={{ color: TICK_COLORS[i] }} />
          ))}
        </div>
        <div className="chapter-counter font-mono" aria-live="polite">01 / 08 · Landing</div>
      </div>
    </>
  )
}

const TICK_COLORS = ['#ff832b', '#ffae57', '#8a3ffc', '#a56eff', '#0f62fe', '#3a8bff', '#1faa6b', '#42be65']
