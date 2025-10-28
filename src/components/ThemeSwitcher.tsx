import { Monitor, Moon, Sun, Building } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/Button'
import type { Theme } from '@/types'

const themeOptions = [
  {
    value: 'light' as Theme,
    label: '浅色',
    icon: Sun,
    description: '明亮清爽'
  },
  {
    value: 'dark' as Theme,
    label: '深色',
    icon: Moon,
    description: '护眼舒适'
  },
  {
    value: 'system' as Theme,
    label: '跟随系统',
    icon: Monitor,
    description: '自动切换'
  },
  {
    value: 'gov-red' as Theme,
    label: '政务红',
    icon: Building,
    description: '庄重专业'
  }
]

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  
  const currentTheme = themeOptions.find(option => option.value === theme)
  const CurrentIcon = currentTheme?.icon || Sun
  
  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className={className}
        title={`当前主题：${currentTheme?.label}`}
      >
        <CurrentIcon className="h-4 w-4" />
      </Button>
      
      {/* 主题选择面板 */}
      <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="text-sm font-medium mb-2 px-2">主题设置</div>
        
        <div className="space-y-1">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value
            
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`
                  w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
