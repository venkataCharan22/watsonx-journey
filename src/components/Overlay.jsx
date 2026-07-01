import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { CSS_GRADIENT, ACCENT, hexAt } from '../lib/gradient'
import ConstellationText from './ConstellationText'
import ConstellationRail from './ConstellationRail'

function useIsMobile() {
  const [m, setM] = useState(typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

// progress-tied count so scrubbing stays consistent
function countUp(progress, a, b, max) {
  const t = Math.min(1, Math.max(0, (progress - a) / (b - a)))
  return Math.round(t * max)
}

// Per-beat placement — text always lands in the empty quadrant opposite the 3D
// subject. On mobile everything drops to a lower band the portrait camera clears.
function placeFor(beat, mobile) {
  if (mobile) {
    const base = { left: 18, right: 18, bottom: '17vh', maxWidth: 'none' }
    const center = beat === 'open' || beat === 'modern'
    return { style: base, align: center ? 'center' : 'left' }
  }
  switch (beat) {
    case 'open':
      return { style: { left: '50%', top: '21%', transform: 'translateX(-50%)', width: 'min(640px,90vw)' }, align: 'center' }
    case 'problem':
      return { style: { right: '5vw', top: '15vh', maxWidth: 'min(440px,44vw)' }, align: 'left' }
    case 'decide':
      return { style: { left: '5.5vw', top: '30vh', maxWidth: 'min(440px,44vw)' }, align: 'left' }
    case 'migrate':
      return { style: { left: '5.5vw', top: '24vh', maxWidth: 'min(450px,44vw)' }, align: 'left' }
    case 'modern':
      return { style: { left: '50%', top: '16%', transform: 'translateX(-50%)', width: 'min(660px,92vw)' }, align: 'center' }
    default:
      return { style: {}, align: 'left' }
  }
}

function OpenText({ mobile }) {
  const { style, align } = placeFor('open', mobile)
  return (
    <ConstellationText
      accent={ACCENT.blue}
      eyebrow="IBM watsonx · Data & AI Modernization"
      headline={[{ text: 'The journey of a ' }, { br: true }, { text: 'legacy pipeline', grad: true }]}
      caption="Two AI agents that move Informatica pipelines onto IBM watsonx.data Integration."
      align={align}
      style={style}
    >
      <div className="font-mono text-halo" style={{ marginTop: 16, color: ACCENT.violet, letterSpacing: '0.12em', fontSize: 14 }}>
        decide · migrate · modernize
      </div>
    </ConstellationText>
  )
}

function ProblemText({ mobile, progress }) {
  const { style, align } = placeFor('problem', mobile)
  const n = countUp(progress, 0.1, 0.2, 3000)
  return (
    <ConstellationText
      accent={ACCENT.amber}
      eyebrow="The Problem"
      headline={[{ text: 'Thousands of aging' }, { br: true }, { text: 'Informatica pipelines.' }]}
      caption="Weeks to migrate. By hand."
      align={align}
      style={style}
    >
      <Metric value={`${n.toLocaleString()}+`} label="pipelines · counted by hand" color={ACCENT.amber} align={align} />
    </ConstellationText>
  )
}

function DecideText({ mobile, progress }) {
  const { style, align } = placeFor('decide', mobile)
  const rows = [
    ['Connector parity', 0.33],
    ['Runtime fit', 0.37],
    ['Cost to operate', 0.41],
    ['Lineage & governance', 0.45],
  ]
  return (
    <ConstellationText
      accent={ACCENT.violet}
      eyebrow="Decision Agent"
      headline={[{ text: 'Which platform?' }]}
      caption="An AI agent scores StreamSets vs DataStage — and recommends, explainably."
      align={align}
      style={style}
    >
      <div style={{ marginTop: 16 }}>
        {rows.map(([label, at]) => (
          <ScoreRow key={label} label={label} lit={progress >= at} />
        ))}
        <div className="font-mono text-halo" style={{ marginTop: 12, fontSize: 14, color: ACCENT.blue }}>
          → watsonx.data StreamSets
        </div>
      </div>
    </ConstellationText>
  )
}

function MigrateText({ mobile }) {
  const { style, align } = placeFor('migrate', mobile)
  return (
    <ConstellationText
      accent={ACCENT.blue}
      eyebrow="Migration Agent"
      headline={[{ text: 'Translate the logic.' }, { br: true }, { text: 'Generate the code.' }]}
      caption="Informatica StreamSets → watsonx.data Integration."
      align={align}
      style={style}
    >
      <div className="font-mono text-halo" style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.9 }}>
        <div style={{ color: 'var(--ink-2)' }}>EXP → JNR → LKP → FIL</div>
        <div style={{ color: ACCENT.green }}>Source → Transform → Join → Mask → Target</div>
      </div>
    </ConstellationText>
  )
}

function ModernText({ mobile, progress }) {
  const { style, align } = placeFor('modern', mobile)
  const weeks = 6 - countUp(progress, 0.78, 0.96, 6)
  return (
    <ConstellationText
      accent={ACCENT.green}
      eyebrow="Modernized"
      headline={[{ text: 'Reborn on IBM watsonx.data' }, { br: true }, { text: 'Integration' }]}
      caption="Weeks to minutes."
      align={align}
      style={style}
    >
      <div className="font-mono text-halo" style={{ marginTop: 12, fontSize: 14, color: ACCENT.green }}>
        ~{Math.max(weeks, 0)} weeks → minutes
      </div>
    </ConstellationText>
  )
}

function Metric({ value, label, color, align }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
        <span className="font-mono text-halo" style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color }}>
          {value}
        </span>
      </div>
      <div className="text-halo" style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function ScoreRow({ label, lit }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '1px solid rgba(15,98,254,0.1)',
        opacity: lit ? 1 : 0.32,
        transition: 'opacity 0.5s ease',
      }}
    >
      <span className="text-halo" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--ink-1)' }}>
        <motion.span
          animate={{ scale: lit ? [0.6, 1.3, 1] : 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: 9, height: 9, borderRadius: '50%', display: 'inline-block', background: lit ? ACCENT.green : 'transparent', border: `1.5px solid ${lit ? ACCENT.green : 'rgba(11,18,32,0.3)'}` }}
        />
        {label}
      </span>
      <span className="font-mono text-halo" style={{ fontSize: 12, color: lit ? ACCENT.green : 'var(--ink-2)' }}>
        {lit ? '✓ StreamSets' : '· · ·'}
      </span>
    </div>
  )
}

// The ONE solid surface — the scannable QR end tile.
function EndTile({ mobile, show }) {
  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed',
            bottom: mobile ? '7vh' : '12vh',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 55,
          }}
        >
          <div className="qr-box">
            <img src={`${import.meta.env.BASE_URL}qr.png`} alt="Scan to open the experience" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p className="grad-text" style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.01em' }}>decide. migrate. modernize.</p>
            <p className="text-halo" style={{ color: 'var(--ink-2)', fontSize: 13, margin: '6px 0 12px' }}>Scan to explore the project.</p>
            <button className="font-mono soft-pulse" onClick={backToTop} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT.blue, fontSize: 12, letterSpacing: '0.12em', padding: 0 }}>
              ↑ BACK TO THE SOURCE
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BrandLockup() {
  return (
    <div style={{ position: 'fixed', left: 'clamp(18px,3vw,32px)', top: 22, display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 60 }}>
      <span className="font-mono" style={{ fontWeight: 700, fontSize: 15, color: ACCENT.blue }}>IBM</span>
      <span className="text-halo" style={{ fontSize: 13, color: 'var(--ink-2)' }}>watsonx · Data &amp; AI Modernization</span>
    </div>
  )
}

function ProgressBar({ progress }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(15,98,254,0.08)', zIndex: 70 }}>
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: CSS_GRADIENT,
          backgroundSize: '100vw 100%',
          backgroundRepeat: 'no-repeat',
          boxShadow: `0 0 10px ${hexAt(progress)}66`,
        }}
      />
    </div>
  )
}

function ScrollCue({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="cue-bob"
          style={{ position: 'fixed', bottom: 30, left: '50%', zIndex: 60, textAlign: 'center', pointerEvents: 'none' }}
        >
          <div className="font-mono text-halo" style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--ink-2)', marginBottom: 6 }}>SCROLL</div>
          <div className="text-halo" style={{ fontSize: 18, color: ACCENT.blue, lineHeight: 1 }}>↓</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Overlay() {
  const progress = useStore((s) => s.progress)
  const mobile = useIsMobile()

  const showOpen = progress < 0.075
  const showProblem = progress >= 0.085 && progress < 0.275
  const showDecide = progress >= 0.285 && progress < 0.495
  const showMigrate = progress >= 0.505 && progress < 0.735
  const showModern = progress >= 0.745

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
      <ProgressBar progress={progress} />
      <BrandLockup />

      <AnimatePresence>
        {showOpen && <OpenText key="open" mobile={mobile} />}
        {showProblem && <ProblemText key="problem" mobile={mobile} progress={progress} />}
        {showDecide && <DecideText key="decide" mobile={mobile} progress={progress} />}
        {showMigrate && <MigrateText key="migrate" mobile={mobile} />}
        {showModern && <ModernText key="modern" mobile={mobile} progress={progress} />}
      </AnimatePresence>

      <EndTile mobile={mobile} show={progress >= 0.9} />
      <ConstellationRail />
      <ScrollCue show={progress < 0.05} />
    </div>
  )
}
