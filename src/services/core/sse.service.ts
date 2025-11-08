import { getConfig } from '@/config'

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
  private eventSource: EventSource | null = null
  private handlers: Map<string, EventHandler[]> = new Map()

  /**
   * 开始批量同步（SSE方式）
   */
  startBatchSync(
    meetingIds: string[],
    serialNumbers: string[],
    metadata: Record<string, any> = {}
  ): void {
    this.close()

    const config = getConfig()
    const token = localStorage.getItem('token')
    
    // 构建完整的URL（处理相对路径情况）
    let baseURL = config.api.baseURL
    if (!baseURL.startsWith('http')) {
      // 如果是相对路径，添加origin
      baseURL = window.location.origin + baseURL
    }
    
    // 构建SSE URL
    const url = new URL(`${baseURL}/mount/sync/meeting-package/batch`)
    
    // 添加查询参数
    url.searchParams.set('meetingIds', meetingIds.join(','))
    url.searchParams.set('serialNumbers', serialNumbers.join(','))
    if (Object.keys(metadata).length > 0) {
      url.searchParams.set('metadata', JSON.stringify(metadata))
    }
    if (token) {
      url.searchParams.set('token', token)
    }

    console.log('[SSE] 连接URL:', url.toString())
    this.eventSource = new EventSource(url.toString())

    // 注册事件监听器
    this.eventSource.addEventListener('start', (e) => {
      this.handleEvent('start', e)
    })

    this.eventSource.addEventListener('progress', (e) => {
      this.handleEvent('progress', e)
    })

    this.eventSource.addEventListener('heartbeat', (e) => {
      this.handleEvent('heartbeat', e)
    })

    this.eventSource.addEventListener('complete', (e) => {
      this.handleEvent('complete', e)
      this.close()
    })

    this.eventSource.addEventListener('error', (e) => {
      console.error('[SSE] 连接错误:', e)
      const errorEvent: SSEEvent<ErrorEventData> = {
        type: 'error',
        data: { message: '连接错误' }
      }
      this.emit('error', errorEvent)
      this.close()
    })

    this.eventSource.onerror = (error) => {
      console.error('[SSE] onerror:', error)
    }
  }

  /**
   * 处理SSE事件
   */
  private handleEvent(type: string, event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      const sseEvent: SSEEvent = {
        type: type as any,
        data
      }
      console.log(`[SSE] 收到 ${type} 事件:`, sseEvent)
      this.emit(type, sseEvent)
    } catch (error) {
      console.error(`[SSE] 解析 ${type} 事件失败:`, error, event.data)
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
    if (this.eventSource) {
      console.log('[SSE] 关闭连接')
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * 获取连接状态
   */
  getState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED
  }
}

export const sseService = new SSEService()
