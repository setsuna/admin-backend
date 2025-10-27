import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/utils'
import { useNotifications } from '@/hooks/useNotifications'
import type { NotificationType } from '@/types'

const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
}

interface NotificationItemProps {
  id: string
  type: NotificationType
  title?: string
  message?: string
  onClose: (id: string) => void
}

function NotificationItem({ id, type, title, message, onClose }: NotificationItemProps) {
  const config = notificationConfig[type]
  const Icon = config.icon
  
  return (
    <div className={cn(
      'mb-4 flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
      config.className
    )}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-medium">{title}</h4>}
        {message && (
          <p className={cn("text-sm opacity-90", title && "mt-1")}>{message}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()
  
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id!}
          id={notification.id!}
          type={notification.type}
          title={notification.title || ''}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}
