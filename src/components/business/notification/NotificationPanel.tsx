import { Bell, CheckCheck } from 'lucide-react'
import { useNotificationList } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { NotificationItem } from './NotificationItem'

export function NotificationPanel() {
  // ✅ 使用专门的通知列表 hook，只订阅通知相关状态
  const { 
    notifications: notificationHistory,
    unreadCount,
    markNotificationAsRead, 
    markAllAsRead,
    clearNotificationHistory
  } = useNotificationList()
  
  // 只显示最近10条
  const recentNotifications = (notificationHistory || []).slice(-10).reverse()
  
  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-medium">通知</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({unreadCount} 条未读)
            </span>
          )}
        </div>
        {notificationHistory.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            全部已读
          </Button>
        )}
      </div>
      
      {/* 通知列表 */}
      <div className="divide-y">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无通知</p>
          </div>
        ) : (
          recentNotifications.map((notification) => (
            <NotificationItem 
              key={notification.id}
              notification={notification}
              onMarkAsRead={markNotificationAsRead}
            />
          ))
        )}
      </div>
      
      {/* 底部 */}
      {notificationHistory.length > 0 && (
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full"
            onClick={clearNotificationHistory}
          >
            清空全部
          </Button>
        </div>
      )}
    </div>
  )
}
