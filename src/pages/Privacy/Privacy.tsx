import { useTranslation } from 'react-i18next'
import { SUPPORT_EMAIL } from '../../config/contact'
import { privacyNs } from './locals'
import './locals'

const collected = [
  'account',
  'camera',
  'photos',
  'healthRead',
  'healthWrite',
  'messages',
] as const

export function Privacy() {
  const { t } = useTranslation(privacyNs)

  return (
    <article className='privacy-container'>
      <h1>{t('pageTitle')}</h1>
      <p className='updated'>{t('updated')}</p>
      <h2>{t('whoTitle')}</h2>
      <p>
        {t('whoBody')}{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>

      <h2>{t('collectTitle')}</h2>
      <p>{t('collectIntro')}</p>
      <ul>
        {collected.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>

      <h2>{t('whyTitle')}</h2>
      <p>{t('whyBody')}</p>

      <h2>{t('notTitle')}</h2>
      <p>{t('notBody')}</p>

      <h2>{t('deleteTitle')}</h2>
      <p>{t('deleteBody')}</p>

      <h2>{t('changesTitle')}</h2>
      <p>{t('changesBody')}</p>

      <h2>{t('contactTitle')}</h2>
      <p>
        {t('contactLead')}{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </article>
  )
}
