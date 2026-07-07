// Screen-fixed HTML text over the SVG world. Each .ov-sN block is shown/hidden
// by the master timeline; colours follow --stage-ink (dark→light aware).
import { isMobile } from '../lib/device'

const hidden = { opacity: 0 }

function Block({ cls, pos = 'center', children }) {
  if (isMobile) pos = 'center' // side captions cramp on a narrow screen
  const posStyle =
    pos === 'left'
      ? { left: 'clamp(20px,6vw,90px)', textAlign: 'left', maxWidth: 'min(440px,80vw)' }
      : pos === 'right'
        ? { right: 'clamp(20px,6vw,90px)', textAlign: 'right', maxWidth: 'min(440px,80vw)' }
        : { left: '50%', transform: 'translateX(-50%)', textAlign: 'center', maxWidth: 'min(560px,88vw)' }
  return (
    <div className={`ov ${cls}`} style={{ ...posStyle, ...(cls === 'ov-s0' ? {} : hidden) }}>
      {children}
    </div>
  )
}

const Eyebrow = ({ children }) => <div className="ov-eyebrow">{children}</div>

// split a headline into word spans that assemble on section entry (.is-live)
function splitWords(text) {
  return String(text)
    .split(' ')
    .map((w, i) => (
      <span className="word" key={i} style={{ '--i': i }}>
        <span className="inner">{w}&nbsp;</span>
      </span>
    ))
}
const H = ({ children }) => <h2 className="ov-h">{splitWords(children)}</h2>
const Body = ({ children }) => <p className="ov-body">{children}</p>
const Mono = ({ children, c }) => (
  <p className="ov-mono" style={c ? { color: c } : undefined}>
    {children}
  </p>
)

export default function StageOverlays() {
  return (
    <div className="overlays">
      {/* S0 landing */}
      <Block cls="ov-s0">
        <Eyebrow>IBM watsonx · Migration Suite</Eyebrow>
        <h1 className="ov-h1">
          Migrate from Informatica PowerCenter to <span className="grad-text">watsonx.data integration.</span>
        </h1>
        <Body>Intelligent migration accelerators that simplify assessment, planning, and migration to IBM watsonx.data integration.</Body>
        <div className="ov-cue cue-bob">
          <div className="ov-mono">SCROLL</div>
          <div style={{ fontSize: 18 }}>↓</div>
        </div>
      </Block>

      {/* S1 */}
      <Block cls="ov-s1" pos="left">
        <Eyebrow>Origin</Eyebrow>
        <H>Start with your existing PowerCenter assets.</H>
        <Body>Workflows, mappings, sessions — read in place, nothing to rebuild by hand.</Body>
        <Mono c="#ffae57">workflows · mappings · sessions</Mono>
      </Block>

      {/* S2 */}
      <Block cls="ov-s2" pos="left">
        <Eyebrow>Migration Decision Agent</Eyebrow>
        <H>Which platform — and why?</H>
        <Body>Scores every asset across seven dimensions to recommend the optimal path — explainably.</Body>
        <Mono c="#a56eff">→ StreamSets · Confidence 94%</Mono>
      </Block>

      {/* S3 */}
      <Block cls="ov-s3">
        <Eyebrow>Intelligent routing</Eyebrow>
        <H>Intelligent platform recommendation.</H>
        <Mono c="#3a8bff">StreamSets — recommended. → StreamSets</Mono>
      </Block>

      {/* S4 */}
      <Block cls="ov-s4" pos="right">
        <Eyebrow>StreamSets Migration Agent</Eyebrow>
        <H>Parse. Translate. Generate runnable code.</H>
        <Body>Parses the XML, plans the migration, generates the flow, packages and deploys — automatically.</Body>
        <Mono c="#3a8bff">parse → plan → generate → package → deploy</Mono>
      </Block>

      {/* S5 */}
      <Block cls="ov-s5">
        <Eyebrow>Deployment</Eyebrow>
        <H>Ready for deployment.</H>
        <Body>The migrated pipeline lands in IBM watsonx.data integration, running.</Body>
        <Mono c="#1faa6b">deployed · live flow</Mono>
      </Block>

      {/* S6 metric cards */}
      <div className="ov ov-s6" style={hidden}>
        <div className="metric-grid">
          {METRICS.map((m) => (
            <div key={m.label} className="card card-spine metric-card" style={{ '--spine': m.c }}>
              <div className="metric-label">{m.label}</div>
              <div className="metric-vals">
                <span className="metric-before">{m.before}</span>
                <span className="metric-arrow">→</span>
                <span className="metric-after" style={{ color: m.c }}>{m.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* S7 closing */}
      <div className="ov ov-s7" style={hidden}>
        <div className="recap">
          {[
            ['Analyze.', 'Understand your PowerCenter environment.'],
            ['Decide.', 'Use the Migration Decision Agent to identify the optimal migration path.'],
            ['Migrate.', 'Accelerate migration with the StreamSets Migration Agent.'],
          ].map(([k, v]) => (
            <div key={k} className="recap-row">
              <span className="grad-text recap-key">{k}</span>
              <span className="recap-val">{v}</span>
            </div>
          ))}
          <div className="recap-lockup" style={{ pointerEvents: 'auto' }}>
            <div className="ov-h" style={{ fontSize: 'clamp(19px,4.6vw,26px)' }}>IBM watsonx.data integration</div>
            <div className="qr-box" style={{ margin: '20px auto 0' }}>
              <img src={`${import.meta.env.BASE_URL}qr.png`} alt="Scan to open" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <button
              className="ov-mono"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', marginTop: 14, pointerEvents: 'auto' }}
            >
              ↑ BACK TO THE SOURCE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const METRICS = [
  { label: 'Migration Assessment', before: 'Weeks', after: 'Minutes', c: '#1faa6b' },
  { label: 'Migration Effort', before: 'High', after: 'Significantly Reduced', c: '#8a3ffc' },
  { label: 'Migration Planning', before: 'Manual', after: 'Automated', c: '#0f62fe' },
  { label: 'Deployment', before: 'Legacy Platform', after: 'watsonx.data integration', c: '#1faa6b' },
]
