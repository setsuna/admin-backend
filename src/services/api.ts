/**
 * API客户端兼容层
 * 为旧代码提供兼容性支持，逐步迁移到新的httpClient
 * @deprecated 使用 httpClient 替代
 */

import { httpClient } from './core/http.client'

/**
 * @deprecated 请使用 httpClient 替代
 */
export const api = httpClient.instance

/**
 * @deprecated 请使用 httpClient 替代
 */
export const apiClient = {
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  put: httpClient.put.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),
  patch: httpClient.patch.bind(httpClient)
}

// 向后兼容性导出
export default api
