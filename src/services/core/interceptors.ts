/**
 * 请求/响应拦截器
 */

import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getConfig, HTTP_STATUS, JWT_CONFIG } from '@/config'
import { ApiResponse } from '@/services/types/api.types'
import { errorHandler } from './error.handler'
// 使用统一的认证服务
import { auth } from './auth.service'

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
  const token = auth.getToken() // 使用统一的认证服务
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `${JWT_CONFIG.HEADER_PREFIX} ${token}`
    // 调试日志
    console.log('[请求拦截器] Token found:', {
      tokenExists: !!token,
      tokenPrefix: token?.substring(0, 20) + '...',
      authHeader: `${JWT_CONFIG.HEADER_PREFIX} ${token?.substring(0, 20)}...`
    })
  } else {
    console.log('[请求拦截器] No token found')
  }

  // 添加请求头
  if (config.headers) {
    config.headers.set('X-Request-ID', reqId)
    config.headers.set('X-Timestamp', Date.now().toString())
  }

  // 开发环境请求日志
  const appConfig = getConfig()
  if (appConfig.api.enableRequestLog) {
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
  const appConfig = getConfig()
  if (appConfig.api.enableRequestLog) {
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
 * 错误拦截器 (重构后支持新错误码分类处理)
 */
export const errorInterceptor = async (error: AxiosError<ApiResponse>): Promise<never> => {
  const { config, response, request } = error
  const requestId = config?.metadata?.requestId
  const startTime = config?.metadata?.startTime
  const duration = startTime ? Date.now() - startTime : 0

  // 开发环境错误日志
  const appConfig = getConfig()
  if (appConfig.api.enableRequestLog) {
    console.group(`❌ API Error [${requestId}] - ${duration}ms`)
    console.error('Error:', error.message)
    console.error('Config:', config)
    console.error('Response:', response)
    console.groupEnd()
  }

  // 🔄 更新：新错误码分类处理
  if (response) {
    const { status, data } = response
    
    // 🆕 优先处理业务错误码（新错误码系统）
    if (data?.code && data.code !== ERROR_CODES.SUCCESS) {
      await handleApiError(data.code, data.message, data.errors, requestId)
      return Promise.reject({ ...error, apiCode: data.code, apiData: data })
    }
    
    // HTTP状态码错误处理(兼容性)
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        await handleApiError(ERROR_CODES.UNAUTHORIZED, '未授权，请先登录', undefined, requestId)
        break
      case HTTP_STATUS.FORBIDDEN:
        await handleApiError(ERROR_CODES.PERMISSION_DENIED, '权限不足，请联系管理员', undefined, requestId)
        break
      case HTTP_STATUS.NOT_FOUND:
        errorHandler.handleError(new Error('请求的资源不存在'), 'NOT_FOUND')
        break
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        await handleApiError(ERROR_CODES.INTERNAL_SERVER_ERROR, '系统异常，请稍后重试', undefined, requestId)
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

/**
 * 🆕 API错误分类处理器
 */
async function handleApiError(
  code: number, 
  message: string, 
  errors?: ValidationError[], 
  requestId?: string
) {
  const category = getErrorCategory(code)
  const errorMessage = getErrorMessage(code, message)
  
  console.log(`[错误处理器] 处理错误码: ${code}, 分类: ${category}, 消息: ${errorMessage}`)
  
  switch (category) {
    case 'auth':
      await handleAuthError(code, errorMessage, requestId)
      break
    case 'file':
      handleFileError(code, errorMessage, errors)
      break
    case 'general':
      handleGeneralError(code, errorMessage, errors)
      break
    case 'authorization':
      handleAuthorizationError(code, errorMessage)
      break
    case 'system':
      handleSystemError(code, errorMessage)
      break
    default:
      errorHandler.handleError(new Error(errorMessage), 'API_ERROR')
  }
}

/**
 * 🆕 认证错误处理
 */
async function handleAuthError(code: number, message: string, requestId?: string) {
  // 需要自动跳转登录的错误码
  if (needsAutoLogin(code)) {
    console.log(`[认证错误] 自动登出并跳转登录: ${code}`)
    await auth.logout()
    window.location.href = '/login'
    return
  }
  
  // 其他认证错误显示提示
  errorHandler.handleError(new Error(message), 'PERMISSION_DENIED')
}

/**
 * 🆕 文件错误处理
 */
function handleFileError(code: number, message: string, errors?: ValidationError[]) {
  // 文件相关错误通常需要具体的用户指导
  let userMessage = message
  
  switch (code) {
    case ERROR_CODES.FILE_TOO_LARGE:
      userMessage = '文件过大，请选择小于10MB的文件'
      break
    case ERROR_CODES.FILE_TYPE_NOT_SUPPORTED:
      userMessage = '不支持该文件类型，请选择文档、图片或视频文件'
      break
  }
  
  errorHandler.handleError(new Error(userMessage), 'BUSINESS_ERROR')
}

/**
 * 🆕 通用错误处理
 */
function handleGeneralError(code: number, message: string, errors?: ValidationError[]) {
  if (code === ERROR_CODES.VALIDATION_ERROR && errors && errors.length > 0) {
    // 表单验证错误，触发专门的验证错误事件
    window.dispatchEvent(new CustomEvent('app:validation-error', {
      detail: { message, errors }
    }))
    return
  }
  
  errorHandler.handleError(new Error(message), 'VALIDATION_ERROR')
}

/**
 * 🆕 授权错误处理
 */
function handleAuthorizationError(code: number, message: string) {
  // 授权错误需要联系管理员
  errorHandler.handleError(new Error(message + '，请联系系统管理员'), 'PERMISSION_DENIED')
}

/**
 * 🆕 系统错误处理
 */
function handleSystemError(code: number, message: string) {
  // 系统错误可能需要重试
  const error = new Error(message)
  ;(error as any).retryable = true
  errorHandler.handleError(error, 'SERVER_ERROR')
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
