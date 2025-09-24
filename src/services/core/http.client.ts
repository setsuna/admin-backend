/**
 * 统一HTTP客户端
 * 基于axios封装，提供统一的请求/响应处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getConfig } from '@/config'
import { ApiResponse } from '@/services/types/api.types'
import { requestInterceptor, responseInterceptor, errorInterceptor } from './interceptors'

export class HttpClient {
  private instance: AxiosInstance

  constructor() {
    const config = getConfig()
    this.instance = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      requestInterceptor,
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      responseInterceptor,
      errorInterceptor
    )
  }

  // GET请求
  async get<T = any>(
    url: string, 
    params?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, { 
      params, 
      ...config 
    })
    return response.data
  }

  // POST请求
  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data, config)
    return response.data
  }

  // PUT请求
  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data, config)
    return response.data
  }

  // PATCH请求
  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data, config)
    return response.data
  }

  // DELETE请求
  async delete<T = any>(
    url: string, 
    params?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url, { 
      params, 
      ...config 
    })
    return response.data
  }

  // 文件上传
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig & {
      onUploadProgress?: (progressEvent: any) => void
    }
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
    return response.data
  }

  // 文件下载
  async download(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const response = await this.instance.get(url, {
      params,
      responseType: 'blob',
      ...config
    })
    return response.data
  }

  // 获取原始axios实例（高级用法）
  getInstance(): AxiosInstance {
    return this.instance
  }

  // 创建新的客户端实例（用于特殊配置）
  static create(config?: AxiosRequestConfig): HttpClient {
    const client = new HttpClient()
    if (config) {
      Object.assign(client.instance.defaults, config)
    }
    return client
  }
}

// 创建默认实例
export const httpClient = new HttpClient()

// 导出类型
export type { AxiosRequestConfig, AxiosResponse }
