import { useEffect, useState } from 'react'

const phoneQuery = '(max-width: 719px)'
const coarseQuery = '(pointer: coarse)'

export type BrandColors = {
  dotBase: string
  dotActive: string
  dotOpacity: number
  orb: [string, string, string]
  orbOpacity: number
  silk: string
  silkSheen: string
}

const lightColors: BrandColors = {
  dotBase: '#8ecfc8',
  dotActive: '#00695c',
  dotOpacity: 0.64,
  orb: ['#004d40', '#009688', '#80cbc4'],
  orbOpacity: 0.9,
  silk: '#6ec9c0',
  silkSheen: '#ffffff',
}

const darkColors: BrandColors = {
  dotBase: '#163a37',
  dotActive: '#62f6e6',
  dotOpacity: 0.9,
  orb: ['#00695c', '#4db6ac', '#62f6e6'],
  orbOpacity: 1,
  silk: '#146158',
  silkSheen: '#d5fff8',
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark-mode'),
  )

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.classList.contains('dark-mode'))
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return dark
}

export function useBrandBackdrop() {
  const dark = useDarkMode()
  const coarse = useMedia(coarseQuery)
  const phone = useMedia(phoneQuery)
  const dpr = phone ? 1 : Math.min(window.devicePixelRatio || 1, 1.35)

  return {
    dark,
    coarse,
    phone,
    dpr,
    colors: dark ? darkColors : lightColors,
  }
}
