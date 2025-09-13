import { cn } from '@/utils'

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'success' | 'info'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
  className?: string
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    label: '在线',
    pulseColor: 'bg-green-400',
  },
  offline: {
    color: 'bg-gray-400',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: '离线',
    pulseColor: 'bg-gray-300',
  },
  warning: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    label: '警告',
    pulseColor: 'bg-yellow-400',
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    label: '错误',
    pulseColor: 'bg-red-400',
  },
  success: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    label: '成功',
    pulseColor: 'bg-green-400',
  },
  info: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: '信息',
    pulseColor: 'bg-blue-400',
  },
}

const sizeConfig = {
  sm: {
    dot: 'h-1.5 w-1.5',
    text: 'text-xs',
    badge: 'px-1.5 py-0.5 text-xs'
  },
  md: {
    dot: 'h-2 w-2',
    text: 'text-sm',
    badge: 'px-2 py-1 text-sm'
  },
  lg: {
    dot: 'h-3 w-3',
    text: 'text-base',
    badge: 'px-2.5 py-1 text-sm'
  },
}

export function StatusIndicator({ 
  status, 
  text, 
  size = 'md', 
  showPulse = false,
  className 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const sizeClasses = sizeConfig[size]
  
  if (!config) {
    console.warn(`StatusIndicator: Unknown status "${status}"`)
    return null
  }
  
  const displayText = text !== undefined ? text : config.label
  
  // 如果有文本，显示为徽章样式
  if (displayText) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses.badge,
        className
      )}>
        <div className={cn(
          'rounded-full',
          config.color,
          sizeClasses.dot
        )}>
          {showPulse && (status === 'online' || status === 'success') && (
            <div className={cn(
              'absolute rounded-full animate-ping',
              config.pulseColor,
              sizeClasses.dot
            )} />
          )}
        </div>
        {displayText}
      </span>
    )
  }
  
  // 仅显示状态点
  return (
    <div className={cn('relative inline-flex', className)}>
      <div className={cn(
        'rounded-full',
        config.color,
        sizeClasses.dot
      )} />
      {showPulse && (status === 'online' || status === 'success') && (
        <div className={cn(
          'absolute top-0 left-0 rounded-full animate-ping',
          config.pulseColor,
          sizeClasses.dot
        )} />
      )}
    </div>
  )
}

export default StatusIndicator
