import { useState, useEffect } from 'react'
import { Save, RefreshCw, Shield, Clock, Key, Lock, FileText, Monitor, AlertTriangle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { useGlobalDialog } from '@/components/ui/DialogProvider'
import { usePolicy } from '@/hooks/usePolicy'
import type { SecurityPolicy } from '@/types'

const PolicyConfigPage = () => {
  const { showConfirm } = useGlobalDialog()
  
  // 使用策略管理hook
  const {
    policy: originalPolicy,
    isLoading,
    error,
    updatePolicy,
    isUpdating,
    validateConfig,
    exportConfig,
    loadDefaultConfig,
    refreshData
  } = usePolicy()
  
  // 本地策略状态
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null)
  
  // 当原始策略加载后，同步到本地状态
  useEffect(() => {
    if (originalPolicy) {
      setPolicy(originalPolicy)
    }
  }, [originalPolicy])
  
  // 系统密级选项
  const systemSecurityLevelOptions = [
    { label: '秘密', value: 'confidential' },
    { label: '机密', value: 'secret' }
  ]
  
  // 敏感操作日志级别选项
  const loggingLevelOptions = [
    { label: '最小化', value: 'minimal' },
    { label: '标准', value: 'standard' },
    { label: '详细', value: 'detailed' }
  ]
  
  // 保存配置
  const handleSave = async () => {
    if (!policy) return
    
    const confirmed = await showConfirm({
      title: '保存策略配置',
      content: '确定要保存当前的策略配置吗？配置生效后将影响所有用户。',
      confirmText: '保存',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    // 先验证配置
    const isValid = await validateConfig(policy)
    if (!isValid) return
    
    updatePolicy(policy)
  }
  
  // 重置配置
  const handleReset = async () => {
    if (!originalPolicy) return
    
    const confirmed = await showConfirm({
      title: '重置配置',
      content: '确定要重置所有配置为上次保存的状态吗？',
      confirmText: '重置',
      cancelText: '取消'
    })
    
    if (confirmed) {
      setPolicy({ ...originalPolicy })
    }
  }
  
  // 加载默认配置
  const handleLoadDefault = async () => {
    const confirmed = await showConfirm({
      title: '加载默认配置',
      content: '确定要加载默认策略配置吗？当前未保存的更改将丢失。',
      confirmText: '加载',
      cancelText: '取消'
    })
    
    if (confirmed) {
      const defaultConfig = await loadDefaultConfig()
      if (defaultConfig) {
        setPolicy(defaultConfig)
      }
    }
  }
  
  // 更新策略配置
  const updatePolicyField = (path: string, value: any) => {
    if (!policy) return
    
    setPolicy(prev => {
      if (!prev) return prev
      
      const keys = path.split('.')
      const updated = { ...prev }
      let current: any = updated
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return updated
    })
  }
  
  // 检查是否有未保存的更改
  const hasUnsavedChanges = originalPolicy && policy && JSON.stringify(policy) !== JSON.stringify(originalPolicy)
  
  if (isLoading || !policy) {
    return <Loading />
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">加载失败</p>
          <Button onClick={refreshData}>重试</Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">策略配置</h1>
          <p className="text-sm text-gray-500 mt-1">配置系统安全策略和管理规则</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleLoadDefault}
            disabled={isUpdating}
          >
            <Settings className="w-4 h-4 mr-2" />
            默认配置
          </Button>
          
          <Button
            variant="outline"
            onClick={exportConfig}
          >
            导出配置
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges || isUpdating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重置
          </Button>
          
          <Button
            onClick={handleSave}
            loading={isUpdating}
            disabled={!hasUnsavedChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </div>
      </div>
      
      {/* 未保存更改提示 */}
      {hasUnsavedChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">您有未保存的配置更改</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 系统安全策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              系统安全策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">系统密级</label>
              <Select
                value={policy.systemSecurityLevel}
                onValueChange={(value) => updatePolicyField('systemSecurityLevel', value)}
                options={systemSecurityLevelOptions}
              />
              <p className="text-xs text-gray-500 mt-1">
                系统整体安全等级，只能向上调整，不可降级
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!policy.allowSecurityDowngrade}
                  onChange={(e) => updatePolicyField('allowSecurityDowngrade', !e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">禁止密级降级</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* 文件管理策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              文件管理策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">服务器文件存储周期 (天)</label>
              <Input
                type="number"
                value={policy.serverFileRetentionDays}
                onChange={(e) => updatePolicyField('serverFileRetentionDays', parseInt(e.target.value) || 90)}
                min="1"
                max="3650"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">客户端文件过期时间 (小时)</label>
              <Input
                type="number"
                value={policy.clientFileExpirationHours}
                onChange={(e) => updatePolicyField('clientFileExpirationHours', parseInt(e.target.value) || 24)}
                min="1"
                max="168"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">文件上传大小限制 (MB)</label>
              <Input
                type="number"
                value={policy.fileUploadMaxSize}
                onChange={(e) => updatePolicyField('fileUploadMaxSize', parseInt(e.target.value) || 100)}
                min="1"
                max="1024"
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.fileEncryptionEnabled}
                  onChange={(e) => updatePolicyField('fileEncryptionEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用文件加密存储</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* 密码策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              口令策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">最小长度</label>
                <Input
                  type="number"
                  value={policy.passwordPolicy.minLength}
                  onChange={(e) => updatePolicyField('passwordPolicy.minLength', parseInt(e.target.value) || 8)}
                  min="6"
                  max="32"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">更换周期 (天)</label>
                <Input
                  type="number"
                  value={policy.passwordPolicy.changeIntervalDays}
                  onChange={(e) => updatePolicyField('passwordPolicy.changeIntervalDays', parseInt(e.target.value) || 90)}
                  min="30"
                  max="365"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">最大错误次数</label>
                <Input
                  type="number"
                  value={policy.passwordPolicy.maxFailAttempts}
                  onChange={(e) => updatePolicyField('passwordPolicy.maxFailAttempts', parseInt(e.target.value) || 5)}
                  min="3"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">锁定时长 (分钟)</label>
                <Input
                  type="number"
                  value={policy.passwordPolicy.lockoutDurationMinutes}
                  onChange={(e) => updatePolicyField('passwordPolicy.lockoutDurationMinutes', parseInt(e.target.value) || 30)}
                  min="5"
                  max="1440"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">密码复杂度要求</label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={policy.passwordPolicy.requireUppercase}
                    onChange={(e) => updatePolicyField('passwordPolicy.requireUppercase', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">包含大写字母</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={policy.passwordPolicy.requireLowercase}
                    onChange={(e) => updatePolicyField('passwordPolicy.requireLowercase', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">包含小写字母</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={policy.passwordPolicy.requireNumbers}
                    onChange={(e) => updatePolicyField('passwordPolicy.requireNumbers', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">包含数字</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={policy.passwordPolicy.requireSpecialChars}
                    onChange={(e) => updatePolicyField('passwordPolicy.requireSpecialChars', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">包含特殊字符</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 会话管理策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              会话管理策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">会话超时时间 (分钟)</label>
              <Input
                type="number"
                value={policy.sessionTimeoutMinutes}
                onChange={(e) => updatePolicyField('sessionTimeoutMinutes', parseInt(e.target.value) || 480)}
                min="5"
                max="1440"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">空闲锁定时间 (分钟)</label>
              <Input
                type="number"
                value={policy.idleLockTimeoutMinutes}
                onChange={(e) => updatePolicyField('idleLockTimeoutMinutes', parseInt(e.target.value) || 30)}
                min="5"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">最大并发会话数</label>
              <Input
                type="number"
                value={policy.maxConcurrentSessions}
                onChange={(e) => updatePolicyField('maxConcurrentSessions', parseInt(e.target.value) || 3)}
                min="1"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.rememberPasswordEnabled}
                  onChange={(e) => updatePolicyField('rememberPasswordEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">允许记住密码</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.singleSignOnEnabled}
                  onChange={(e) => updatePolicyField('singleSignOnEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用单点登录</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* 访问控制策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              访问控制策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={policy.allowedLoginHours.enabled}
                  onChange={(e) => updatePolicyField('allowedLoginHours.enabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">限制登录时间段</span>
              </label>
              
              {policy.allowedLoginHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                    <Input
                      type="time"
                      value={policy.allowedLoginHours.start}
                      onChange={(e) => updatePolicyField('allowedLoginHours.start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                    <Input
                      type="time"
                      value={policy.allowedLoginHours.end}
                      onChange={(e) => updatePolicyField('allowedLoginHours.end', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.ipWhitelistEnabled}
                  onChange={(e) => updatePolicyField('ipWhitelistEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用IP白名单</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.deviceBindingEnabled}
                  onChange={(e) => updatePolicyField('deviceBindingEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用设备绑定</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.geoLocationRestricted}
                  onChange={(e) => updatePolicyField('geoLocationRestricted', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用地理位置限制</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* 审计策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              审计策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">审计日志保留时间 (天)</label>
              <Input
                type="number"
                value={policy.auditLogRetentionDays}
                onChange={(e) => updatePolicyField('auditLogRetentionDays', parseInt(e.target.value) || 365)}
                min="90"
                max="2555"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">敏感操作记录级别</label>
              <Select
                value={policy.sensitiveOperationLogging}
                onValueChange={(value) => updatePolicyField('sensitiveOperationLogging', value)}
                options={loggingLevelOptions}
              />
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.auditLogExportEnabled}
                  onChange={(e) => updatePolicyField('auditLogExportEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">允许审计日志导出</span>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* 系统维护策略 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              系统维护策略
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={policy.maintenanceWindow.enabled}
                  onChange={(e) => updatePolicyField('maintenanceWindow.enabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">设置维护时间窗口</span>
              </label>
              
              {policy.maintenanceWindow.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                    <Input
                      type="time"
                      value={policy.maintenanceWindow.start}
                      onChange={(e) => updatePolicyField('maintenanceWindow.start', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                    <Input
                      type="time"
                      value={policy.maintenanceWindow.end}
                      onChange={(e) => updatePolicyField('maintenanceWindow.end', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={policy.autoBackupEnabled}
                  onChange={(e) => updatePolicyField('autoBackupEnabled', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">启用自动备份</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">备份保留时间 (天)</label>
              <Input
                type="number"
                value={policy.backupRetentionDays}
                onChange={(e) => updatePolicyField('backupRetentionDays', parseInt(e.target.value) || 30)}
                min="7"
                max="365"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PolicyConfigPage