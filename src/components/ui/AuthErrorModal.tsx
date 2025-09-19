import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { SimpleQRCode } from './QRCode'
import { useGlobalStore } from '@/store'
import { getCurrentAuthInfo, saveLicenseInfo, formatLicenseKey } from '@/utils/auth'

export const AuthErrorModal: React.FC = () => {
  const { authError, hideAuthError } = useGlobalStore()
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authInfo, setAuthInfo] = useState<any>(null)

  // 获取授权信息（仅在info模式下）
  useEffect(() => {
    if (authError.visible && authError.data?.mode === 'info') {
      setAuthInfo(getCurrentAuthInfo())
    }
  }, [authError.visible, authError.data?.mode])

  // 处理授权码输入
  const handleLicenseKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setError('')
  }

  // 激活授权
  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('请输入授权码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const success = saveLicenseInfo(licenseKey)
      if (success) {
        // 重新获取授权信息
        if (authError.data?.mode === 'info') {
          setAuthInfo(getCurrentAuthInfo())
        }
        setLicenseKey('')
        alert('授权激活成功！')
        
        // 如果是错误模式，激活成功后关闭弹窗
        if (authError.data?.mode === 'error') {
          hideAuthError()
        }
      } else {
        setError('授权码无效，请检查后重试')
      }
    } catch (err) {
      setError('激活失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理弹窗关闭
  const handleClose = () => {
    if (authError.data?.allowClose !== false) {
      hideAuthError()
      setLicenseKey('')
      setError('')
    }
  }

  if (!authError.visible || !authError.data) {
    return null
  }

  const { data } = authError
  const isInfoMode = data.mode === 'info'

  return (
    <Modal
      isOpen={authError.visible}
      onClose={handleClose}
      title={isInfoMode ? '授权信息管理' : '系统授权验证'}
      size="xl"
      closeOnOverlay={data.allowClose !== false}
      showCloseButton={data.allowClose !== false}
      className="max-w-4xl"
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
        {isInfoMode && authInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">当前授权状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">授权状态:</span>
                <span className={`text-sm font-medium ${
                  authInfo.isValid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {authInfo.isValid ? '有效' : '无效/过期'}
                </span>
              </div>
              {authInfo.expireDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">到期时间:</span>
                  <span className="text-sm">{authInfo.expireDate}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">剩余天数:</span>
                <span className={`text-sm font-medium ${
                  authInfo.remainingDays <= 7 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {authInfo.remainingDays}天
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 设备指纹信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">设备指纹</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  设备指纹码:
                </p>
                <p className="font-mono text-lg bg-gray-100 dark:bg-gray-800 p-3 rounded border">
                  {data.deviceFingerprint}
                </p>
              </div>
              
              {data.deviceFingerprint && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    二维码:
                  </p>
                  <SimpleQRCode 
                    value={data.deviceFingerprint}
                    size={150}
                    className="mx-auto"
                  />
                </div>
              )}

              {data.hardwareSummary && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    硬件摘要:
                  </p>
                  <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {data.hardwareSummary}
                  </p>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输入授权码:
                </label>
                <Input
                  value={licenseKey}
                  onChange={handleLicenseKeyChange}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className="font-mono"
                  maxLength={29}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  请输入25位授权码，系统会自动添加分隔符
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <Button
                onClick={handleActivate}
                disabled={loading || !licenseKey.trim()}
                className="w-full"
              >
                {loading ? '激活中...' : '激活授权'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {data.allowClose !== false && (
            <Button
              variant="outline"
              onClick={handleClose}
            >
              {isInfoMode ? '关闭' : '稍后处理'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
