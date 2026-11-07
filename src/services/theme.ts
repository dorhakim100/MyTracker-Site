const THEME_KEY = 'my-tracker-theme'

export type ThemeMode = 'light' | 'dark'

export function currentTheme(): ThemeMode {
  return document.documentElement.classList.contains('dark-mode')
    ? 'dark'
    : 'light'
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark-mode', mode === 'dark')
  localStorage.setItem(THEME_KEY, mode)
}

export function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
