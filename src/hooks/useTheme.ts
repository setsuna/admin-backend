import { useEffect } from 'react'
import { useGlobalStore } from '@/store'

// 主题切换hook
export function useTheme() {
  const { theme, setTheme } = useGlobalStore()
  
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark', 'gov-red')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])
  
  return { theme, setTheme }
}