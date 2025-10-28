import React, { useState, useMemo } from 'react'
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
  
  const [licenseKey, setLicenseKey] = useState('')
  const [validationError, setValidationError] = useState('')

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

  // 导入授权码 mutation
  const importMutation = useMutation({
    mutationFn: (key: string) => licenseApi.import({ license_key: key }),
    onSuccess: (result) => {
      showSuccess('授权激活成功', result.message)
      setLicenseKey('')
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

  // 格式化授权码输入（自动添加分隔符）
  const formatLicenseKey = (value: string): string => {
    // 移除所有非字母数字字符
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    
    // 每5个字符添加一个分隔符，最多40个字符（8组*5）
    const formatted = cleaned
      .slice(0, 40)
      .match(/.{1,5}/g)
      ?.join('-') || ''
    
    return formatted
  }

  // 处理授权码输入
  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setValidationError('')
  }

  // 验证授权码格式
  const validateLicenseKey = (key: string): boolean => {
    // 移除分隔符
    const cleaned = key.replace(/-/g, '')
    
    // 检查长度（应该是40个字符，8组*5）
    if (cleaned.length !== 40) {
      setValidationError('授权码应为40个字符（8组，每组5个字符）')
      return false
    }
    
    // 检查是否只包含字母和数字
    if (!/^[A-Za-z0-9]+$/.test(cleaned)) {
      setValidationError('授权码只能包含字母和数字')
      return false
    }
    
    return true
  }

  // 激活/更新授权
  const handleActivate = () => {
    if (!licenseKey.trim()) {
      setValidationError('请输入授权码')
      return
    }

    if (!validateLicenseKey(licenseKey)) {
      return
    }

    importMutation.mutate(licenseKey)
  }

  // 处理弹窗关闭
  const handleClose = () => {
    if (authError.data?.allowClose !== false) {
      hideAuthError()
      setLicenseKey('')
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
      <div className="p-4 space-y-4">
        {/* 错误消息或状态信息 */}
        <div className={`p-4 rounded-lg border ${
          isInfoMode 
            ? 'bg-info/10 border-info/20'
            : 'bg-error/10 border-error/20'
        }`}>
          <p className={`text-sm ${
            isInfoMode 
              ? 'text-info' 
              : 'text-error'
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
                  <span className="text-sm text-text-secondary">授权状态:</span>
                  <span className={`text-sm font-medium ${
                    licenseStatus.status.valid 
                      ? 'text-success' 
                      : 'text-error'
                  }`}>
                    {licenseStatus.status.valid ? '有效' : '无效/过期'}
                  </span>
                </div>
                
                {licenseStatus.status.message && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">状态信息:</span>
                    <span className="text-sm text-text-regular">{licenseStatus.status.message}</span>
                  </div>
                )}
                
                {licenseStatus.status.expire_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">到期时间:</span>
                    <span className="text-sm text-text-regular">
                      {licenseStatus.status.expire_date}
                    </span>
                  </div>
                )}
                
                {remainingDays !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">剩余天数:</span>
                    <span className={`text-sm font-medium ${
                      remainingDays <= 7 
                        ? 'text-warning' 
                        : remainingDays <= 0
                        ? 'text-error'
                        : 'text-text-primary'
                    }`}>
                      {remainingDays}天
                    </span>
                  </div>
                )}
                
                {licenseStatus.status.device_count !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">授权设备数:</span>
                    <span className="text-sm font-medium text-text-primary">
                      {licenseStatus.status.device_count}台
                    </span>
                  </div>
                )}
                
                {licenseStatus.status.license_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">授权类型:</span>
                    <span className="text-sm text-text-regular">{licenseStatus.status.license_type}</span>
                  </div>
                )}
                
                {licenseStatus.current_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">当前时间:</span>
                    <span className="text-sm text-text-regular">{licenseStatus.current_time}</span>
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
                    <p className="text-sm text-text-secondary mb-2">
                      申请码:
                    </p>
                    <p className="font-mono text-sm bg-bg-container p-3 rounded border break-all">
                      {applicationCode.application_code}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-text-secondary mb-2">
                      申请码二维码:
                    </p>
                    <SimpleQRCode 
                      value={applicationCode.application_code}
                      size={180}
                      className="mx-auto"
                    />
                    <p className="text-xs text-text-tertiary mt-2">
                      请扫描此二维码获取申请码
                    </p>
                  </div>

                  {applicationCode.hardware_info && (
                    <div>
                      <p className="text-sm text-text-secondary mb-2">
                        硬件信息:
                      </p>
                      <p className="text-xs bg-bg-container p-2 rounded break-all">
                        {applicationCode.hardware_info}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-text-tertiary">加载申请码中...</p>
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
                <label className="block text-sm font-medium text-text-primary mb-2">
                  输入授权码:
                </label>
                <Input
                  value={licenseKey}
                  onChange={handleLicenseKeyChange}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  请输入40位授权码（8组，每组5个字符），系统会自动添加分隔符
                </p>
              </div>

              {validationError && (
                <div className="bg-error/10 border border-error/20 rounded p-3">
                  <p className="text-sm text-error">{validationError}</p>
                </div>
              )}

              <Button
                onClick={handleActivate}
                disabled={isLoading || !licenseKey.trim()}
                className="w-full"
              >
                {isLoading 
                  ? (isLicenseValid ? '更新中...' : '激活中...') 
                  : (isLicenseValid ? '更新授权' : '激活授权')
                }
              </Button>

              <div className="text-xs text-text-tertiary space-y-1">
                <p>• 授权码格式: 8组字符，每组5位</p>
                <p>• 只能包含字母和数字</p>
                <p>• 请联系管理员获取授权码</p>
                {isLicenseValid && (
                  <p className="text-warning font-medium">
                    • 更新授权码将替换当前授权
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
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
