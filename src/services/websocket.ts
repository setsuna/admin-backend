import type { WebSocketMessage } from '@/types'

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private listeners = new Map<string, ((data: any) => void)[]>()
  private isConnected = false

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket 连接已建立')
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket 连接已关闭:', event.code, event.reason)
          this.isConnected = false
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket 连接错误:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private reconnect(): void {
    this.reconnectAttempts++
    console.log(`尝试重连 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(console.error)
    }, this.reconnectInterval)
  }

  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message
    const typeListeners = this.listeners.get(type)
    
    if (typeListeners) {
      typeListeners.forEach(listener => listener(data))
    }
  }

  // 订阅消息类型
  on(type: string, listener: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    
    this.listeners.get(type)!.push(listener)
    
    // 返回取消订阅函数
    return () => {
      const typeListeners = this.listeners.get(type)
      if (typeListeners) {
        const index = typeListeners.indexOf(listener)
        if (index > -1) {
          typeListeners.splice(index, 1)
        }
      }
    }
  }

  // 发送消息
  send(type: string, data: any): void {
    if (this.ws && this.isConnected) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }

  // 关闭连接
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  // 获取连接状态
  getConnectionState(): boolean {
    return this.isConnected
  }
}

// 创建全局WebSocket实例
export const wsService = new WebSocketService(`ws://${window.location.host}/ws`)

// 兼容性导出
export const websocketService = wsService
