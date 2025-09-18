import axios, { AxiosResponse, AxiosError } from 'axios'
import { envConfig } from '@/config/env.config'
import type { ApiResponse } from '@/types'

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
    const token = localStorage.getItem('token')
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
      throw new Error(data.message || '请求失败')
    }
    
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 清除token
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          
          // 只有在非登录页面时才跳转到登录页
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          throw new Error('没有权限访问')
        case 404:
          throw new Error('请求的资源不存在')
        case 500:
          throw new Error('服务器内部错误')
        default:
          throw new Error(data?.message || `请求失败 (${status})`)
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
