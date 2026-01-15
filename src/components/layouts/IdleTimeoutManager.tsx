/**
 * 空闲超时管理器
 * 监听用户活动，空闲超时后自动登出
 */

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import { authService } from '@/services/core/auth.service'

export const IdleTimeoutManager = () => {
  const { clearAuth } = useStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  
  // 获取超时时间（分钟）
  const getTimeoutMinutes = useCallback(() => {
    const stored = localStorage.getItem('session_timeout_minutes')
    if (stored) {
      const minutes = parseInt(stored, 10)
      if (!isNaN(minutes) && minutes > 0) {
        return minutes
      }
    }
    return 0 // 0 表示不启用超时
  }, [])
  
  // 执行登出
  const handleTimeout = useCallback(async () => {
    console.log('[空闲超时] 会话超时，正在登出...')
    
    try {
      await authService.logout()
    } catch (error) {
      console.warn('[空闲超时] 登出API错误:', error)
    } finally {
      clearAuth()
      window.location.href = '/login'
    }
  }, [clearAuth])
  
  // 重置计时器
  const resetTimer = useCallback(() => {
    const timeoutMinutes = getTimeoutMinutes()
    
    // 如果没有设置超时时间，不启用
    if (timeoutMinutes <= 0) {
      return
    }
    
    // 更新最后活动时间
    lastActivityRef.current = Date.now()
    
    // 清除旧的计时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 设置新的计时器
    const timeoutMs = timeoutMinutes * 60 * 1000
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs)
  }, [getTimeoutMinutes, handleTimeout])
  
  // 处理用户活动
  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])
  
  useEffect(() => {
    const timeoutMinutes = getTimeoutMinutes()
    
    // 如果没有设置超时时间，不启用监听
    if (timeoutMinutes <= 0) {
      return
    }
    
    // 监听的事件类型
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ]
    
    // 节流函数，避免频繁触发
    let throttleTimer: NodeJS.Timeout | null = null
    const throttledHandler = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        throttleTimer = null
        handleActivity()
      }, 1000) // 1秒节流
    }
    
    // 添加事件监听
    events.forEach(event => {
      document.addEventListener(event, throttledHandler, { passive: true })
    })
    
    // 初始化计时器
    resetTimer()
    
    // 清理函数
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandler)
      })
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [getTimeoutMinutes, handleActivity, resetTimer])
  
  // 不渲染任何内容
  return null
}

export default IdleTimeoutManager
