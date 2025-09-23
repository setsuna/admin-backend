/**
 * API客户端兼容层 - 独立实现
 * 为旧代码提供兼容性支持，完全独立，避免循环依赖
 * @deprecated 使用 httpClient 替代
 */

import axios, { AxiosInstance } from 'axios'

// 直接读取环境变量，避免导入配置文件
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000
const TOKEN_KEY = 'access_token'

// 创建独立的axios实例
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证token
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error)
      return Promise.reject(error)
    }
  )

  return instance
}

// 创建API实例
const apiInstance = createApiInstance()

/**
 * @deprecated 请使用 httpClient 替代
 */
export const api = apiInstance

/**
 * @deprecated 请使用 httpClient 替代
 */
export const apiClient = {
  get: <T = any>(url: string, params?: any) => 
    apiInstance.get<T>(url, { params }).then(res => res.data),
    
  post: <T = any>(url: string, data?: any) => 
    apiInstance.post<T>(url, data).then(res => res.data),
    
  put: <T = any>(url: string, data?: any) => 
    apiInstance.put<T>(url, data).then(res => res.data),
    
  delete: <T = any>(url: string) => 
    apiInstance.delete<T>(url).then(res => res.data),
    
  patch: <T = any>(url: string, data?: any) => 
    apiInstance.patch<T>(url, data).then(res => res.data)
}

// 向后兼容性导出
export default api
