// The SVG "world": master path + 8 section environments + the XML-doc traveler.
// All authored in a 100-wide × ~1250-tall viewBox space. x stays in 26–74 so the
// path reads on a cropped phone. Section elements light via `-lit` overlays whose
// opacity the master timeline scrubs (no attribute tweening).

const D =
  'M50 44 C50 90 40 120 46 175 C58 220 30 250 34 300 C38 340 50 360 50 400 C50 450 50 490 50 545 C50 590 44 620 44 655 C44 700 66 720 68 760 C70 800 40 835 44 875 C48 915 58 945 48 985 C42 1020 50 1055 50 1095 C50 1120 50 1150 50 1175'

const LIGHT = '#cdd8ef' // strokes on the dark bands
const LIGHT_DIM = 'rgba(205,216,239,0.35)'

export default function StageScene({ travelerRef }) {
  return (
    <g id="world">
      <defs>
        <linearGradient id="pathGrad" gradientUnits="userSpaceOnUse" x1="50" y1="0" x2="50" y2="1250">
          <stop offset="0" stopColor="#ff832b" />
          <stop offset="0.16" stopColor="#ffae57" />
          <stop offset="0.34" stopColor="#8a3ffc" />
          <stop offset="0.46" stopColor="#a56eff" />
          <stop offset="0.58" stopColor="#0f62fe" />
          <stop offset="0.7" stopColor="#3a8bff" />
          <stop offset="0.86" stopColor="#1faa6b" />
          <stop offset="1" stopColor="#42be65" />
        </linearGradient>
        <radialGradient id="travHalo">
          <stop offset="0" stopColor="#8ab4ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8ab4ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloudHalo">
          <stop offset="0" stopColor="#0f62fe" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0f62fe" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- S0 landing: server racks + data dots ---------- */}
      <g className="s0-env">
        {[12, 30, 50, 70, 88].map((x, i) => (
          <g key={i} opacity="0.16" transform={`translate(${x} ${-10 + (i % 2) * 8})`}>
            <rect x="-7" y="0" width="14" height="94" rx="2.5" fill="none" stroke={LIGHT} strokeWidth="0.5" />
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <g key={r}>
                <rect x="-5.5" y={4 + r * 12.5} width="11" height="8" rx="1" fill="none" stroke={LIGHT} strokeWidth="0.4" />
                <circle cx="-3.5" cy={8 + r * 12.5} r="0.8" fill={r % 2 ? '#3a8bff' : '#ff832b'} />
                <circle cx="-1" cy={8 + r * 12.5} r="0.8" fill="#2a3d63" />
              </g>
            ))}
          </g>
        ))}
        {[[22, 40], [78, 66], [30, 120], [70, 150]].map(([x, y], i) => (
          <line key={i} x1={x} y1={y} x2={x + 16} y2={y} stroke={LIGHT_DIM} strokeWidth="0.4" strokeDasharray="2 3" />
        ))}
      </g>

      {/* ---------- S1 powercenter: capsule + node network ---------- */}
      <g className="s1-env" opacity="0">
        <rect x="14" y="212" width="72" height="150" rx="7" fill="rgba(255,131,43,0.03)" stroke="rgba(255,174,87,0.35)" strokeWidth="0.6" />
        <text x="18" y="207" className="svg-chip" fill="#ffae57">PowerCenter</text>
        {S1_NODES.map((n, i) => (
          <g key={i}>
            {i > 0 && (
              <line x1={S1_NODES[i - 1][0]} y1={S1_NODES[i - 1][1]} x2={n[0]} y2={n[1]} stroke={LIGHT_DIM} strokeWidth="0.4" strokeDasharray="1.5 2" />
            )}
            <rect x={n[0] - 5} y={n[1] - 4} width="10" height="8" rx="1.4" fill="none" stroke={LIGHT} strokeWidth="0.5" opacity="0.5" />
            <g className="s1-node-lit" opacity="0">
              <rect x={n[0] - 5} y={n[1] - 4} width="10" height="8" rx="1.4" fill="rgba(255,174,87,0.14)" stroke="#ffae57" strokeWidth="0.7" />
              <circle cx={n[0]} cy={n[1]} r="1.4" fill="#ff832b" />
            </g>
            <text x={n[0]} y={n[1] + 8} className="svg-mini" fill={LIGHT} textAnchor="middle">{n[2]}</text>
          </g>
        ))}
      </g>

      {/* ---------- S2 decision engine: rings + 7 labels ---------- */}
      <g className="s2-env" opacity="0" transform="translate(50 500) scale(0.58) translate(-50 -500)">
        <circle cx="50" cy="500" r="34" fill="url(#cloudHalo)" opacity="0.5" />
        <g className="ring-outer">
          <circle cx="50" cy="500" r="30" fill="none" stroke="#8a3ffc" strokeWidth="0.6" strokeDasharray="1.5 2.5" opacity="0.8" />
        </g>
        <g className="ring-mid">
          <circle cx="50" cy="500" r="22" fill="none" stroke="#a56eff" strokeWidth="0.5" opacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            return <line key={i} x1={50 + Math.cos(a) * 20} y1={500 + Math.sin(a) * 20} x2={50 + Math.cos(a) * 22} y2={500 + Math.sin(a) * 22} stroke="#a56eff" strokeWidth="0.5" />
          })}
        </g>
        <g className="ring-inner">
          <circle cx="50" cy="500" r="13" fill="none" stroke="#8a3ffc" strokeWidth="0.7" opacity="0.7" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2
            return <line key={i} x1="50" y1="500" x2={50 + Math.cos(a) * 13} y2={500 + Math.sin(a) * 13} stroke="#8a3ffc" strokeWidth="0.4" opacity="0.5" />
          })}
        </g>
        {/* 7 category labels around the ring */}
        {S2_LABELS.map((lab, i) => {
          const a = (-90 + (i / 7) * 360) * (Math.PI / 180)
          const lx = 50 + Math.cos(a) * 40
          const ly = 500 + Math.sin(a) * 40
          const anchor = lx > 55 ? 'start' : lx < 45 ? 'end' : 'middle'
          return (
            <g key={i} className="s2-label" opacity="0.18">
              <line x1={50 + Math.cos(a) * 30} y1={500 + Math.sin(a) * 30} x2={50 + Math.cos(a) * 37} y2={500 + Math.sin(a) * 37} stroke="#8a3ffc" strokeWidth="0.5" />
              <circle cx={50 + Math.cos(a) * 30} cy={500 + Math.sin(a) * 30} r="1" fill="#8a3ffc" />
              <text x={lx} y={ly} className="svg-mini" fill="#cbb6ff" textAnchor={anchor} dominantBaseline="middle">{lab}</text>
            </g>
          )
        })}
      </g>

      {/* ---------- S3 fork ---------- */}
      <g className="s3-env" opacity="0">
        <path className="fork-datastage" d="M44 655 C44 700 26 720 22 780" fill="none" stroke="#8a3ffc" strokeWidth="1.2" opacity="0.6" />
        <path className="fork-ss-glow" d="M44 655 C44 700 66 720 68 760 C70 800 68 810 68 815" fill="none" stroke="#3a8bff" strokeWidth="3" opacity="0" strokeLinecap="round" />
        {/* DataStage capsule (dimmed) */}
        <g transform="translate(20 795)" opacity="0.7">
          <rect x="-13" y="-7" width="26" height="14" rx="3" fill="none" stroke="#8a3ffc" strokeWidth="0.6" />
          <text x="0" y="1" className="svg-mini" fill="#cbb6ff" textAnchor="middle">IBM DataStage</text>
        </g>
        {/* StreamSets capsule (chosen) */}
        <g transform="translate(70 792)">
          <rect x="-13" y="-8" width="26" height="16" rx="3" fill="rgba(58,139,255,0.1)" stroke="#3a8bff" strokeWidth="0.9" />
          <text x="0" y="0.5" className="svg-mini" fill="#9fc6ff" textAnchor="middle">StreamSets</text>
          <g className="fork-check" opacity="0" transform="translate(0 -12)">
            <circle r="2.6" fill="#1faa6b" />
            <path d="M-1.2 0 L-0.2 1 L1.3 -1" fill="none" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* ---------- S4 production line: 5 stations ---------- */}
      <g className="s4-env" opacity="0">
        {S4_STATIONS.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <line x1="-11" y1="-13" x2="-11" y2="6" stroke={LIGHT} strokeWidth="0.4" opacity="0.4" />
            <line x1="11" y1="-13" x2="11" y2="6" stroke={LIGHT} strokeWidth="0.4" opacity="0.4" />
            <rect x="-12" y="-19" width="24" height="6" rx="1.4" fill="rgba(58,139,255,0.08)" stroke="#3a8bff" strokeWidth="0.5" opacity="0.55" />
            <text x="0" y="-14.7" className="svg-mini" fill="#9fc6ff" textAnchor="middle">{s.label}</text>
            <g className="s4-station-lit" opacity="0">
              <rect x="-12" y="-19" width="24" height="6" rx="1.4" fill="rgba(31,170,107,0.16)" stroke="#42be65" strokeWidth="0.7" />
              <circle cx="9.5" cy="-16" r="1" fill="#42be65" />
            </g>
          </g>
        ))}
      </g>

      {/* ---------- S5 cloud ---------- */}
      <g className="s5-env" opacity="0">
        <circle className="cloud-glow" cx="50" cy="1175" r="40" fill="url(#cloudHalo)" opacity="0" />
        <circle className="cloud-ring" cx="50" cy="1175" r="26" fill="none" stroke="#0f62fe" strokeWidth="0.6" opacity="0" />
        <circle className="cloud-ring" cx="50" cy="1175" r="26" fill="none" stroke="#3a8bff" strokeWidth="0.5" opacity="0" />
        <circle className="cloud-ring" cx="50" cy="1175" r="26" fill="none" stroke="#1faa6b" strokeWidth="0.5" opacity="0" />
        <path
          d="M28 1182 a11 11 0 0 1 3 -21 a14 14 0 0 1 26 -3 a10 10 0 0 1 15 9 a8 8 0 0 1 -2 16 z"
          fill="#ffffff"
          stroke="#0f62fe"
          strokeWidth="0.8"
        />
        <text x="50" y="1200" className="svg-mini" fill="#0f62fe" textAnchor="middle" fontWeight="600">IBM watsonx.data integration</text>
      </g>

      {/* ---------- master path (measure + base + lit) ---------- */}
      <path id="masterPath" d={D} fill="none" stroke="none" />
      <path className="path-base" d={D} fill="none" stroke="#5a77a0" strokeWidth="1.4" strokeLinecap="round" opacity="0.28" />
      <path id="litPath" d={D} fill="none" stroke="url(#pathGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* energized conduit: current shimmer + comet tail behind the doc */}
      <g className="conduit">
        <path id="pathFlow" d={D} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" />
        <path id="travComet" d={D} fill="none" stroke="url(#pathGrad)" strokeWidth="3.8" strokeLinecap="round" />
      </g>

      {/* wake ring at the origin */}
      <circle className="wake-ring" cx="50" cy="44" r="5" fill="none" stroke="#3a8bff" strokeWidth="0.6" opacity="0" />

      {/* ---------- the traveler: XML document ---------- */}
      <g ref={travelerRef} className="traveler">
        <circle r="9" fill="url(#travHalo)" className="trav-halo" />
        <Doc className="morph-a" />
        <MorphB />
        <MorphC />
        <MorphD />
        <MorphE />
        {/* confidence badge (shows at end of S2) */}
        <g className="s2-badge" opacity="0" transform="translate(9 -6)">
          <rect x="-1" y="-3" width="20" height="6" rx="3" fill="#0b1220" opacity="0.9" />
          <circle cx="2" cy="0" r="1.5" fill="#1faa6b" />
          <path d="M1.2 0 L1.9 0.7 L2.9 -0.6" fill="none" stroke="#fff" strokeWidth="0.4" strokeLinecap="round" />
          <text x="5" y="1" className="svg-mini" fill="#eaf1ff">CONFIDENCE 94%</text>
        </g>
      </g>
    </g>
  )
}

function Doc({ className }) {
  return (
    <g className={className}>
      <rect x="-4.5" y="-5.5" width="9" height="11" rx="1.4" fill="#ffffff" stroke="#0f62fe" strokeWidth="0.55" />
      <path d="M2 -5.5 L4.5 -5.5 L4.5 -3 Z" fill="#cfe0ff" />
      <text x="-1.9" y="-2.6" className="svg-tiny" fill="#0f62fe" fontWeight="600">{'</>'}</text>
      <line x1="-2.6" y1="-0.4" x2="2.4" y2="-0.4" stroke="#9fb3d4" strokeWidth="0.45" />
      {/* face — expression is driven by the scrubbed timeline */}
      <g className="doc-face">
        <line className="doc-brow-l" x1="-2.2" y1="1.1" x2="-0.7" y2="1.1" stroke="#0b1220" strokeWidth="0.4" strokeLinecap="round" />
        <line className="doc-brow-r" x1="0.7" y1="1.1" x2="2.2" y2="1.1" stroke="#0b1220" strokeWidth="0.4" strokeLinecap="round" />
        <circle cx="-1.4" cy="2.2" r="0.5" fill="#0b1220" />
        <circle cx="1.4" cy="2.2" r="0.5" fill="#0b1220" />
        <path className="doc-mouth" d="M-1.4 3.9 Q0 3.9 1.4 3.9" fill="none" stroke="#0b1220" strokeWidth="0.4" strokeLinecap="round" />
      </g>
    </g>
  )
}

function MorphB() {
  return (
    <g className="morph-b" opacity="0">
      <rect x="-4.5" y="-5.5" width="9" height="11" rx="1.4" fill="#ffffff" stroke="#0f62fe" strokeWidth="0.5" opacity="0.85" />
      {[-3, -1, 1, 3].map((y, i) => (
        <g key={i}>
          <rect x="-3.4" y={y - 0.6} width="1.2" height="1.2" rx="0.3" fill="none" stroke="#1faa6b" strokeWidth="0.4" />
          <line x1="-1.6" y1={y} x2="3" y2={y} stroke="#9fb3d4" strokeWidth="0.4" />
        </g>
      ))}
    </g>
  )
}
function MorphC() {
  const blocks = [
    [-3, -3, '#ff832b'],
    [3, -1, '#8a3ffc'],
    [-2.5, 3, '#0f62fe'],
    [3, 4, '#1faa6b'],
  ]
  return (
    <g className="morph-c" opacity="0">
      {blocks.map(([x, y, c], i) => (
        <rect key={i} x={x - 1.8} y={y - 1.8} width="3.6" height="3.6" rx="0.8" fill="none" stroke={c} strokeWidth="0.6" />
      ))}
      <line x1="-1.2" y1="-3" x2="1.2" y2="-1" stroke="#7f8db0" strokeWidth="0.4" />
      <line x1="1.5" y1="0.6" x2="-0.8" y2="2.4" stroke="#7f8db0" strokeWidth="0.4" />
      <line x1="0.4" y1="3" x2="1.4" y2="3.4" stroke="#7f8db0" strokeWidth="0.4" />
    </g>
  )
}
function MorphD() {
  return (
    <g className="morph-d" opacity="0">
      <rect x="-5" y="-3" width="10" height="6" rx="3" fill="rgba(15,98,254,0.08)" stroke="#0f62fe" strokeWidth="0.6" />
      {[-2, 0, 2].map((x, i) => (
        <path key={i} d={`M${x - 0.8} -1.2 L${x + 0.6} 0 L${x - 0.8} 1.2`} fill="none" stroke="#3a8bff" strokeWidth="0.6" strokeLinecap="round" />
      ))}
    </g>
  )
}
function MorphE() {
  return (
    <g className="morph-e" opacity="0">
      <circle r="7" fill="none" stroke="#1faa6b" strokeWidth="0.4" opacity="0.5" />
      <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.2" fill="rgba(31,170,107,0.1)" stroke="#1faa6b" strokeWidth="0.7" />
      <path d="M-4.5 -1.5 L0 -4.5 L4.5 -1.5" fill="none" stroke="#1faa6b" strokeWidth="0.5" />
      {[-2, 0, 2].map((x, i) => (
        <path key={i} d={`M${x - 0.7} -0.5 L${x + 0.5} 0.6 L${x - 0.7} 1.7`} fill="none" stroke="#42be65" strokeWidth="0.5" strokeLinecap="round" />
      ))}
    </g>
  )
}

const S1_NODES = [
  [33, 235, 'Workflow'],
  [28, 268, 'Mapping'],
  [34, 300, 'Session'],
  [42, 332, 'Source'],
]
const S2_LABELS = [
  'Transformation',
  'Source & target',
  'Processing',
  'Feasibility',
  'Connectivity',
  'Data handling',
  'Scale & orch.',
]
const S4_STATIONS = [
  { x: 62, y: 800, label: 'Parse XML' },
  { x: 42, y: 858, label: 'Plan' },
  { x: 52, y: 918, label: 'Generate' },
  { x: 50, y: 990, label: 'Package' },
  { x: 50, y: 1058, label: 'Deploy' },
]
