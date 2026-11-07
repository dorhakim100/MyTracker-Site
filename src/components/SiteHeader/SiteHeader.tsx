import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { smoothScroll } from '../../services/scroll'
import { currentTheme, toggleTheme, type ThemeMode } from '../../services/theme'
import { siteHeaderNs } from './locals'
import './locals'

const nav = [
  { to: '/', key: 'home', end: true },
  { to: '/privacy', key: 'privacy', end: false },
] as const

export function SiteHeader() {
  const { t, i18n } = useTranslation(siteHeaderNs)
  const location = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(currentTheme)

  const language = i18n.resolvedLanguage?.startsWith('he') ? 'he' : 'en'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen])

  const onToggleLanguage = () => {
    void i18n.changeLanguage(language === 'he' ? 'en' : 'he')
  }

  const onToggleTheme = () => {
    setTheme(toggleTheme())
  }

  return (
    <header className='site-header-container' ref={headerRef}>
      <NavLink to='/' className='brand' end onClick={smoothScroll}>
        <img src='/logo-square.png' alt='MyTracker' />
      </NavLink>

      <nav className='desktop-nav' aria-label={t('home')}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
            onClick={smoothScroll}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      <div className='header-actions'>
        <IconButton
          className='header-icon'
          aria-label={t('switchLanguage')}
          onClick={onToggleLanguage}
        >
          <span className='lang-code'>{language === 'he' ? 'EN' : 'HE'}</span>
        </IconButton>
        <IconButton
          className='header-icon'
          aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          className='header-icon menu-button'
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </div>

      {menuOpen ? (
        <nav className='mobile-nav' aria-label={t('home')}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
              onClick={smoothScroll}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
