import { useEffect, useRef, useCallback } from 'react'
import { getConfig } from '@/config'
import type { SyncProgressMessage } from '@/types'

interface UseSyncWebSocketOptions {
  onProgress?: (message: SyncProgressMessage) => void
  onError?: (error: Event) => void
  onClose?: () => void
  enabled?: boolean
}

export function useSyncWebSocket(options: UseSyncWebSocketOptions = {}) {
  const { onProgress, onError, onClose, enabled = true } = options
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    if (!enabled) return

    const config = getConfig()
    const wsUrl = config.api.baseURL.replace(/^http/, 'ws') + '/ws'

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[Sync WebSocket] Connected')
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'sync_progress' && onProgress) {
            onProgress(message as SyncProgressMessage)
          }
        } catch (error) {
          console.error('[Sync WebSocket] Failed to parse message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[Sync WebSocket] Error:', error)
        onError?.(error)
      }

      ws.onclose = () => {
        console.log('[Sync WebSocket] Disconnected')
        onClose?.()
        
        // 尝试重连
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[Sync WebSocket] Reconnecting...')
            connect()
          }, 5000)
        }
      }
    } catch (error) {
      console.error('[Sync WebSocket] Connection failed:', error)
    }
  }, [enabled, onProgress, onError, onClose])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
}
