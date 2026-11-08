import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { FloatingDumbbell } from '../../components/FloatingDumbbell/FloatingDumbbell'
import Orb from '../../components/backgrounds/Orb/Orb'
import Silk from '../../components/backgrounds/Silk/Silk'
import { useBrandBackdrop } from '../../components/backgrounds/useBrandBackdrop'
import { SUPPORT_EMAIL } from '../../config/contact'
import { homeNs } from './locals'
import './locals'

const wideQuery = '(min-width: 720px)'

const shots = [
  {
    src: '/screenshots/diary.png',
    caption: 'shotDiary',
    alt: 'altDiary',
  },
  {
    src: '/screenshots/food-categories.png',
    caption: 'shotCategories',
    alt: 'altCategories',
  },
  {
    src: '/screenshots/food-search.png',
    caption: 'shotFood',
    alt: 'altFood',
  },
  {
    src: '/screenshots/workouts.png',
    caption: 'shotWorkouts',
    alt: 'altWorkouts',
  },
  {
    src: '/screenshots/exercise.png',
    caption: 'shotExercise',
    alt: 'altExercise',
  },
] as const

const lines = [
  { title: 'logTitle', body: 'logBody', icon: SearchOutlinedIcon },
  { title: 'trainTitle', body: 'trainBody', icon: FitnessCenterOutlinedIcon },
  { title: 'progressTitle', body: 'progressBody', icon: ShowChartOutlinedIcon },
] as const

const pairs = [
  {
    food: {
      title: 'mealOneTitle',
      detail: 'mealOneDetail',
      body: 'mealOneBody',
    },
    train: {
      title: 'liftOneTitle',
      detail: 'liftOneDetail',
      body: 'liftOneBody',
    },
  },
  {
    food: {
      title: 'mealTwoTitle',
      detail: 'mealTwoDetail',
      body: 'mealTwoBody',
    },
    train: {
      title: 'liftTwoTitle',
      detail: 'liftTwoDetail',
      body: 'liftTwoBody',
    },
  },
] as const

function useWideScreen() {
  const [wide, setWide] = useState(() => window.matchMedia(wideQuery).matches)

  useEffect(() => {
    const media = window.matchMedia(wideQuery)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return wide
}

function useReveal<T extends HTMLElement>(flagRoot = false) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [
      ...(flagRoot ? [root] : []),
      ...root.querySelectorAll('.reveal'),
    ]
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduce) {
      items.forEach((item) => item.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.25 },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [flagRoot])

  return ref
}

function BridgeEntry({
  side,
  title,
  detail,
  body,
}: {
  side: string
  title: string
  detail: string
  body: string
}) {
  return (
    <article className='bridge-cell'>
      <p className='bridge-inline-side'>{side}</p>
      <h3>{title}</h3>
      <p className='bridge-detail'>
        {detail.includes('×') ? <bdi dir='ltr'>{detail}</bdi> : detail}
      </p>
      <p>{body}</p>
    </article>
  )
}

function Shot({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption: string
}) {
  return (
    <figure className='shot'>
      <img src={src} alt={alt} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

function ShotCarousel({
  dir,
  speed,
  prevLabel,
  nextLabel,
  children,
}: {
  dir: 'rtl' | 'ltr'
  speed: number
  prevLabel: string
  nextLabel: string
  children: ReactNode
}) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<SwiperInstance | null>(null)
  const PrevIcon = dir === 'rtl' ? ChevronRightIcon : ChevronLeftIcon

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper || !prevRef.current || !nextRef.current) return
    swiper.params.navigation = {
      enabled: true,
      prevEl: prevRef.current,
      nextEl: nextRef.current,
      addIcons: false,
      hideOnClick: false,
      disabledClass: 'swiper-button-disabled',
      hiddenClass: 'swiper-button-hidden',
      lockClass: 'swiper-button-lock',
      navigationDisabledClass: 'swiper-navigation-disabled',
    }
    swiper.navigation.destroy()
    swiper.navigation.init()
    swiper.navigation.update()
  }, [])
  const NextIcon = dir === 'rtl' ? ChevronLeftIcon : ChevronRightIcon

  return (
    <div className='shot-carousel'>
      <button
        ref={prevRef}
        type='button'
        className='shot-arrow'
        aria-label={prevLabel}
      >
        <PrevIcon />
      </button>
      <Swiper
        dir={dir}
        modules={[A11y, Navigation, Pagination]}
        slidesPerView='auto'
        spaceBetween={28}
        watchOverflow
        navigation={false}
        pagination={{ clickable: true }}
        speed={speed}
        a11y={{
          prevSlideMessage: prevLabel,
          nextSlideMessage: nextLabel,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
      >
        {children}
      </Swiper>
      <button
        ref={nextRef}
        type='button'
        className='shot-arrow'
        aria-label={nextLabel}
      >
        <NextIcon />
      </button>
    </div>
  )
}

export function Home() {
  const { t, i18n } = useTranslation(homeNs)
  const wide = useWideScreen()
  const { dark, coarse, phone, dpr, colors } = useBrandBackdrop()
  const bridgeRef = useReveal<HTMLElement>(true)
  const shotsRef = useReveal<HTMLElement>()
  const dayRef = useReveal<HTMLElement>()
  const dir = i18n.resolvedLanguage?.startsWith('he') ? 'rtl' : 'ltr'
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  return (
    <div className='home-container'>
      <section className='hero'>
        <div className='hero-copy'>
          <h1>{t('headline')}</h1>
          <p>{t('sentence')}</p>
        </div>
        <FloatingDumbbell />
        <div className='hero-shot-wrap'>
          <div className='hero-orb'>
            <Orb
              colors={colors.orb}
              backgroundColor={dark ? '#000000' : '#f4fbfa'}
              size={wide ? 0.74 : 0.68}
              glow={0.85}
              bleed={0.55}
              wobble={0.75}
              highlight={0.8}
              trail={0.65}
              speed={0.65}
              hoverIntensity={coarse ? 0 : 0.5}
              rotateOnHover={!coarse}
              followCursor={!coarse}
              clickPulse={!coarse}
              opacity={colors.orbOpacity}
              dpr={dpr}
            />
          </div>
          <img
            className='hero-shot'
            src='/screenshots/dashboard.png'
            alt={t('altDashboard')}
          />
        </div>
      </section>

      <section className='bridge' ref={bridgeRef}>
        <div className='bridge-silk' aria-hidden='true'>
          <Silk
            color={colors.silk}
            sheenColor={colors.silkSheen}
            lightMode={!dark}
            speed={phone ? 0.8 : 1.15}
            scale={1.55}
            rotation={0.04}
            sheen={dark ? 0.4 : 0.28}
            depth={dark ? 0.28 : 0.06}
            glow={coarse ? 0.06 : 0.22}
            ripple={0.9}
            wave={0.35}
            variation={0.4}
            noiseIntensity={0.22}
            fade={0.48}
            mouseInteraction={!coarse && !reduceMotion}
            interactionStrength={0.45}
            clickRipple={!coarse && !reduceMotion}
            intro={false}
            dpr={dpr}
          />
        </div>
        <div className='bridge-copy'>
          <h2>{t('bridgeTitle')}</h2>
          <p>{t('bridgeLead')}</p>
        </div>
        <div className='bridge-board'>
          <div className='bridge-cols'>
            <p className='bridge-col'>{t('foodSide')}</p>
            <p className='bridge-col'>{t('trainSide')}</p>
          </div>
          <div className='bridge-rows'>
            <span className='bridge-spine' aria-hidden='true' />
            {pairs.map((pair) => (
              <div className='bridge-row' key={pair.food.title}>
                <BridgeEntry
                  side={t('foodSide')}
                  title={t(pair.food.title)}
                  detail={t(pair.food.detail)}
                  body={t(pair.food.body)}
                />
                <BridgeEntry
                  side={t('trainSide')}
                  title={t(pair.train.title)}
                  detail={t(pair.train.detail)}
                  body={t(pair.train.body)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='shots' ref={shotsRef}>
        <div className='shots-silk' aria-hidden='true'>
          <Silk
            color={colors.silk}
            sheenColor={colors.silkSheen}
            lightMode={!dark}
            speed={coarse ? 1.6 : 2.4}
            scale={wide ? 1.05 : 1.35}
            rotation={0.28}
            sheen={dark ? 0.7 : 0.62}
            depth={dark ? 0.42 : 0.1}
            glow={coarse ? 0.08 : 0.28}
            ripple={0.55}
            wave={1}
            noiseIntensity={0.4}
            fade={0.22}
            mouseInteraction={false}
            clickRipple={false}
            dpr={dpr}
          />
        </div>
        <h2 className='band-title reveal'>{t('shotsLabel')}</h2>
        <div className='reveal'>
          {wide ? (
            <ShotCarousel
              key={dir}
              dir={dir}
              speed={reduceMotion ? 0 : 320}
              prevLabel={t('prevShot')}
              nextLabel={t('nextShot')}
            >
              {shots.map((shot) => (
                <SwiperSlide key={shot.src}>
                  <Shot
                    src={shot.src}
                    alt={t(shot.alt)}
                    caption={t(shot.caption)}
                  />
                </SwiperSlide>
              ))}
            </ShotCarousel>
          ) : (
            <div className='shot-row'>
              {shots.map((shot) => (
                <Shot
                  key={shot.src}
                  src={shot.src}
                  alt={t(shot.alt)}
                  caption={t(shot.caption)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className='lines' ref={dayRef}>
        <h2 className='path-title reveal'>{t('pathTitle')}</h2>
        {lines.map((line) => {
          const Icon = line.icon
          return (
            <article className='day-card reveal' key={line.title}>
              <span className='day-icon' aria-hidden='true'>
                <Icon />
              </span>
              <h2>{t(line.title)}</h2>
              <p>{t(line.body)}</p>
            </article>
          )
        })}
      </section>

      <p className='support'>
        {t('support')} <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </div>
  )
}
