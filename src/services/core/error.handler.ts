/**
 * 统一错误处理器
 */

import { envConfig } from '@/config/env.config'

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'CONFIG_ERROR'
  | 'VALIDATION_ERROR'
  | 'BUSINESS_ERROR'

export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: string | number
  details?: any
  timestamp: number
  requestId?: string
}

export interface ErrorHandler {
  handleError: (error: Error, type: ErrorType, details?: any) => void
  showError: (message: string, type?: ErrorType) => void
  logError: (errorInfo: ErrorInfo) => void
}

class DefaultErrorHandler implements ErrorHandler {
  /**
   * 处理错误
   */
  handleError(error: Error, type: ErrorType, details?: any): void {
    const errorInfo: ErrorInfo = {
      type,
      message: error.message,
      code: (error as any).code,
      details,
      timestamp: Date.now(),
      requestId: (error as any).requestId
    }

    // 记录错误日志
    this.logError(errorInfo)

    // 显示用户友好的错误信息
    this.showError(this.getUserFriendlyMessage(errorInfo), type)
  }

  /**
   * 显示错误信息给用户
   */
  showError(message: string, type: ErrorType = 'API_ERROR'): void {
    // 这里可以集成具体的通知组件
    if (envConfig.DEV) {
      console.error(`[${type}] ${message}`)
    }

    // 触发全局错误事件
    window.dispatchEvent(new CustomEvent('app:error', {
      detail: { message, type }
    }))
  }

  /**
   * 记录错误日志
   */
  logError(errorInfo: ErrorInfo): void {
    // 开发环境控制台输出
    if (envConfig.DEV) {
      console.group(`🔴 Error [${errorInfo.type}]`)
      console.error('Message:', errorInfo.message)
      console.error('Code:', errorInfo.code)
      console.error('Details:', errorInfo.details)
      console.error('Request ID:', errorInfo.requestId)
      console.error('Timestamp:', new Date(errorInfo.timestamp).toISOString())
      console.groupEnd()
    }

    // 生产环境发送到日志服务
    if (envConfig.PROD) {
      this.sendToLogService(errorInfo)
    }
  }

  /**
   * 获取用户友好的错误信息
   */
  private getUserFriendlyMessage(errorInfo: ErrorInfo): string {
    const { type, message } = errorInfo

    const friendlyMessages: Record<ErrorType, string> = {
      NETWORK_ERROR: '网络连接失败，请检查网络设置后重试',
      API_ERROR: '服务请求失败，请稍后再试',
      PERMISSION_DENIED: '权限不足，请联系管理员',
      NOT_FOUND: '请求的资源不存在',
      SERVER_ERROR: '服务器内部错误，请稍后再试',
      CONFIG_ERROR: '配置错误，请联系管理员',
      VALIDATION_ERROR: '数据验证失败，请检查输入信息',
      BUSINESS_ERROR: message
    }

    return friendlyMessages[type] || message
  }

  /**
   * 发送错误日志到服务器
   */
  private async sendToLogService(errorInfo: ErrorInfo): Promise<void> {
    try {
      // 这里可以调用日志服务API
      await fetch('/api/v1/logs/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      })
    } catch (logError) {
      // 忽略日志发送错误，避免无限循环
      console.warn('Failed to send error log:', logError)
    }
  }
}

// 错误重试机制
export class RetryManager {
  private retryMap = new Map<string, number>()

  shouldRetry(error: Error, requestId: string, maxRetries: number = 3): boolean {
    const currentRetries = this.retryMap.get(requestId) || 0
    
    // 只对特定类型的错误进行重试
    if (this.isRetryableError(error) && currentRetries < maxRetries) {
      this.retryMap.set(requestId, currentRetries + 1)
      return true
    }
    
    this.retryMap.delete(requestId)
    return false
  }

  private isRetryableError(error: Error): boolean {
    const retryableErrors = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'TIMEOUT_ERROR'
    ]
    
    return retryableErrors.some(type => 
      error.message.includes(type) || (error as any).type === type
    )
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (i === maxRetries || !this.isRetryableError(lastError)) {
          throw lastError
        }
        
        // 指数退避延迟
        await this.wait(delay * Math.pow(2, i))
      }
    }
    
    throw lastError!
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const errorHandler = new DefaultErrorHandler()
export const retryManager = new RetryManager()
