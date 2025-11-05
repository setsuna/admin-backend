import type { 
  WSMessage, 
  WSMessageType, 
  WSConnectionState,
  WSConfig 
} from '@/types/common/websocket.types'

type MessageHandler = (message: WSMessage) => void

/**
 * WebSocket 服务
 * 负责管理 WebSocket 连接、消息处理、自动重连
 */
class WebSocketService {
  private ws: WebSocket | null = null
  private config: WSConfig
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private messageHandlers: Map<WSMessageType | '*', Set<MessageHandler>> = new Map()
  private connectionState: WSConnectionState = 'disconnected'
  private stateListeners: Set<(state: WSConnectionState) => void> = new Set()

  constructor(config: WSConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    }
  }

  /**
   * 连接 WebSocket
   */
  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    this.updateConnectionState('connecting')
    
    try {
      const url = `${this.config.url}?token=${encodeURIComponent(token)}`
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.updateConnectionState('connected')
        this.reconnectAttempts = 0
        this.clearReconnectTimer()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.updateConnectionState('error')
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.updateConnectionState('disconnected')
        this.scheduleReconnect(token)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.updateConnectionState('error')
      this.scheduleReconnect(token)
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.clearReconnectTimer()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.updateConnectionState('disconnected')
  }

  /**
   * 订阅消息
   */
  on(type: WSMessageType | '*', handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    this.messageHandlers.get(type)!.add(handler)

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.get(type)?.delete(handler)
    }
  }

  /**
   * 取消订阅
   */
  off(type: WSMessageType | '*', handler: MessageHandler) {
    this.messageHandlers.get(type)?.delete(handler)
  }

  /**
   * 监听连接状态变化
   */
  onStateChange(listener: (state: WSConnectionState) => void) {
    this.stateListeners.add(listener)
    return () => {
      this.stateListeners.delete(listener)
    }
  }

  /**
   * 获取当前连接状态
   */
  getConnectionState(): WSConnectionState {
    return this.connectionState
  }

  /**
   * 处理消息
   */
  private handleMessage(message: WSMessage) {
    // 调用通配符处理器
    this.messageHandlers.get('*')?.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Message handler error:', error)
      }
    })

    // 调用特定类型处理器
    this.messageHandlers.get(message.type)?.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Message handler error:', error)
      }
    })
  }

  /**
   * 更新连接状态
   */
  private updateConnectionState(state: WSConnectionState) {
    this.connectionState = state
    this.stateListeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('State listener error:', error)
      }
    })
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(token: string) {
    const maxAttempts = this.config.maxReconnectAttempts || 10
    
    if (this.reconnectAttempts >= maxAttempts) {
      console.error(`Max reconnect attempts (${maxAttempts}) reached`)
      return
    }

    this.clearReconnectTimer()
    
    const interval = this.config.reconnectInterval || 5000
    console.log(`Reconnecting in ${interval}ms (attempt ${this.reconnectAttempts + 1}/${maxAttempts})`)
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect(token)
    }, interval)
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// 创建单例实例
const getWebSocketURL = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = import.meta.env.VITE_API_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:8080'
  return `${protocol}//${host}/api/v1/ws`
}

export const wsService = new WebSocketService({
  url: getWebSocketURL(),
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
})
