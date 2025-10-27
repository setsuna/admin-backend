import { useUI } from '@/store'
import type { ValidationError } from '@/types/api/response.types'
import { ERROR_CODES, getErrorMessage, isRetryableError, needsAutoLogin } from '@/config'

/**
 * 通知管理Hook (重构后支持新错误码系统)
 * 提供通知的添加、移除和清理功能，以及专门的错误处理方法
 */
export function useNotifications() {
  const { 
    notifications, 
    addNotification, 
    removeNotification, 
    clearNotifications 
  } = useUI()
  
  // 便捷方法
  interface NotificationOptions {
    duration?: number
    actions?: Array<{
      label: string
      action: () => void
      type?: 'primary' | 'secondary'
    }>
    persistent?: boolean
  }
  
  const showSuccess = (title: string, message?: string, options?: NotificationOptions) => {
    addNotification({ type: 'success', title, message: message || '', ...options })
  }
  
  const showError = (title: string, message?: string, options?: NotificationOptions) => {
    addNotification({ type: 'error', title, message: message || '', ...options })
  }
  
  const showWarning = (title: string, message?: string, options?: NotificationOptions) => {
    addNotification({ type: 'warning', title, message: message || '', ...options })
  }
  
  const showInfo = (title: string, message?: string, options?: NotificationOptions) => {
    addNotification({ type: 'info', title, message: message || '', ...options })
  }
  
  // 🆕 API错误专用通知方法
  const showApiError = (code: number, message?: string, errors?: ValidationError[]) => {
    const errorMessage = getErrorMessage(code, message)
    
    console.log(`[通知系统] 显示API错误: 码=${code}, 消息=${errorMessage}`)
    
    switch (true) {
      // 认证错误 - 自动跳转登录，不显示通知
      case needsAutoLogin(code):
        console.log(`[通知系统] 自动跳转登录错误，不显示通知: ${code}`)
        break
        
      // 表单验证错误 - 特殊处理
      case code === ERROR_CODES.VALIDATION_ERROR:
        if (errors && errors.length > 0) {
          showValidationErrors(errors)
        } else {
          showError('数据验证失败', errorMessage)
        }
        break
        
      // 权限不足
      case code === ERROR_CODES.PERMISSION_DENIED:
        showWarning('权限不足', '您没有权限执行此操作，请联系管理员')
        break
        
      // 文件相关错误
      case code === ERROR_CODES.FILE_TOO_LARGE:
        showError('文件过大', '请选择小于10MB的文件')
        break
        
      case code === ERROR_CODES.FILE_TYPE_NOT_SUPPORTED:
        showError('文件类型不支持', '请选择文档、图片或视频格式的文件')
        break
        
      // 授权相关错误
      case code === ERROR_CODES.AUTHORIZATION_CODE_INVALID ||
           code === ERROR_CODES.AUTHORIZATION_CODE_EXPIRED ||
           code === ERROR_CODES.AUTHORIZATION_CODE_NOT_EXIST:
        showError('系统授权异常', errorMessage + '，请联系系统管理员')
        break
        
      // 系统错误 - 提供重试建议
      case isRetryableError(code):
        showError('系统繁忙', errorMessage + '，请稍后重试', {
          actions: [{
            label: '重试',
            action: () => window.location.reload()
          }]
        })
        break
        
      // 其他业务错误
      default:
        showError('操作失败', errorMessage)
    }
  }
  
  // 🆕 表单验证错误显示
  const showValidationErrors = (errors: ValidationError[]) => {
    console.log(`[通知系统] 显示表单验证错误:`, errors)
    
    // 触发全局验证错误事件，让表单组件处理
    window.dispatchEvent(new CustomEvent('app:validation-error', {
      detail: { errors }
    }))
    
    // 同时显示汇总通知
    const errorCount = errors.length
    showError(
      '表单验证失败',
      `发现 ${errorCount} 个字段错误，请检查并修正后重试`
    )
  }
  
  // 🆕 网络错误显示
  const showNetworkError = (message?: string) => {
    showError(
      '网络连接失败',
      message || '请检查网络连接后重试',
      {
        duration: 0, // 不自动消失
        actions: [{
          label: '重试',
          action: () => window.location.reload()
        }]
      }
    )
  }
  
  // 🆕 系统维护通知
  const showMaintenanceNotice = (message?: string) => {
    showInfo(
      '系统维护中',
      message || '系统正在维护升级，请稍后访问',
      {
        duration: 0 // 不自动消失
      }
    )
  }
  
  // 🆕 权限提升建议
  const showPermissionGuide = (permission: string) => {
    showWarning(
      '需要更高权限',
      `此操作需要 ${permission} 权限，请联系管理员申请`,
      {
        actions: [{
          label: '联系管理员',
          action: () => {
            // 可以打开客服对话或发送邮件
            console.log('打开权限申请流程')
          }
        }]
      }
    )
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // 基础便捷方法
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // 🆕 新增专用方法
    showApiError,
    showValidationErrors,
    showNetworkError,
    showMaintenanceNotice,
    showPermissionGuide,
  }
}
