import { getConfig } from '@/config'
import { authService } from './auth.service'

export interface SSEEvent<T = any> {
  type: 'start' | 'progress' | 'heartbeat' | 'complete' | 'error'
  data: T
}

export interface StartEventData {
  totalCount: number
  meetingCount: number
  deviceCount: number
}

export interface ProgressEventData {
  meetingId: string
  serialNumber: string
  success: boolean
  current: number
  total: number
  percentage: number
  taskId?: string
  createdAt?: number
  errorCode?: number
  errorMessage?: string
}

export interface HeartbeatEventData {
  timestamp: number
}

export interface CompleteEventData {
  totalCount: number
  successCount: number
  failureCount: number
  duration: number
  summary: {
    meetingCount: number
    deviceCount: number
    successRate: number
  }
}

export interface ErrorEventData {
  message: string
}

type EventHandler<T = any> = (event: SSEEvent<T>) => void

class SSEService {
  private abortController: AbortController | null = null
  private handlers: Map<string, EventHandler[]> = new Map()
  private isConnected: boolean = false

  /**
   * 开始批量同步（SSE方式，使用POST）
   */
  async startBatchSync(
    meetingIds: string[],
    serialNumbers: string[],
    metadata: Record<string, any> = {}
  ): Promise<void> {
    this.close()

    const config = getConfig()
    const token = authService.getToken()  // 使用authService获取token
    
    // 构建完整的URL
    let baseURL = config.api.baseURL
    if (!baseURL.startsWith('http')) {
      baseURL = window.location.origin + baseURL
    }
    
    const url = `${baseURL}/mount/sync/meeting-package/batch`
    
    // 创建AbortController用于取消请求
    this.abortController = new AbortController()
    
    try {
      console.log('[SSE] 发起POST请求:', url, {
        meetingIds,
        serialNumbers,
        metadata
      })
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          meetingIds,
          serialNumbers,
          metadata
        }),
        signal: this.abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      this.isConnected = true
      console.log('[SSE] 连接成功，开始读取流')

      // SSE流式读取
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('[SSE] 流读取完成')
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          if (!event.trim()) continue
          
          // 解析 "data: {json}" 格式
          const match = event.match(/^data: (.+)$/m)
          if (match) {
            try {
              const data = JSON.parse(match[1])
              console.log('[SSE] 收到事件:', data.type, data.data)
              this.emit(data.type, data)
            } catch (error) {
              console.error('[SSE] 解析事件失败:', error, match[1])
            }
          }
        }
      }

      this.isConnected = false
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[SSE] 连接已取消')
      } else {
        console.error('[SSE] 连接错误:', error)
        const errorEvent: SSEEvent<ErrorEventData> = {
          type: 'error',
          data: { message: error.message || '连接错误' }
        }
        this.emit('error', errorEvent)
      }
      this.isConnected = false
    }
  }

  /**
   * 订阅事件
   */
  on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler)

    // 返回取消订阅函数
    return () => {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<T = any>(eventType: string, event: SSEEvent<T>): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    if (this.abortController) {
      console.log('[SSE] 取消连接')
      this.abortController.abort()
      this.abortController = null
    }
    this.isConnected = false
  }

  /**
   * 获取连接状态
   */
  getState(): boolean {
    return this.isConnected
  }
}

export const sseService = new SSEService()
