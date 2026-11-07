import DotGrid from './DotGrid/DotGrid'
import { useBrandBackdrop } from './useBrandBackdrop'

export function SiteBackdrop() {
  const { coarse, dpr, colors } = useBrandBackdrop()

  return (
    <div className='site-backdrop' aria-hidden='true'>
      <DotGrid
        dotSize={coarse ? 2.1 : 2.5}
        gap={coarse ? 30 : 22}
        baseColor={colors.dotBase}
        activeColor={colors.dotActive}
        opacity={colors.dotOpacity}
        proximity={108}
        strength={0.65}
        bounce={0.45}
        tension={0.28}
        returnDuration={0.9}
        shockRadius={190}
        shockStrength={2.6}
        swell={0.35}
        stretch={0.22}
        glow={0.22}
        fade={0.05}
        mouseInteraction={!coarse}
        clickShock={!coarse}
        quietSelector='.floating-dumbbell-container, .hero-orb'
        clearSelector='.floating-dumbbell-container'
        dpr={dpr}
      />
    </div>
  )
}
