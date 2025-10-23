/**
 * TanStack Query 配置
 * 
 * 配置 React Query 的全局默认选项，包括缓存、重试、刷新等行为
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * 默认 Query 配置选项
 */
export const defaultQueryOptions = {
  queries: {
    // 数据保持新鲜的时间（5秒）
    // 在此时间内，数据被视为新鲜，不会重新请求
    staleTime: 5000,
    
    // 缓存保留时间（10分钟）
    // TanStack Query v5 使用 gcTime 替代 cacheTime
    gcTime: 10 * 60 * 1000,
    
    // 失败重试次数
    retry: 1,
    
    // 窗口聚焦时不自动刷新
    // 避免用户切换标签页时频繁请求
    refetchOnWindowFocus: false,
    
    // 网络重连时不自动刷新
    refetchOnReconnect: false,
  },
}

/**
 * Query Client 实例
 * 
 * 全局唯一的 QueryClient 实例，管理所有查询和缓存
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
})
