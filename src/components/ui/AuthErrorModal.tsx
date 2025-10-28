import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { SimpleQRCode } from './QRCode'
import { useGlobalStore } from '@/store'
import { licenseApi } from '@/services'
import { useNotifications } from '@/hooks/useNotifications'

export const AuthErrorModal: React.FC = () => {
  const queryClient = useQueryClient()
  const { authError, hideAuthError } = useGlobalStore()
  const { showSuccess, showApiError, showError } = useNotifications()
  
  // 8 组授权码，每组 5 个字符
  const [licenseParts, setLicenseParts] = useState<string[]>(Array(8).fill(''))
  const [validationError, setValidationError] = useState('')
  
  // 为每个输入框创建 ref
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 查询授权状态（仅在 info 模式下）
  const { data: licenseStatus } = useQuery({
    queryKey: ['license', 'status'],
    queryFn: () => licenseApi.getStatus(),
    enabled: authError.visible && authError.data?.mode === 'info',
    retry: false,
  })

  // 查询申请码（用于显示二维码）
  const { data: applicationCode } = useQuery({
    queryKey: ['license', 'application-code'],
    queryFn: () => licenseApi.getApplicationCode(),
    enabled: authError.visible,
    retry: false,
  })

  // 计算剩余天数
  const remainingDays = useMemo(() => {
    if (!licenseStatus?.status?.expire_date) return null
    
    try {
      const expireDate = new Date(licenseStatus.status.expire_date)
      const now = new Date()
      const diffTime = expireDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    } catch (error) {
      console.error('计算剩余天数失败:', error)
      return null
    }
  }, [licenseStatus?.status?.expire_date])

  // 合并授权码
  const licenseKey = useMemo(() => {
    return licenseParts.join('-')
  }, [licenseParts])

  // 导入授权码 mutation
  const importMutation = useMutation({
    mutationFn: (key: string) => licenseApi.import({ license_key: key }),
    onSuccess: (result) => {
      showSuccess('授权激活成功', result.message)
      setLicenseParts(Array(8).fill(''))
      setValidationError('')
      
      // 刷新授权状态
      queryClient.invalidateQueries({ queryKey: ['license', 'status'] })
      
      // 如果是错误模式，激活成功后关闭弹窗
      if (authError.data?.mode === 'error') {
        hideAuthError()
      }
    },
    onError: (error: any) => {
      // 使用规范的错误处理
      const errorCode = error.response?.data?.code
      const errorMessage = error.response?.data?.message
      
      if (errorCode) {
        showApiError(errorCode, errorMessage)
      } else {
        showError('激活失败', errorMessage || '授权码无效，请检查后重试')
      }
    },
  })

  // 处理单个输入框的变化
  const handlePartChange = (index: number, value: string) => {
    // 只允许字母和数字，转换为大写
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // 限制每组最多 5 个字符
    const limited = cleaned.slice(0, 5)
    
    // 更新状态
    const newParts = [...licenseParts]
    newParts[index] = limited
    setLicenseParts(newParts)
    setValidationError('')
    
    // 如果输入满 5 个字符，自动跳到下一个输入框
    if (limited.length === 5 && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // 处理键盘事件
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // 删除键：如果当前输入框为空，跳到上一个输入框
    if (e.key === 'Backspace' && licenseParts[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // 左箭头：跳到上一个输入框
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    
    // 右箭头：跳到下一个输入框
    if (e.key === 'ArrowRight' && index < 7) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    
    // 清理粘贴的文本（移除分隔符和空格）
    const cleaned = pastedText.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // 分割成 8 组，每组 5 个字符
    const newParts = Array(8).fill('')
    for (let i = 0; i < 8; i++) {
      newParts[i] = cleaned.slice(i * 5, (i + 1) * 5)
    }
    
    setLicenseParts(newParts)
    setValidationError('')
    
    // 聚焦到第一个未填满的输入框
    const firstEmptyIndex = newParts.findIndex(part => part.length < 5)
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus()
    } else {
      inputRefs.current[7]?.focus()
    }
  }

  // 验证授权码
  const validateLicenseKey = (): boolean => {
    // 检查是否所有组都填写完整
    const allFilled = licenseParts.every(part => part.length === 5)
    
    if (!allFilled) {
      setValidationError('请填写完整的授权码（8组，每组5个字符）')
      return false
    }
    
    return true
  }

  // 激活/更新授权
  const handleActivate = () => {
    if (!validateLicenseKey()) {
      return
    }

    importMutation.mutate(licenseKey)
  }

  // 处理弹窗关闭
  const handleClose = () => {
    if (authError.data?.allowClose !== false) {
      hideAuthError()
      setLicenseParts(Array(8).fill(''))
      setValidationError('')
    }
  }

  if (!authError.visible || !authError.data) {
    return null
  }

  const { data } = authError
  const isInfoMode = data.mode === 'info'
  const isLoading = importMutation.isPending
  
  // 判断授权是否有效，用于决定按钮文本
  const isLicenseValid = licenseStatus?.status?.valid || false
  
  // 判断是否所有输入框都已填写
  const allFilled = licenseParts.every(part => part.length === 5)

  return (
    <Modal
      isOpen={authError.visible}
      onClose={handleClose}
      title={isInfoMode ? '授权信息管理' : '系统授权验证'}
      size="xl"
      closeOnOverlay={data.allowClose !== false}
      showCloseButton={data.allowClose !== false}
      className="max-w-6xl"
    >
      <div className="p-6 space-y-6">
        {/* 错误消息或状态信息 */}
        <div className={`p-4 rounded-lg ${
          isInfoMode 
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm ${
            isInfoMode 
              ? 'text-blue-800 dark:text-blue-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {data.message}
          </p>
        </div>

        {/* 当前授权状态（仅info模式） */}
        {isInfoMode && licenseStatus && licenseStatus.status && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">当前授权状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">授权状态:</span>
                  <span className={`text-sm font-medium ${
                    licenseStatus.status.valid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {licenseStatus.status.valid ? '有效' : '无效/过期'}
                  </span>
                </div>
                
                {licenseStatus.status.message && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">状态信息:</span>
                    <span className="text-sm">{licenseStatus.status.message}</span>
                  </div>
                )}
                
                {licenseStatus.status.expire_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">到期时间:</span>
                    <span className="text-sm">
                      {licenseStatus.status.expire_date}
                    </span>
                  </div>
                )}
                
                {remainingDays !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">剩余天数:</span>
                    <span className={`text-sm font-medium ${
                      remainingDays <= 7 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : remainingDays <= 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {remainingDays}天
                    </span>
                  </div>
                )}
                
                {licenseStatus.status.device_count !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">授权设备数:</span>
                    <span className="text-sm font-medium">
                      {licenseStatus.status.device_count}台
                    </span>
                  </div>
                )}
                
                {licenseStatus.status.license_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">授权类型:</span>
                    <span className="text-sm">{licenseStatus.status.license_type}</span>
                  </div>
                )}
                
                {licenseStatus.current_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">当前时间:</span>
                    <span className="text-sm">{licenseStatus.current_time}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 申请码信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">申请码</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicationCode ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      申请码:
                    </p>
                    <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded border break-all">
                      {applicationCode.application_code}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      申请码二维码:
                    </p>
                    <SimpleQRCode 
                      value={applicationCode.application_code}
                      size={180}
                      className="mx-auto"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      请扫描此二维码获取申请码
                    </p>
                  </div>

                  {applicationCode.hardware_info && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        硬件信息:
                      </p>
                      <p className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                        {applicationCode.hardware_info}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">加载申请码中...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 授权码输入 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">授权码</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  输入授权码:
                </label>
                
                {/* 授权码输入框组 */}
                <div className="grid grid-cols-4 gap-2">
                  {licenseParts.map((part, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={part}
                      onChange={(e) => handlePartChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      placeholder="XXXXX"
                      className="font-mono text-center text-sm tracking-wider"
                      maxLength={5}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  输入8组授权码，每组5个字符。支持粘贴完整授权码。
                </p>
              </div>

              {validationError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{validationError}</p>
                </div>
              )}

              <Button
                onClick={handleActivate}
                disabled={isLoading || !allFilled}
                className="w-full"
              >
                {isLoading 
                  ? (isLicenseValid ? '更新中...' : '激活中...') 
                  : (isLicenseValid ? '更新授权' : '激活授权')
                }
              </Button>

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• 授权码格式: 8组字符，每组5位</p>
                <p>• 只能包含字母和数字</p>
                <p>• 支持粘贴完整授权码到第一个输入框</p>
                <p>• 请联系管理员获取授权码</p>
                {isLicenseValid && (
                  <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                    • 更新授权码将替换当前授权
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {data.allowClose !== false && (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {isInfoMode ? '关闭' : '稍后处理'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
