import React from 'react'
import { cn } from '@/utils'

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    label: '在线',
    pulseColor: 'bg-green-400',
  },
  offline: {
    color: 'bg-gray-400',
    label: '离线',
    pulseColor: 'bg-gray-300',
  },
  warning: {
    color: 'bg-yellow-500',
    label: '警告',
    pulseColor: 'bg-yellow-400',
  },
  error: {
    color: 'bg-red-500',
    label: '错误',
    pulseColor: 'bg-red-400',
  },
}

const sizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

export function StatusIndicator({ 
  status, 
  label, 
  size = 'md', 
  showPulse = false 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const sizeClass = sizeConfig[size]
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div 
          className={cn(
            'rounded-full',
            config.color,
            sizeClass
          )}
        />
        {showPulse && status === 'online' && (
          <div 
            className={cn(
              'absolute top-0 left-0 rounded-full animate-ping',
              config.pulseColor,
              sizeClass
            )}
          />
        )}
      </div>
      {label !== undefined && (
        <span className="text-sm text-muted-foreground">
          {label || config.label}
        </span>
      )}
    </div>
  )
}
