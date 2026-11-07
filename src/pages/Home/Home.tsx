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

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = [...root.querySelectorAll('.reveal')]
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
  }, [])

  return ref
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
        <img
          className='hero-shot'
          src='/screenshots/dashboard.png'
          alt={t('altDashboard')}
        />
      </section>

      <section className='shots' ref={shotsRef}>
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
