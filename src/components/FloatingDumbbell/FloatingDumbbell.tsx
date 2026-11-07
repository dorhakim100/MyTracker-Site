import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const DumbbellScene = lazy(() =>
  import('./DumbbellScene').then((mod) => ({ default: mod.DumbbellScene })),
)

const reduceQuery = '(prefers-reduced-motion: reduce)'
const phoneQuery = '(max-width: 719px)'

export function FloatingDumbbell() {
  const rootRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-mode'),
  )
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia(reduceQuery).matches,
  )
  const [onScreen, setOnScreen] = useState(true)
  const [dpr, setDpr] = useState(() =>
    window.matchMedia(phoneQuery).matches
      ? 1
      : Math.min(window.devicePixelRatio || 1, 1.5),
  )

  useEffect(() => {
    const motion = window.matchMedia(reduceQuery)
    const phone = window.matchMedia(phoneQuery)
    const syncMotion = () => setReduceMotion(motion.matches)
    const syncDpr = () =>
      setDpr(phone.matches ? 1 : Math.min(window.devicePixelRatio || 1, 1.5))
    syncMotion()
    syncDpr()
    motion.addEventListener('change', syncMotion)
    phone.addEventListener('change', syncDpr)
    return () => {
      motion.removeEventListener('change', syncMotion)
      phone.removeEventListener('change', syncDpr)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.classList.contains('dark-mode'))
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0) return
      const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width
      const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height
      pointer.current.x = Math.max(-1, Math.min(1, x))
      pointer.current.y = Math.max(-1, Math.min(1, y))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15 },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className='floating-dumbbell-container'
      ref={rootRef}
      aria-hidden='true'
    >
      <Suspense fallback={null}>
        <DumbbellScene
          animate={onScreen && !reduceMotion}
          dark={dark}
          dpr={dpr}
          pointer={pointer}
        />
      </Suspense>
    </div>
  )
}
