import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isMobile, isCoarse, reducedMotion } from '../lib/device'
import { buildLUT, sampleLUT, pathEase, clamp01 } from '../lib/pathmap'
import { bgColorAt, bgCenterAt, inkAt } from '../lib/bgcolor'
import StageScene from './StageScene'
import StageOverlays from './StageOverlays'

gsap.registerPlugin(ScrollTrigger)

// Total path height in viewBox units (path runs y≈44 → cloud ≈1180).
const PATH_H = 1250
export const SCREENS = isMobile ? 9 : 11

function lerp(a, b, t) {
  return a + (b - a) * t
}
function smooth(t) {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

export default function ScrollStage() {
  const stageRef = useRef(null)
  const spacerRef = useRef(null)
  const cameraRef = useRef(null)
  const travelerRef = useRef(null)
  const bgRef = useRef(null)

  useLayoutEffect(() => {
    let sample
    const ctx = gsap.context(() => {
      const stage = stageRef.current
      const q = gsap.utils.selector(stage)
      const path = stage.querySelector('#masterPath')
      const litPath = stage.querySelector('#litPath')
      const traveler = travelerRef.current
      const camera = cameraRef.current

      const lut = buildLUT(path)
      const L = lut.L
      const pt = (f) => (isMobile ? sampleLUT(lut, f) : path.getPointAtLength(clamp01(f) * L))
      const ANCHOR = isMobile ? 38 : 50 // vertical screen anchor for the traveler

      // draw-on reveal setup
      if (litPath) {
        litPath.style.strokeDasharray = L
        litPath.style.strokeDashoffset = L
      }

      // ---- master timeline: every scrubbed section animation lives here ----
      const mtl = gsap.timeline({ paused: true })
      const To = (sel, vars, a, b) => {
        const els = q(sel)
        if (els.length) mtl.to(els, { ...vars, duration: Math.max(0.001, b - a), ease: 'none' }, a)
      }
      // explicit initial states (avoids fromTo immediateRender fighting)
      gsap.set(q('.ov-s1,.ov-s3,.ov-s5'), { opacity: 0, y: 18 })
      gsap.set(q('.ov-s2'), { opacity: 0, x: -20 })
      gsap.set(q('.ov-s4'), { opacity: 0, x: 20 })
      gsap.set(q('.ov-s6,.ov-s7'), { opacity: 0, y: 20 })
      gsap.set(q('.s1-env,.s2-env,.s3-env,.s4-env,.s5-env'), { opacity: 0 })
      gsap.set(q('.s1-node-lit,.s4-station-lit,.morph-b,.morph-c,.morph-d,.morph-e,.s2-badge,.fork-check,.fork-ss-glow,.cloud-glow,.cloud-ring'), { opacity: 0 })
      gsap.set(q('.morph-a'), { opacity: 1 })
      gsap.set(q('.s2-label'), { opacity: 0.18 })
      gsap.set(q('.fork-datastage'), { opacity: 0.6 })

      // S0 landing — headline clears
      To('.ov-s0', { opacity: 0, y: -30 }, 0.03, 0.09)
      To('.s0-env', { opacity: 0 }, 0.03, 0.1)

      // S1 powercenter
      To('.s1-env', { opacity: 1 }, 0.07, 0.11)
      q('.s1-node-lit').forEach((n, i) => mtl.to(n, { opacity: 1, duration: 0.02, ease: 'none' }, 0.1 + i * 0.025))
      To('.ov-s1', { opacity: 1, y: 0 }, 0.1, 0.14)
      To('.ov-s1', { opacity: 0 }, 0.2, 0.225)
      To('.s1-env', { opacity: 0 }, 0.21, 0.25)

      // S2 decision
      To('.s2-env', { opacity: 1 }, 0.2, 0.24)
      q('.s2-label').forEach((n, i) => mtl.to(n, { opacity: 1, duration: 0.015, ease: 'none' }, 0.24 + i * 0.019))
      To('.s2-badge', { opacity: 1 }, 0.36, 0.385)
      To('.ov-s2', { opacity: 1, x: 0 }, 0.24, 0.28)
      To('.ov-s2', { opacity: 0 }, 0.37, 0.4)
      To('.s2-env', { opacity: 0 }, 0.38, 0.42)
      To('.s2-badge', { opacity: 0 }, 0.4, 0.43)

      // S3 fork
      To('.s3-env', { opacity: 1 }, 0.39, 0.43)
      To('.fork-datastage', { opacity: 0.14 }, 0.4, 0.49)
      To('.fork-ss-glow', { opacity: 1 }, 0.42, 0.49)
      To('.fork-check', { opacity: 1 }, 0.47, 0.5)
      To('.ov-s3', { opacity: 1, y: 0 }, 0.41, 0.45)
      To('.ov-s3', { opacity: 0 }, 0.49, 0.51)
      To('.s3-env', { opacity: 0 }, 0.5, 0.53)

      // S4 streamsets — production line + 5 doc morph states
      To('.s4-env', { opacity: 1 }, 0.49, 0.53)
      const states = ['.morph-a', '.morph-b', '.morph-c', '.morph-d', '.morph-e']
      const s4a = 0.54
      const s4b = 0.7
      const step = (s4b - s4a) / 4
      for (let i = 1; i < 5; i++) {
        const at = s4a + (i - 0.5) * step
        mtl.to(q(states[i - 1]), { opacity: 0, duration: step * 0.6, ease: 'none' }, at)
        mtl.to(q(states[i]), { opacity: 1, duration: step * 0.6, ease: 'none' }, at)
      }
      q('.s4-station-lit').forEach((n, i) => mtl.to(n, { opacity: 1, duration: 0.02, ease: 'none' }, 0.54 + i * step))
      To('.ov-s4', { opacity: 1, x: 0 }, 0.52, 0.56)
      To('.ov-s4', { opacity: 0 }, 0.7, 0.73)
      To('.s4-env', { opacity: 0 }, 0.71, 0.74)

      // S5 deploy — cloud illuminate
      To('.s5-env', { opacity: 1 }, 0.71, 0.76)
      To('.cloud-glow', { opacity: 1 }, 0.8, 0.86)
      mtl.fromTo(q('.cloud-ring'), { opacity: 0.8, scale: 0.2, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.5, duration: 0.05, ease: 'none' }, 0.82)
      To('.ov-s5', { opacity: 1, y: 0 }, 0.74, 0.78)
      To('.ov-s5', { opacity: 0 }, 0.86, 0.9)

      // S6 value cards
      To('.ov-s6', { opacity: 1, y: 0 }, 0.87, 0.91)
      To('.ov-s6', { opacity: 0 }, 0.95, 0.965)

      // S7 recap
      To('.ov-s7', { opacity: 1, y: 0 }, 0.955, 0.99)

      // reveal the lit path progressively
      const drawObj = { v: 0 }
      mtl.to(drawObj, { v: 1, duration: 1, ease: 'none', onUpdate: () => { if (litPath) litPath.style.strokeDashoffset = L * (1 - drawObj.v) } }, 0)

      // ---- per-frame: camera follow + traveler ride + rings + bg ----
      const ringOuter = stage.querySelector('.ring-outer')
      const ringMid = stage.querySelector('.ring-mid')
      const ringInner = stage.querySelector('.ring-inner')
      let ang = 0
      let av = 0

      const gpRef = { v: 0 }
      const velRef = { v: 0 }

      sample = () => {
        const gp = gpRef.v
        // traveler position
        const f = pathEase(gp)
        const p = pt(f)
        let rot = 0
        if (!isCoarse) {
          const p2 = pt(Math.min(1, f + 0.004))
          rot = Math.max(-16, Math.min(16, (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI))
        }
        gsap.set(traveler, { x: p.x, y: p.y, rotation: rot, xPercent: 0, yPercent: 0, transformOrigin: '50% 50%' })

        // camera: follow the traveler (kept in the upper third on phones so the
        // bottom-anchored text stays clear), then pull back for recap (S7)
        let tx = 0, ty = ANCHOR - p.y, sc = 1
        if (gp > 0.94) {
          const rp = smooth((gp - 0.94) / 0.06)
          const s = 100 / PATH_H
          tx = lerp(0, 50 - 50 * s, rp)
          ty = lerp(ANCHOR - p.y, 2, rp)
          sc = lerp(1, s, rp)
        }
        camera.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(4)})`)

        // rings (S2) — velocity coupled on desktop, gentle constant on mobile
        if (ringOuter) {
          if (isMobile || reducedMotion) {
            ang += 0.15
          } else {
            const target = clamp01((gp - 0.2) / 0.05) * (1 - clamp01((gp - 0.38) / 0.04))
            av = lerp(av, Math.max(-9, Math.min(9, velRef.v * 0.01)) * target, 0.08)
            av += target * 0.25 // idle spin while in the hub
            ang += av
          }
          ringOuter.setAttribute('transform', `rotate(${ang} 50 500)`)
          if (ringMid) ringMid.setAttribute('transform', `rotate(${-ang * 0.6} 50 500)`)
          if (ringInner) ringInner.setAttribute('transform', `rotate(${ang * 1.4} 50 500)`)
        }
      }
      gsap.ticker.add(sample)

      // ---- background dark→light ----
      const root = document.documentElement
      const setBg = (gp) => {
        root.style.setProperty('--stage-bg', bgColorAt(gp))
        root.style.setProperty('--stage-center', bgCenterAt(gp))
        root.style.setProperty('--stage-ink', inkAt(gp))
        const light = gp >= 0.74
        if (document.body.classList.contains('is-light') !== light) {
          document.body.classList.toggle('is-light', light)
        }
      }
      setBg(0)

      // ---- one ScrollTrigger drives everything ----
      ScrollTrigger.config({ ignoreMobileResize: true })
      ScrollTrigger.create({
        trigger: spacerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reducedMotion ? true : isCoarse ? 0.6 : 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gpRef.v = self.progress
          velRef.v = self.getVelocity()
          mtl.progress(self.progress)
          setBg(self.progress)
        },
      })

      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
    }, stageRef)

    return () => {
      if (sample) gsap.ticker.remove(sample)
      document.body.classList.remove('is-light')
      ctx.revert()
    }
  }, [])

  return (
    <>
      <div ref={stageRef} className="stage">
        <div ref={bgRef} className="stage-bg" />
        <svg className="stage-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <g ref={cameraRef} id="camera">
            <StageScene travelerRef={travelerRef} />
          </g>
        </svg>
        <StageOverlays />
      </div>
      <div ref={spacerRef} aria-hidden className="scroll-spacer" style={{ height: `${SCREENS * 100}svh` }} />
    </>
  )
}
