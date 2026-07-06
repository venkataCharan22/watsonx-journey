import { useEffect, useRef } from 'react'
import { useStore, actIndexFor, scrollFractionForBeat } from '../store'
import { ACCENT } from '../lib/gradient'

const COLORS = [ACCENT.amber, ACCENT.amber, ACCENT.violet, ACCENT.blue, ACCENT.green]
const LABELS = ['Start', 'Problem', 'Decide', 'Migrate', 'Modern']

// progress breakpoints -> evenly spaced rail positions (so nodes sit evenly and
// the comet still lands on each as its beat goes active)
const PTS = [0, 0.08, 0.28, 0.5, 0.74, 1.0]
const RAIL = [0, 0.25, 0.5, 0.75, 1.0, 1.0]

function railFraction(p) {
  for (let i = 0; i < PTS.length - 1; i++) {
    if (p <= PTS[i + 1]) {
      const f = (p - PTS[i]) / (PTS[i + 1] - PTS[i] || 1)
      return RAIL[i] + (RAIL[i + 1] - RAIL[i]) * f
    }
  }
  return 1
}

export default function ConstellationRail() {
  // active-beat index re-renders (5 discrete values); the comet's per-frame
  // glide writes styles directly via a transient subscription.
  const idx = useStore((s) => actIndexFor(s.progress))
  const cometRef = useRef(null)

  useEffect(() => {
    const paint = (p) => {
      const el = cometRef.current
      if (!el) return
      const c = COLORS[actIndexFor(p)]
      el.style.top = `${railFraction(p) * 100}%`
      el.style.background = c
      el.style.boxShadow = `0 0 8px ${c}, 0 0 2px #fff`
    }
    paint(useStore.getState().progress)
    return useStore.subscribe((s, prev) => {
      if (s.progress !== prev.progress) paint(s.progress)
    })
  }, [])

  const go = (i) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: scrollFractionForBeat(i) * max, behavior: 'smooth' })
  }

  return (
    <div
      className="rail-desktop"
      style={{ position: 'fixed', right: 24, top: '20vh', bottom: '20vh', width: 14, zIndex: 60, pointerEvents: 'none' }}
    >
      <div className="rail-track" />
      {/* comet */}
      <div
        ref={cometRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: 5,
          height: 5,
          borderRadius: '50%',
          transform: 'translate(-50%,-50%)',
          transition: 'background 0.4s ease',
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <button
          key={i}
          className={`star-node ${idx === i ? 'lit' : ''}`}
          style={{ position: 'absolute', left: '50%', top: `${(i / 4) * 100}%`, transform: 'translate(-50%,-50%)', color: COLORS[i] }}
          onClick={() => go(i)}
          aria-label={LABELS[i]}
          title={LABELS[i]}
        />
      ))}
    </div>
  )
}
