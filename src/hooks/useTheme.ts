import { useEffect } from 'react'
import { useUI } from '@/store'

/**
 * 主题管理Hook
 * 处理主题切换和系统主题检测
 */
export function useTheme() {
  const { theme, setTheme } = useUI()
  
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
  
  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark', 'gov-red')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])
  
  return { theme, setTheme }
}
