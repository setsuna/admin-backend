/**
 * 请求/响应拦截器
 */

import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { apiConfig, HTTP_STATUS } from '@/config/api.config'
import { JWT_CONFIG } from '@/config/auth.config'
import { ApiResponse } from '@/services/types/api.types'
import { authService } from './auth.service'
import { errorHandler } from './error.handler'

// 扩展配置类型以包含metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId: string
    startTime: number
  }
}

// 请求ID生成器
let requestId = 0
const generateRequestId = () => `req_${Date.now()}_${++requestId}`

/**
 * 请求拦截器
 */
export const requestInterceptor = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  // 生成请求ID用于追踪
  const reqId = generateRequestId()
  ;(config as ExtendedAxiosRequestConfig).metadata = { requestId: reqId, startTime: Date.now() }

  // 添加认证token
  const token = authService.getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `${JWT_CONFIG.HEADER_PREFIX} ${token}`
  }

  // 添加请求头
  if (config.headers) {
    config.headers.set('X-Request-ID', reqId)
    config.headers.set('X-Timestamp', Date.now().toString())
  }

  // 开发环境请求日志
  if (apiConfig.enableRequestLog) {
    console.group(`🚀 API Request [${reqId}]`)
    console.log('URL:', `${config.baseURL}${config.url}`)
    console.log('Method:', config.method?.toUpperCase())
    console.log('Headers:', config.headers)
    if (config.params) console.log('Params:', config.params)
    if (config.data) console.log('Data:', config.data)
    console.groupEnd()
  }

  return config
}

/**
 * 响应拦截器
 */
export const responseInterceptor = (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => {
  const { config, data } = response
  const extendedConfig = config as ExtendedAxiosRequestConfig
  const requestId = extendedConfig.metadata?.requestId
  const startTime = extendedConfig.metadata?.startTime
  const duration = startTime ? Date.now() - startTime : 0

  // 添加响应元数据
  if (data && typeof data === 'object') {
    ;(data as any).requestId = requestId
    ;(data as any).timestamp = Date.now()
  }

  // 开发环境响应日志
  if (apiConfig.enableRequestLog) {
    console.group(`✅ API Response [${requestId}] - ${duration}ms`)
    console.log('Status:', response.status)
    console.log('Data:', data)
    console.groupEnd()
  }

  // 统一处理业务错误
  if (data?.code && data.code !== HTTP_STATUS.OK) {
    const error = new Error(data.message || 'API业务错误')
    ;(error as any).code = data.code
    ;(error as any).data = data
    throw error
  }

  return response
}

/**
 * 错误拦截器
 */
export const errorInterceptor = async (error: AxiosError<ApiResponse>): Promise<never> => {
  const { config, response, request } = error
  const requestId = config?.metadata?.requestId
  const startTime = config?.metadata?.startTime
  const duration = startTime ? Date.now() - startTime : 0

  // 开发环境错误日志
  if (apiConfig.enableRequestLog) {
    console.group(`❌ API Error [${requestId}] - ${duration}ms`)
    console.error('Error:', error.message)
    console.error('Config:', config)
    console.error('Response:', response)
    console.groupEnd()
  }

  // HTTP状态码错误处理
  if (response) {
    const { status, data } = response
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Token过期或无效，尝试刷新
        if (authService.canRefreshToken()) {
          try {
            await authService.refreshToken()
            // 重新发起请求
            if (config) {
              // 避免循环依赖，直接使用axios实例
              const { httpClient } = await import('./http.client')
              return httpClient.getInstance()(config as any)
            }
          } catch (refreshError) {
            authService.logout()
            window.location.href = '/login'
          }
        } else {
          authService.logout()
          window.location.href = '/login'
        }
        break

      case HTTP_STATUS.FORBIDDEN:
        errorHandler.handleError(new Error('权限不足，请联系管理员'), 'PERMISSION_DENIED')
        break

      case HTTP_STATUS.NOT_FOUND:
        errorHandler.handleError(new Error('请求的资源不存在'), 'NOT_FOUND')
        break

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        errorHandler.handleError(new Error('服务器内部错误，请稍后再试'), 'SERVER_ERROR')
        break

      default:
        const errorMessage = data?.message || `请求失败 (${status})`
        errorHandler.handleError(new Error(errorMessage), 'API_ERROR')
    }
  } else if (request) {
    // 网络错误
    errorHandler.handleError(new Error('网络连接失败，请检查网络设置'), 'NETWORK_ERROR')
  } else {
    // 请求配置错误
    errorHandler.handleError(new Error('请求配置错误'), 'CONFIG_ERROR')
  }

  return Promise.reject(error)
}

// 扩展AxiosRequestConfig类型以支持metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string
      startTime: number
    }
  }
}
