import axios, { AxiosResponse, AxiosError } from 'axios'
import { envConfig } from '@/config/env.config'
import type { ApiResponse, ApiErrorResponse } from '@/types'
import { extractErrorInfo, createAuthErrorDialogData } from '@/utils/errorHandler'
import { useGlobalStore } from '@/store'

// 创建axios实例
const api = axios.create({
  baseURL: envConfig.API_BASE_URL,
  timeout: envConfig.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 统一处理业务错误
    if (data.code !== 200) {
      const errorInfo = extractErrorInfo(data)
      
      // 如果是授权错误，显示授权弹窗
      if (errorInfo.isAuthError && errorInfo.authData) {
        const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
        useGlobalStore.getState().showAuthError(dialogData)
      }
      
      throw new Error(errorInfo.message)
    }
    
    return response
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 清除token
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          
          // 提取错误信息
          if (data) {
            const errorInfo = extractErrorInfo(data)
            if (errorInfo.isAuthError && errorInfo.authData) {
              const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
              useGlobalStore.getState().showAuthError(dialogData)
            }
            throw new Error(errorInfo.message)
          }
          
          // 只有在非登录页面时才跳转到登录页
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
            throw new Error('登录状态已过期，请重新登录')
          }
          
          throw new Error('用户名或密码错误')
        case 403:
          // 403错误也需要检查是否包含授权相关信息
          if (data) {
            const errorInfo = extractErrorInfo(data)
            if (errorInfo.isAuthError && errorInfo.authData) {
              const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
              useGlobalStore.getState().showAuthError(dialogData)
            }
            throw new Error(errorInfo.message)
          }
          throw new Error('没有权限访问')
        case 404:
          if (data) {
            const errorInfo = extractErrorInfo(data)
            if (errorInfo.isAuthError && errorInfo.authData) {
              const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
              useGlobalStore.getState().showAuthError(dialogData)
              throw new Error(errorInfo.message)
            }
            throw new Error(errorInfo.message)
          }
          throw new Error('请求的资源不存在')
        case 500:
          if (data) {
            const errorInfo = extractErrorInfo(data)
            if (errorInfo.isAuthError && errorInfo.authData) {
              const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
              useGlobalStore.getState().showAuthError(dialogData)
              throw new Error(errorInfo.message)
            }
            throw new Error(errorInfo.message)
          }
          throw new Error('服务器内部错误')
        default:
          // 对于其他HTTP错误，也检查是否包含授权相关信息
          if (data) {
            const errorInfo = extractErrorInfo(data)
            if (errorInfo.isAuthError && errorInfo.authData) {
              const dialogData = createAuthErrorDialogData(errorInfo, errorInfo.authData)
              useGlobalStore.getState().showAuthError(dialogData)
            }
            throw new Error(errorInfo.message)
          }
          throw new Error(`请求失败 (${status})`)
      }
    } else if (error.request) {
      throw new Error('网络连接失败')
    } else {
      throw new Error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default api
export { api }

// 通用API方法
export const apiClient = {
  get: <T = any>(url: string, params?: any): Promise<ApiResponse<T>> =>
    api.get(url, { params }).then(res => res.data),
    
  post: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.post(url, data).then(res => res.data),
    
  put: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.put(url, data).then(res => res.data),
    
  delete: <T = any>(url: string, params?: any): Promise<ApiResponse<T>> =>
    api.delete(url, { params }).then(res => res.data),
    
  patch: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.patch(url, data).then(res => res.data),
}
