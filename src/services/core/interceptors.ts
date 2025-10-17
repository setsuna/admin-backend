/**
 * 请求/响应拦截器 (修复错误信息显示问题)
 */

import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getConfig, HTTP_STATUS, JWT_CONFIG, ERROR_CODES, getErrorCategory, needsAutoLogin, getErrorMessage } from '@/config'
import { ApiResponse, ValidationError } from '@/types/api/response.types'
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
 * 🔄 修复：响应拦截器 - 正确提取后端错误信息
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

  // 🔧 修复：正确处理业务错误码 - 使用新错误码常量
  if (data?.code && data.code !== ERROR_CODES.SUCCESS) {
    console.log(`[响应拦截器] 业务错误 - 码: ${data.code}, 消息: ${data.message}`)
    
    // 创建错误对象，带有完整的后端信息
    const businessError = new Error(data.message || '业务错误')
    ;(businessError as any).code = data.code
    ;(businessError as any).data = data
    ;(businessError as any).errors = data.errors
    ;(businessError as any).category = getErrorCategory(data.code)
    ;(businessError as any).requestId = requestId
    
    throw businessError
  }

  return response
}

/**
 * 🔧 修复：错误拦截器 - 正确处理HTTP错误中的业务信息
 */
export const errorInterceptor = async (error: AxiosError<ApiResponse>): Promise<never> => {
  const { config, response, request } = error
  const requestId = (config as ExtendedAxiosRequestConfig)?.metadata?.requestId
  const startTime = (config as ExtendedAxiosRequestConfig)?.metadata?.startTime
  const duration = startTime ? Date.now() - startTime : 0

  // 开发环境错误日志
  const appConfig = getConfig()
  if (appConfig.api.enableRequestLog) {
    console.group(`❌ API Error [${requestId}] - ${duration}ms`)
    console.error('Error Message:', error.message)
    console.error('Response Status:', response?.status)
    console.error('Response Data:', response?.data)
    console.error('Full Error:', error)
    console.groupEnd()
  }

  // 🔧 修复：优先处理HTTP响应中的业务错误
  if (response && response.data) {
    const { status, data } = response
    
    console.log(`[错误拦截器] HTTP ${status} 错误，检查业务数据:`, data)
    
    // 🆕 关键修复：优先检查是否有业务错误码和信息
    if (data && typeof data === 'object' && data.code && data.message) {
      console.log(`[错误拦截器] 找到业务错误信息 - 码: ${data.code}, 消息: ${data.message}`)
      
      // 使用后端返回的具体错误信息和错误码
      await handleApiError(data.code, data.message, data.errors, requestId)
      
      // 抛出包含完整业务信息的错误
      const businessError = new Error(data.message)
      ;(businessError as any).code = data.code
      ;(businessError as any).data = data
      ;(businessError as any).errors = data.errors
      ;(businessError as any).requestId = requestId
      ;(businessError as any).httpStatus = status
      
      return Promise.reject(businessError)
    }
    
    // 🔄 如果没有业务错误信息，按HTTP状态码处理
    console.log(`[错误拦截器] 未找到业务错误信息，按HTTP状态码处理: ${status}`)
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        const authMessage = data?.message || '未授权，请先登录'
        await handleApiError(ERROR_CODES.UNAUTHORIZED, authMessage, undefined, requestId)
        break
      case HTTP_STATUS.FORBIDDEN:
        const forbiddenMessage = data?.message || '权限不足，请联系管理员'
        await handleApiError(ERROR_CODES.PERMISSION_DENIED, forbiddenMessage, undefined, requestId)
        break
      case HTTP_STATUS.NOT_FOUND:
        errorHandler.handleError(new Error(data?.message || '请求的资源不存在'), 'NOT_FOUND')
        break
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        await handleApiError(ERROR_CODES.INTERNAL_SERVER_ERROR, data?.message || '系统异常，请稍后重试', undefined, requestId)
        break
      default:
        const errorMessage = data?.message || `请求失败 (HTTP ${status})`
        errorHandler.handleError(new Error(errorMessage), 'API_ERROR')
    }
    
    // 抛出包含HTTP错误信息的错误
    const httpError = new Error(data?.message || `HTTP ${status} Error`)
    ;(httpError as any).httpStatus = status
    ;(httpError as any).data = data
    ;(httpError as any).requestId = requestId
    return Promise.reject(httpError)
  }
  
  // 处理网络错误和请求配置错误
  else if (request) {
    console.log('[错误拦截器] 网络错误')
    errorHandler.handleError(new Error('网络连接失败，请检查网络设置'), 'NETWORK_ERROR')
  } else {
    console.log('[错误拦截器] 请求配置错误')
    errorHandler.handleError(new Error('请求配置错误'), 'CONFIG_ERROR')
  }

  return Promise.reject(error)
}

/**
 * 🆕 API错误分类处理器 - 修复后使用正确的后端错误信息
 */
async function handleApiError(
  code: number, 
  message: string, 
  errors?: ValidationError[], 
  requestId?: string
) {
  const category = getErrorCategory(code)
  const userMessage = getErrorMessage(code, message)
  
  console.log(`[错误分类处理器] 处理 - 码: ${code}, 分类: ${category}, 后端消息: "${message}", 用户消息: "${userMessage}"`)
  
  switch (category) {
    case 'auth':
      await handleAuthError(code, message, userMessage, requestId)
      break
    case 'file':
      handleFileError(code, message, userMessage, errors)
      break
    case 'general':
      handleGeneralError(code, message, userMessage, errors)
      break
    case 'authorization':
      handleAuthorizationError(code, message, userMessage)
      break
    case 'system':
      handleSystemError(code, message, userMessage)
      break
    case 'business':
    case 'database':
    default:
      // 🔧 修复：使用后端原始错误信息
      errorHandler.handleError(new Error(message), 'API_ERROR')
  }
}

/**
 * 🔧 修复：认证错误处理 - 使用后端原始消息
 */
async function handleAuthError(code: number, backendMessage: string, userMessage: string, requestId?: string) {
  // 需要自动跳转登录的错误码
  if (needsAutoLogin(code)) {
    console.log(`[认证错误] 自动登出并跳转登录: ${code}, 消息: ${backendMessage}`)
    await auth.logout()
    window.location.href = '/login'
    return
  }
  
  // 其他认证错误显示后端原始提示
  console.log(`[认证错误] 显示错误: ${code}, 消息: ${backendMessage}`)
  errorHandler.handleError(new Error(backendMessage), 'PERMISSION_DENIED')
}

/**
 * 🔧 修复：文件错误处理 - 优先使用后端信息
 */
function handleFileError(code: number, backendMessage: string, userMessage: string, errors?: ValidationError[]) {
  // 优先使用后端返回的具体错误信息
  let finalMessage = backendMessage
  
  // 如果后端没有具体信息，才使用默认的用户友好提示
  if (!backendMessage || backendMessage === '文件错误') {
    switch (code) {
      case ERROR_CODES.FILE_TOO_LARGE:
        finalMessage = '文件过大，请选择小于10MB的文件'
        break
      case ERROR_CODES.FILE_TYPE_NOT_SUPPORTED:
        finalMessage = '不支持该文件类型，请选择文档、图片或视频文件'
        break
      default:
        finalMessage = userMessage
    }
  }
  
  console.log(`[文件错误] 显示错误: ${code}, 最终消息: ${finalMessage}`)
  errorHandler.handleError(new Error(finalMessage), 'BUSINESS_ERROR')
}

/**
 * 🔧 修复：通用错误处理 - 优先使用后端信息
 */
function handleGeneralError(code: number, backendMessage: string, userMessage: string, errors?: ValidationError[]) {
  if (code === ERROR_CODES.VALIDATION_ERROR && errors && errors.length > 0) {
    // 表单验证错误，触发专门的验证错误事件
    window.dispatchEvent(new CustomEvent('app:validation-error', {
      detail: { message: backendMessage, errors }
    }))
    return
  }
  
  console.log(`[通用错误] 显示错误: ${code}, 后端消息: ${backendMessage}`)
  errorHandler.handleError(new Error(backendMessage), 'VALIDATION_ERROR')
}

/**
 * 🔧 修复：授权错误处理 - 使用后端原始消息
 */
function handleAuthorizationError(code: number, backendMessage: string, userMessage: string) {
  // 直接使用后端返回的错误信息
  console.log(`[授权错误] 显示错误: ${code}, 后端消息: ${backendMessage}`)
  errorHandler.handleError(new Error(backendMessage + '，请联系系统管理员'), 'PERMISSION_DENIED')
}

/**
 * 🔧 修复：系统错误处理 - 使用后端原始消息
 */
function handleSystemError(code: number, backendMessage: string, userMessage: string) {
  // 系统错误可能需要重试，使用后端原始消息
  console.log(`[系统错误] 显示错误: ${code}, 后端消息: ${backendMessage}`)
  const error = new Error(backendMessage)
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
