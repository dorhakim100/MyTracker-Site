import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { SiteHeader } from './components/SiteHeader/SiteHeader'
import { Home } from './pages/Home/Home'
import { Privacy } from './pages/Privacy/Privacy'
import { smoothScroll } from './services/scroll'

function ScrollOnNavigate() {
  const { pathname } = useLocation()

  useEffect(() => {
    smoothScroll()
  }, [pathname])

  return null
}

const theme = createTheme({
  typography: {
    fontFamily: 'Rubik, system-ui, sans-serif',
  },
  palette: {
    primary: { main: '#009688' },
  },
})

function DocumentLanguage() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const hebrew = i18n.resolvedLanguage?.startsWith('he')
    document.documentElement.lang = hebrew ? 'he' : 'en'
    document.documentElement.dir = hebrew ? 'rtl' : 'ltr'
  }, [i18n, i18n.language, i18n.resolvedLanguage])

  return null
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <DocumentLanguage />
      <ScrollOnNavigate />
      <SiteHeader />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
    </ThemeProvider>
  )
}
