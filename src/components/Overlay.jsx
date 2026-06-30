import { motion, AnimatePresence } from 'framer-motion'
import { useStore, actIndexFor } from '../store'
import { CSS_GRADIENT, ACCENT, hexAt } from '../lib/gradient'

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const EYEBROWS = ['', 'THE PROBLEM', 'DECISION AGENT', 'MIGRATION AGENT', 'MODERNIZED']

function Eyebrow({ children, color }) {
  return (
    <div className="chip font-mono" style={{ color, borderColor: color + '40', background: color + '12' }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, display: 'inline-block' }} />
      {children}
    </div>
  )
}

// progress-tied count so scrubbing stays consistent
function countUp(progress, a, b, max) {
  const t = Math.min(1, Math.max(0, (progress - a) / (b - a)))
  return Math.round(t * max)
}

function CenterStage({ children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', padding: 24 }}>
      {children}
    </div>
  )
}

function HeroCard() {
  const begin = useStore((s) => s.begin)
  const started = useStore((s) => s.started)
  return (
    <CenterStage>
      <motion.div
        {...fade}
        className="card"
        style={{ width: 'min(620px, 88vw)', padding: '38px 40px', textAlign: 'center', pointerEvents: 'auto' }}
      >
        <Eyebrow color={ACCENT.blue}>IBM watsonx · Data &amp; AI Modernization</Eyebrow>
        <h1 style={{ fontSize: 'clamp(28px, 4.4vw, 46px)', fontWeight: 600, lineHeight: 1.08, margin: '18px 0 8px', letterSpacing: '-0.02em' }}>
          The journey of a <span className="grad-text">legacy pipeline</span>
        </h1>
        <p className="font-mono" style={{ color: ACCENT.violet, letterSpacing: '0.08em', fontSize: 15, margin: '4px 0 14px' }}>
          decide. migrate. modernize.
        </p>
        <p style={{ color: 'var(--ink-1)', fontSize: 'clamp(14px,1.7vw,17px)', maxWidth: 460, margin: '0 auto 26px', lineHeight: 1.5 }}>
          Two AI agents that move Informatica pipelines onto IBM watsonx.data Integration.
        </p>
        {!started && (
          <button className="cta" onClick={begin}>
            ▶ Begin the journey
          </button>
        )}
      </motion.div>
    </CenterStage>
  )
}

function SideCard({ side = 'left', vpos = 'bottom', accent, eyebrow, heading, children }) {
  const style = {
    position: 'fixed',
    [side]: 'clamp(20px, 4vw, 56px)',
    [vpos]: 'clamp(96px, 14vh, 130px)',
    width: 'min(400px, 86vw)',
    padding: '24px 26px',
    pointerEvents: 'none',
  }
  return (
    <motion.div {...fade} className="card" style={style}>
      <Eyebrow color={accent}>{eyebrow}</Eyebrow>
      <h2 style={{ fontSize: 'clamp(20px,2.6vw,27px)', fontWeight: 600, lineHeight: 1.12, margin: '14px 0 10px', letterSpacing: '-0.01em' }}>
        {heading}
      </h2>
      {children}
    </motion.div>
  )
}

function ProblemCard({ progress }) {
  const n = countUp(progress, 0.1, 0.2, 3000)
  return (
    <SideCard side="left" accent={ACCENT.amber} eyebrow="THE PROBLEM" heading="Thousands of aging Informatica pipelines.">
      <p style={{ color: 'var(--ink-1)', fontSize: 16, lineHeight: 1.5 }}>Weeks to migrate. By hand.</p>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="font-mono" style={{ fontSize: 34, fontWeight: 600, color: ACCENT.amber }}>
          {n.toLocaleString()}+
        </span>
        <span style={{ color: 'var(--ink-2)', fontSize: 13 }}>pipelines · counted by hand</span>
      </div>
    </SideCard>
  )
}

function ScoreRow({ label, show }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderBottom: '1px solid rgba(15,98,254,0.08)',
        opacity: show ? 1 : 0.18,
        transition: 'opacity 0.4s ease',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--ink-1)' }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 12, color: show ? ACCENT.green : 'var(--ink-2)' }}>
        {show ? '✓ StreamSets' : '· · ·'}
      </span>
    </div>
  )
}

function DecideCard({ progress }) {
  const rows = [
    ['Connector parity', 0.33],
    ['Runtime fit', 0.37],
    ['Cost to operate', 0.41],
    ['Lineage & governance', 0.45],
  ]
  return (
    <SideCard side="right" accent={ACCENT.violet} eyebrow="DECISION AGENT" heading="Which platform?">
      <p style={{ color: 'var(--ink-1)', fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>
        An AI agent scores StreamSets vs DataStage — and recommends, explainably.
      </p>
      <div>
        {rows.map(([label, at]) => (
          <ScoreRow key={label} label={label} show={progress >= at} />
        ))}
      </div>
      <p className="font-mono" style={{ marginTop: 12, fontSize: 14, color: ACCENT.blue }}>
        → watsonx.data StreamSets
      </p>
    </SideCard>
  )
}

function MigrateCard() {
  return (
    <SideCard side="right" vpos="top" accent={ACCENT.blue} eyebrow="MIGRATION AGENT" heading="Translate the logic. Generate the code.">
      <p style={{ color: 'var(--ink-1)', fontSize: 15, lineHeight: 1.5 }}>
        Informatica StreamSets → watsonx.data Integration.
      </p>
      <div
        className="font-mono"
        style={{ marginTop: 14, background: 'rgba(15,98,254,0.05)', border: '1px solid rgba(15,98,254,0.12)', borderRadius: 10, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.7, color: 'var(--ink-1)' }}
      >
        <div style={{ color: 'var(--ink-2)' }}># informatica mapping</div>
        <div>EXP → JNR → LKP → FIL</div>
        <div style={{ color: ACCENT.green, marginTop: 6 }}># watsonx.data streamsets</div>
        <div style={{ color: 'var(--ink-0)' }}>Source → Transform → Join → Mask → Target</div>
      </div>
    </SideCard>
  )
}

function EndCard({ progress }) {
  const replay = useStore((s) => s.replay)
  const reveal = progress >= 0.9
  const weeks = 6 - countUp(progress, 0.78, 0.96, 6) // 6 weeks -> 0
  return (
    <CenterStage>
      <motion.div
        {...fade}
        className="card"
        style={{ width: 'min(640px, 90vw)', padding: '34px 38px', textAlign: 'center', pointerEvents: 'auto' }}
      >
      <Eyebrow color={ACCENT.green}>MODERNIZED</Eyebrow>
      <h2 style={{ fontSize: 'clamp(22px,3.2vw,34px)', fontWeight: 600, lineHeight: 1.1, margin: '16px 0 6px', letterSpacing: '-0.01em' }}>
        Reborn on IBM watsonx.data Integration
      </h2>
      <p style={{ color: 'var(--ink-1)', fontSize: 17, marginBottom: 4 }}>
        Weeks to minutes.
      </p>
      <p className="font-mono" style={{ color: ACCENT.green, fontSize: 13, marginBottom: 22 }}>
        ~{Math.max(weeks, 0)} weeks → minutes
      </p>

      <div style={{ display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div className="qr-box">
          <img
            src={`${import.meta.env.BASE_URL}qr.png`}
            alt="Scan to open the experience"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <p className="grad-text" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>decide. migrate. modernize.</p>
          <p style={{ color: 'var(--ink-2)', fontSize: 13, margin: '6px 0 14px' }}>Scan to explore the project.</p>
          {reveal && (
            <button className="ctl-btn" onClick={replay}>
              ↻ Replay
            </button>
          )}
        </div>
        </div>
      </motion.div>
    </CenterStage>
  )
}

function BrandLockup() {
  return (
    <div style={{ position: 'fixed', left: 'clamp(18px,3vw,32px)', top: 22, display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none' }}>
      <span className="font-mono" style={{ fontWeight: 700, fontSize: 15, color: ACCENT.blue }}>IBM</span>
      <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>watsonx · Data &amp; AI Modernization</span>
    </div>
  )
}

function ProgressBar({ progress }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(15,98,254,0.08)', zIndex: 60 }}>
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

function Controls() {
  const progress = useStore((s) => s.progress)
  const playing = useStore((s) => s.playing)
  const goToAct = useStore((s) => s.goToAct)
  const nextAct = useStore((s) => s.nextAct)
  const prevAct = useStore((s) => s.prevAct)
  const togglePlay = useStore((s) => s.togglePlay)
  const idx = actIndexFor(progress)
  const colors = [ACCENT.amber, ACCENT.amber, ACCENT.violet, ACCENT.blue, ACCENT.green]

  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 14, zIndex: 60, pointerEvents: 'auto' }}>
      <button className="ctl-btn" onClick={prevAct}>← Prev</button>
      <button className="ctl-btn" onClick={togglePlay} style={{ minWidth: 84 }}>
        {progress >= 1 ? '↻ Replay' : playing ? '❚❚ Pause' : '▶ Play'}
      </button>
      <div style={{ display: 'flex', gap: 11, padding: '0 6px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            className={`dot ${idx === i ? 'active' : ''}`}
            style={{ color: colors[i] }}
            onClick={() => goToAct(i)}
            aria-label={`Beat ${i + 1}`}
          />
        ))}
      </div>
      <button className="ctl-btn" onClick={nextAct}>Next →</button>
    </div>
  )
}

export default function Overlay() {
  const progress = useStore((s) => s.progress)
  const started = useStore((s) => s.started)

  const showHero = progress < 0.075
  const showProblem = progress >= 0.09 && progress < 0.275
  const showDecide = progress >= 0.295 && progress < 0.495
  const showMigrate = progress >= 0.515 && progress < 0.735
  const showEnd = progress >= 0.765

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
      <ProgressBar progress={progress} />
      <BrandLockup />

      <AnimatePresence>
        {showHero && <HeroCard key="hero" />}
        {showProblem && <ProblemCard key="problem" progress={progress} />}
        {showDecide && <DecideCard key="decide" progress={progress} />}
        {showMigrate && <MigrateCard key="migrate" />}
        {showEnd && <EndCard key="end" progress={progress} />}
      </AnimatePresence>

      {started && <Controls />}
    </div>
  )
}
