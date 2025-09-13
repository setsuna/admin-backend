import React from 'react'
import { cn } from '@/utils'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'> {
  options: SelectOption[]
  placeholder?: string
  size?: 'default' | 'sm' | 'lg'
  error?: boolean
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, size = 'default', error, children, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value)
    }
    
    return (
      <select
        className={cn(
          'block border border-input bg-background text-foreground rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // 错误状态
          error && 'border-destructive focus:ring-destructive',
          // 尺寸变体
          {
            'px-3 py-2 text-sm h-10': size === 'default',
            'px-2 py-1 text-xs h-8': size === 'sm',
            'px-4 py-3 text-base h-12': size === 'lg',
          },
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="text-sm"
          >
            {option.label}
          </option>
        ))}
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'

export { Select }
