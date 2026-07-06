import { useEffect, useRef, useState } from 'react'
import { ACCENT } from '../lib/gradient'

// Adds an `in` class the first time the element scrolls into view.
function useInView(margin = '-10% 0px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: margin, threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, margin])
  return [ref, seen]
}

function Section({ children, style }) {
  const [ref, seen] = useInView()
  return (
    <div ref={ref} className={`dd-section dd-in${seen ? ' in' : ''}`} style={{ marginTop: 56, ...style }}>
      {children}
    </div>
  )
}

function Card({ accent = ACCENT.blue, children, style }) {
  return (
    <div className="card card-spine" style={{ '--spine': accent, ...style }}>
      {children}
    </div>
  )
}

function Eyebrow({ children, color }) {
  return (
    <div className="dd-mono" style={{ textTransform: 'uppercase', letterSpacing: '0.16em', color, marginBottom: 10 }}>
      {children}
    </div>
  )
}

/* ---------------- Sections ---------------- */

function Handoff() {
  const [ref, seen] = useInView('0px')
  return (
    <div
      ref={ref}
      className={`dd-in${seen ? ' in' : ''}`}
      style={{
        position: 'relative',
        paddingTop: 150,
        // feather the green river into white as it scrolls up
        background: 'linear-gradient(to bottom, transparent 0, var(--bg-0) 150px)',
      }}
    >
      <div className="dd-section" style={{ textAlign: 'center' }}>
        <div className="dd-mono" style={{ letterSpacing: '0.2em', fontSize: 13, marginBottom: 18 }}>
          <span style={{ color: ACCENT.amber }}>DECIDE</span>
          <span style={{ color: 'var(--ink-2)' }}> → </span>
          <span style={{ color: ACCENT.violet }}>MIGRATE</span>
          <span style={{ color: 'var(--ink-2)' }}> → </span>
          <span style={{ color: ACCENT.green }}>MODERNIZE</span>
        </div>
        <h2 className="dd-h" style={{ fontSize: 'clamp(24px,7vw,34px)' }}>
          Two agents, <span className="grad-text">one funnel.</span>
        </h2>
        <p className="dd-body" style={{ maxWidth: 520, margin: '14px auto 0' }}>
          A Decision Agent that triages — choose the platform — and a Migration Agent that executes — build the flow.
          This is where the film lands and the real story begins.
        </p>
        <div className="dd-mono soft-pulse" style={{ marginTop: 26, color: 'var(--ink-2)' }}>
          the real story ↓
        </div>
      </div>
    </div>
  )
}

function FunnelNode({ label, sub, color, filled }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '11px 18px',
        borderRadius: 12,
        border: `1.5px solid ${color}`,
        background: filled ? color : 'rgba(255,255,255,0.9)',
        color: filled ? '#fff' : 'var(--ink-0)',
        maxWidth: 300,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      {sub && <span className="font-mono" style={{ fontSize: 11, opacity: 0.75 }}>{sub}</span>}
    </div>
  )
}

function Spine() {
  return <div style={{ width: 2, height: 26, background: 'linear-gradient(#8a3ffc,#0f62fe)', borderRadius: 2 }} />
}

function Funnel() {
  const branch = [
    { label: 'StreamSets', color: ACCENT.cyan, style: {} },
    { label: 'DataStage', color: ACCENT.violet, style: { opacity: 0.45 } },
    { label: 'Manual Review', color: ACCENT.amber, style: { borderStyle: 'dashed' } },
  ]
  return (
    <Section>
      <h2 className="dd-h">One end-to-end funnel</h2>
      <p className="dd-body">
        An Informatica export goes in; a modernized watsonx.data flow comes out. The Decision Agent routes every
        pipeline — StreamSets, DataStage, or Manual Review. StreamSets-bound pipelines then flow to the Migration Agent.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, textAlign: 'center' }}>
        <FunnelNode label="Informatica export" sub=".xml / IICS .zip" color={ACCENT.amber} />
        <Spine />
        <FunnelNode label="Decision Agent" sub="triage · 6 factors" color={ACCENT.violet} />
        <Spine />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 340 }}>
          {branch.map((b) => (
            <span
              key={b.label}
              className="font-mono"
              style={{
                padding: '7px 12px',
                borderRadius: 999,
                border: `1.5px solid ${b.color}`,
                color: b.color,
                fontSize: 12.5,
                ...b.style,
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
        <div className="dd-mono" style={{ margin: '8px 0 6px', color: ACCENT.cyan }}>StreamSets-bound ↓</div>
        <FunnelNode label="Migration Agent" sub="parse → translate → run" color={ACCENT.blue} />
        <Spine />
        <FunnelNode label="watsonx.data Integration" sub="live flow" color={ACCENT.green} filled />
      </div>
    </Section>
  )
}

const FACTORS = [
  ['Transform load', 'few / light', 'many / heavy (JOINER, LOOKUP…)'],
  ['Real-time vs batch', 'CDC · Kafka · streaming', 'bulk load · SCD · star schema'],
  ['Tech stack', 'REST · API · JSON · K8s', 'Mainframe · COBOL · SAP · MQ'],
  ['Orchestration', 'few microservice flows', 'many batch collections'],
  ['Parallelism', 'none', 'heavy real partitions'],
  ['Schema & SQL', 'thin · narrow', 'many SQL overrides · wide'],
]

function FactorGrid() {
  const [ref, seen] = useInView()
  return (
    <div ref={ref} className={`dd-section dd-in${seen ? ' in' : ''}`} style={{ marginTop: 56 }}>
      <h2 className="dd-h">The 6 factors, weighted</h2>
      <p className="dd-body" style={{ marginBottom: 8 }}>
        Each factor leans a pipeline toward one platform — matched against extracted values, not raw XML.
      </p>
      <div className="dd-mono" style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0 4px' }}>
        <span style={{ color: ACCENT.cyan }}>◀ StreamSets</span>
        <span style={{ color: ACCENT.violet }}>DataStage ▶</span>
      </div>
      <Card accent={ACCENT.violet} style={{ padding: '4px 18px' }}>
        {FACTORS.map(([name, ss, ds], i) => (
          <div className="factor-row" key={name} style={{ borderBottom: i === FACTORS.length - 1 ? 'none' : undefined }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--ink-0)', marginBottom: 5 }}>
              <span className="font-mono" style={{ color: 'var(--ink-2)', fontSize: 12, marginRight: 8 }}>{i + 1}</span>
              {name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
              <span style={{ color: ACCENT.cyan, flex: 1 }}>{ss}</span>
              <span style={{ color: ACCENT.violet, flex: 1, textAlign: 'right' }}>{ds}</span>
            </div>
          </div>
        ))}
      </Card>
      <p className="dd-mono" style={{ marginTop: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
        + boosts: massive export → DS · pure legacy → DS · cloud-native streaming → SS
      </p>
    </div>
  )
}

function Outcomes() {
  const bands = [
    ['Very High', '90–100'],
    ['High', '75–89'],
    ['Moderate', '60–74'],
    ['Low', '40–59'],
  ]
  return (
    <Section>
      <h2 className="dd-h">Three outcomes, with confidence</h2>
      <p className="dd-body">
        The score resolves to StreamSets, DataStage, or Manual Review Required — when the two land within 5%, the agent
        refuses to guess. Every recommendation carries a confidence band and the full rationale that produced it.
      </p>
      <Card accent={ACCENT.amber} style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="dd-pill" style={{ '--pill': ACCENT.cyan }}>StreamSets</span>
          <span className="dd-pill" style={{ '--pill': ACCENT.violet }}>DataStage</span>
          <span className="dd-pill dashed" style={{ '--pill': ACCENT.amber }}>Manual Review</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
          {bands.map(([b, r], i) => (
            <div key={b} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: 6, borderRadius: 3, background: i === 1 ? ACCENT.green : 'rgba(11,18,32,0.1)' }} />
              <div className="dd-mono" style={{ fontSize: 10.5, marginTop: 6, color: i === 1 ? ACCENT.green : 'var(--ink-2)' }}>{b}</div>
              <div className="dd-mono" style={{ fontSize: 10, color: 'var(--ink-2)' }}>{r}</div>
            </div>
          ))}
        </div>
        <p className="dd-mono" style={{ marginTop: 16, color: 'var(--ink-2)' }}>
          gap &lt; 5% → Manual Review · batch consensus 82%
        </p>
      </Card>
    </Section>
  )
}

function MigrationStepper() {
  const steps = [
    ['Parse', 'PowerCenter XML → mappings, transforms, sessions, workflows'],
    ['Plan', 'map to StreamSets stages + a readiness / coverage view'],
    ['Translate', 'rules first (high confidence), AI fallback ("Bob") for the rest'],
    ['Generate', 'a self-contained runnable Python script per mapping'],
    ['Build · Review · Run', 'build offline · review the code · run to create the flow'],
  ]
  return (
    <Section>
      <Eyebrow color={ACCENT.blue}>THE HANDS · EXECUTION</Eyebrow>
      <h2 className="dd-h">Migration Agent</h2>
      <p className="dd-body" style={{ marginBottom: 20 }}>
        Takes a PowerCenter mapping and actually converts it into a runnable watsonx.data StreamSets flow.
      </p>
      <Card accent={ACCENT.blue} style={{ padding: '8px 18px' }}>
        {steps.map(([t, d], i) => (
          <div key={t} style={{ display: 'flex', gap: 14, padding: '13px 0', borderBottom: i === steps.length - 1 ? 'none' : '1px solid rgba(15,98,254,0.1)' }}>
            <div className="font-mono" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${ACCENT.blue}`, color: ACCENT.blue, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-0)' }}>
                {t}
                {i === 4 && <span className="dd-pill" style={{ '--pill': ACCENT.green, marginLeft: 8, padding: '2px 8px', fontSize: 10.5 }}>offline-first</span>}
              </div>
              <div className="dd-body" style={{ fontSize: 13.5, marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </Card>
    </Section>
  )
}

function AiFallback() {
  return (
    <Section>
      <h2 className="dd-h">Rules first, AI where rules can't reach</h2>
      <p className="dd-body">
        Rule-based translation handles the high-confidence majority. What rules can't reach falls back to an internal
        LLM (“Bob”) — and every AI line is flagged <span className="font-mono" style={{ color: ACCENT.amber }}>needs_review</span> so a human signs off. Nothing is a black box.
      </p>
      <Card accent={ACCENT.green} style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span className="dd-pill" style={{ '--pill': ACCENT.green }}>RULES · high confidence</span>
        <span className="dd-pill dashed" style={{ '--pill': ACCENT.amber }}>AI (Bob) · needs_review</span>
        <span className="dd-pill" style={{ '--pill': ACCENT.blue }}>→ human review</span>
      </Card>
    </Section>
  )
}

function OfflineSafe() {
  return (
    <Section>
      <h2 className="dd-h">Offline by default, reviewable by design</h2>
      <p className="dd-body">
        Build generates the scripts entirely offline — nothing touches watsonx.data. You read and download the Python,
        and only <span style={{ color: ACCENT.green, fontWeight: 600 }}>run</span> executes it: authenticating and creating the live flow.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <span className="dd-pill" style={{ '--pill': 'var(--ink-2)' }}>BUILD · offline</span>
        <span className="dd-mono" style={{ color: 'var(--ink-2)', alignSelf: 'center' }}>→</span>
        <span className="dd-pill" style={{ '--pill': ACCENT.blue }}>REVIEW · download</span>
        <span className="dd-mono" style={{ color: 'var(--ink-2)', alignSelf: 'center' }}>→</span>
        <span className="dd-pill" style={{ '--pill': ACCENT.green }}>RUN · creates flow</span>
      </div>
    </Section>
  )
}

function SharedDNA() {
  const traits = ['same PowerCenter XML', 'keyword / rule-driven', 'FastAPI + React / Carbon', 'explainable output']
  return (
    <Section>
      <h2 className="dd-h">Shared DNA — the choice and the change</h2>
      <p className="dd-body">
        There's no public IBM Informatica→wxDI converter. Together these two agents close that gap — the Decision Agent
        owns the <span style={{ color: ACCENT.violet, fontWeight: 600 }}>choice</span>, the Migration Agent owns the <span style={{ color: ACCENT.blue, fontWeight: 600 }}>change</span>.
      </p>
      <Card accent={ACCENT.blue} style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {traits.map((t) => (
          <span key={t} className="dd-pill" style={{ '--pill': ACCENT.blue }}>{t}</span>
        ))}
      </Card>
    </Section>
  )
}

function StatusAndCTA() {
  return (
    <Section style={{ marginBottom: 40 }}>
      <h2 className="dd-h">Stack &amp; status</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <Card accent={ACCENT.violet}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Decision Agent</div>
          <div className="dd-body" style={{ fontSize: 13.5 }}>Rule engine · PowerCenter + IICS parsers · console/JSON/batch reports · React 19 + Vite + Carbon web app with per-mapping consensus.</div>
          <span className="dd-pill" style={{ '--pill': ACCENT.green, marginTop: 12 }}>working</span>
        </Card>
        <Card accent={ACCENT.blue}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Migration Agent</div>
          <div className="dd-body" style={{ fontSize: 13.5 }}>FastAPI · watsonx.data Integration Python SDK · React 19 + Carbon · Groq / Bob LLM · SQLite. Custom codegen replaced the SDK generator.</div>
          <span className="dd-pill" style={{ '--pill': ACCENT.green, marginTop: 12 }}>proven end-to-end</span>
        </Card>
      </div>

      <div className="dd-hairline" style={{ margin: '44px 0 28px' }} />

      <div style={{ textAlign: 'center' }}>
        <h2 className="dd-h" style={{ fontSize: 'clamp(22px,6vw,30px)' }}>
          A defensible decision <span className="grad-text">and</span> a reviewable migration.
        </h2>
        <p className="dd-body" style={{ maxWidth: 460, margin: '10px auto 26px' }}>Weeks of hand-work, compressed to minutes.</p>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="qr-box">
            <img src={`${import.meta.env.BASE_URL}qr.png`} alt="Scan to open the experience" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <p className="grad-text" style={{ fontSize: 22, fontWeight: 700 }}>decide. migrate. modernize.</p>
          <button
            className="font-mono soft-pulse"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT.blue, fontSize: 12, letterSpacing: '0.12em' }}
          >
            ↑ BACK TO THE SOURCE
          </button>
        </div>
      </div>
    </Section>
  )
}

export default function DeepDive() {
  return (
    <section style={{ position: 'relative', zIndex: 2, background: 'var(--bg-0)', paddingBottom: '12vh' }}>
      <Handoff />
      <Funnel />
      <Section>
        <Eyebrow color={ACCENT.violet}>THE BRAIN · TRIAGE</Eyebrow>
        <h2 className="dd-h">Decision Agent</h2>
        <p className="dd-body">
          Auto-detects and parses PowerCenter XML or an IICS folder/ZIP into one ~25-field metrics shape. Six weighted
          factors score StreamSets vs DataStage (max 84 vs 86), normalized to a percentage — with a full, explainable rationale.
        </p>
        <p className="dd-mono" style={{ marginTop: 12 }}>inputs: PowerCenter XML · IICS .zip</p>
      </Section>
      <FactorGrid />
      <Outcomes />
      <MigrationStepper />
      <AiFallback />
      <OfflineSafe />
      <SharedDNA />
      <StatusAndCTA />
    </section>
  )
}
