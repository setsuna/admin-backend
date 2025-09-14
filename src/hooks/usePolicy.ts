import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { policyService } from '@/services/policy'
import { useGlobalStore } from '@/store'
import type { SecurityPolicy } from '@/types'

export interface UsePolicyOptions {
  enableAutoRefresh?: boolean
  autoRefreshInterval?: number
}

export const usePolicy = (options: UsePolicyOptions = {}) => {
  const { 
    enableAutoRefresh = false,
    autoRefreshInterval = 60000
  } = options
  
  const { addNotification } = useGlobalStore()
  const queryClient = useQueryClient()
  
  // 状态管理
  const [isValidating, setIsValidating] = useState(false)
  
  // 查询当前策略配置
  const policyQuery = useQuery({
    queryKey: ['policy'],
    queryFn: () => policyService.getPolicyConfig(),
    refetchInterval: enableAutoRefresh ? autoRefreshInterval : false
  })
  
  // 查询策略历史
  const policyHistoryQuery = useQuery({
    queryKey: ['policyHistory'],
    queryFn: () => policyService.getPolicyHistory()
  })
  
  // 查询默认配置
  const defaultPolicyQuery = useQuery({
    queryKey: ['defaultPolicy'],
    queryFn: () => policyService.getDefaultPolicyConfig(),
    enabled: false // 手动触发
  })
  
  // 刷新相关查询
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['policy'] })
    queryClient.invalidateQueries({ queryKey: ['policyHistory'] })
  }
  
  // 更新策略配置
  const updateMutation = useMutation({
    mutationFn: (config: SecurityPolicy) => policyService.updatePolicyConfig(config),
    onSuccess: () => {
      addNotification({ 
        type: 'success', 
        title: '配置保存成功', 
        message: '策略配置已成功保存并生效' 
      })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '配置保存失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 验证策略配置
  const validateMutation = useMutation({
    mutationFn: (config: SecurityPolicy) => policyService.validatePolicyConfig(config),
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '配置验证失败', 
        message: error.message || '请检查配置参数' 
      })
    }
  })
  
  // 恢复版本
  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => policyService.restorePolicyVersion(versionId),
    onSuccess: () => {
      addNotification({ 
        type: 'success', 
        title: '版本恢复成功', 
        message: '已成功恢复到指定版本' 
      })
      invalidateQueries()
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '版本恢复失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 导入配置
  const importMutation = useMutation({
    mutationFn: (file: File) => policyService.importPolicyConfig(file),
    onSuccess: (result) => {
      addNotification({ 
        type: 'success', 
        title: '配置导入成功', 
        message: '配置文件已成功解析，请检查后保存' 
      })
      return result.data
    },
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '配置导入失败', 
        message: error.message || '请检查文件格式' 
      })
    }
  })
  
  // 影响分析
  const impactAnalysisMutation = useMutation({
    mutationFn: (config: SecurityPolicy) => policyService.getPolicyImpactAnalysis(config),
    onError: (error: any) => {
      addNotification({ 
        type: 'error', 
        title: '影响分析失败', 
        message: error.message || '请稍后重试' 
      })
    }
  })
  
  // 工具函数
  const refreshData = () => {
    policyQuery.refetch()
  }
  
  const loadDefaultConfig = async () => {
    const result = await defaultPolicyQuery.refetch()
    if (result.data?.data) {
      addNotification({ 
        type: 'info', 
        title: '默认配置已加载', 
        message: '已加载默认策略配置，请检查后保存' 
      })
    }
    return result.data?.data
  }
  
  const validateConfig = async (config: SecurityPolicy) => {
    setIsValidating(true)
    try {
      const result = await validateMutation.mutateAsync(config)
      const validation = result.data
      
      if (validation.errors.length > 0) {
        validation.errors.forEach(error => {
          addNotification({ 
            type: 'error', 
            title: '配置验证错误', 
            message: error 
          })
        })
        return false
      }
      
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          addNotification({ 
            type: 'warning', 
            title: '配置建议', 
            message: warning 
          })
        })
      }
      
      return true
    } finally {
      setIsValidating(false)
    }
  }
  
  const exportConfig = async () => {
    try {
      const blob = await policyService.exportPolicyConfig()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `policy-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      addNotification({ 
        type: 'success', 
        title: '导出成功', 
        message: '策略配置已成功导出' 
      })
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        title: '导出失败', 
        message: error.message || '请稍后重试' 
      })
    }
  }
  
  const getImpactAnalysis = async (config: SecurityPolicy) => {
    const result = await impactAnalysisMutation.mutateAsync(config)
    return result.data
  }
  
  return {
    // 数据
    policy: policyQuery.data?.data,
    policyHistory: policyHistoryQuery.data?.data || [],
    defaultPolicy: defaultPolicyQuery.data?.data,
    
    // 状态
    isLoading: policyQuery.isLoading,
    error: policyQuery.error,
    isValidating,
    
    // 操作
    updatePolicy: updateMutation.mutate,
    restoreVersion: restoreMutation.mutate,
    importConfig: importMutation.mutate,
    validateConfig,
    exportConfig,
    getImpactAnalysis,
    loadDefaultConfig,
    
    // 操作状态
    isUpdating: updateMutation.isPending,
    isRestoring: restoreMutation.isPending,
    isImporting: importMutation.isPending,
    isAnalyzing: impactAnalysisMutation.isPending,
    
    // 导入结果
    importedConfig: importMutation.data?.data,
    
    // 工具函数
    refreshData,
    invalidateQueries
  }
}

export default usePolicy