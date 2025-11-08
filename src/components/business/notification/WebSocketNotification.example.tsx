/**
 * WebSocket消息通知示例
 * 展示如何正确使用 showSocketMessage 让消息进入历史记录
 */

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

export function WebSocketNotificationExample() {
  const { showSocketMessage, showSuccess } = useNotifications()
  
  useEffect(() => {
    // 模拟 WebSocket 连接
    const ws = new WebSocket('ws://localhost:8080/ws')
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'meeting_reminder':
          // ✅ 使用 showSocketMessage - 会进入历史记录
          showSocketMessage(
            '会议提醒',
            `会议"${message.meetingTitle}"将在10分钟后开始`,
            { 
              duration: 0, // 不自动消失
              persistent: true,
              actions: [{
                label: '查看详情',
                action: () => {
                  window.location.href = `/meetings/${message.meetingId}`
                }
              }]
            }
          )
          break
          
        case 'approval_notification':
          // ✅ 使用 showSocketMessage - 会进入历史记录
          showSocketMessage(
            '审批通知',
            `您有新的${message.approvalType}待审批`,
            {
              actions: [{
                label: '立即处理',
                action: () => {
                  window.location.href = `/approvals/${message.approvalId}`
                }
              }]
            }
          )
          break
          
        case 'system_announcement':
          // ✅ 使用 showSocketMessage - 会进入历史记录
          showSocketMessage(
            '系统公告',
            message.content,
            { persistent: true }
          )
          break
      }
    }
    
    return () => ws.close()
  }, [showSocketMessage])
  
  // 示例：API操作反馈（不进历史）
  const handleSave = async () => {
    try {
      // await api.save()
      // ❌ 不要用 showSocketMessage，用 showSuccess
      showSuccess('保存成功', '数据已保存')
    } catch (error) {
      // showError 也不会进历史
    }
  }
  
  return null
}
