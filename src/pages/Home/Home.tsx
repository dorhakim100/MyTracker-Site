import { useTranslation } from 'react-i18next'
import { SUPPORT_EMAIL } from '../../config/contact'
import { homeNs } from './locals'
import './locals'

const shots = [
  {
    src: '/screenshots/diary.png',
    caption: 'shotDiary',
    alt: 'altDiary',
  },
  {
    src: '/screenshots/workouts.png',
    caption: 'shotWorkouts',
    alt: 'altWorkouts',
  },
  {
    src: '/screenshots/food-search.png',
    caption: 'shotFood',
    alt: 'altFood',
  },
] as const

const lines = [
  { title: 'logTitle', body: 'logBody' },
  { title: 'trainTitle', body: 'trainBody' },
  { title: 'progressTitle', body: 'progressBody' },
] as const

export function Home() {
  const { t } = useTranslation(homeNs)

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

      <div className='shot-row'>
        {shots.map((shot) => (
          <figure key={shot.src} className='shot'>
            <img src={shot.src} alt={t(shot.alt)} />
            <figcaption>{t(shot.caption)}</figcaption>
          </figure>
        ))}
      </div>

      <section className='lines'>
        {lines.map((line) => (
          <article key={line.title}>
            <h2>{t(line.title)}</h2>
            <p>{t(line.body)}</p>
          </article>
        ))}
      </section>

      <p className='support'>
        {t('support')}{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </div>
  )
}
