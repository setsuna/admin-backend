import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/store'
import { auth } from '@/services/core/auth.service'
import { isDevelopment, ERROR_CODES } from '@/config'
import { useNotifications } from '@/hooks/useNotifications'
import { encryptPassword } from '@/utils/crypto'
import { ForceChangePasswordDialog } from '@/components/business/auth/ForceChangePasswordDialog'
import { policyService } from '@/services/policy'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { AlertTriangle } from 'lucide-react'
import type { AlertItem } from '@/types'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser, setPermissions } = useAuth()
  const { showSuccess } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // 🆕 密码过期对话框状态
  const [passwordExpiredDialog, setPasswordExpiredDialog] = useState({
    open: false,
    userId: '',
    username: ''
  })
  
  // 🆕 告警弹窗状态
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    alerts: AlertItem[]
  }>({
    open: false,
    alerts: []
  })
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // 清除登录错误
    if (errors.login) {
      setErrors(prev => ({ ...prev, login: '' }))
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setErrors({}) // 清除之前的错误
    
    try {
      console.log('Login attempt:', { 
        username: formData.username
      })
      
      const result = await auth.login({
        username: formData.username,
        password: encryptPassword(formData.password)
      })
      
      console.log('Login success:', result)
      
      // 完整更新 store
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const fullUser = JSON.parse(userStr)
        setUser(fullUser)
        setPermissions(fullUser.permissions || [])
      } else {
        setUser(result.user as any)
        setPermissions([])
      }
      
      showSuccess('登录成功', `欢迎回来，${result.user.username}!`)
      
      // 🆕 登录成功后检查告警
      try {
        const alertRes = await policyService.checkAlerts()
        if (alertRes.hasAlert && alertRes.alerts.length > 0) {
          // 有告警，显示弹窗
          setAlertDialog({
            open: true,
            alerts: alertRes.alerts
          })
          return // 等待用户关闭弹窗后再跳转
        }
      } catch (e) {
        // 告警检查失败不影响登录流程
        console.warn('检查告警失败:', e)
      }
      
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      
      const code = error?.code
      const data = error?.data?.data || error?.data || {}
      const message = error?.message
      
      // 🆕 根据错误码进行本地处理
      switch (code) {
        case ERROR_CODES.LOGIN_FAILED: {
          // 2006 登录失败（密码错误，有剩余次数）
          const remainingAttempts = data.remaining_attempts
          if (remainingAttempts !== undefined) {
            setErrors({ login: `用户名或密码错误，还剩 ${remainingAttempts} 次机会` })
          } else {
            setErrors({ login: message || '用户名或密码错误' })
          }
          break
        }
        
        case ERROR_CODES.USER_NOT_FOUND: {
          // 2007 用户不存在
          setErrors({ login: message || '用户不存在' })
          break
        }
        
        case ERROR_CODES.ACCOUNT_LOCKED: {
          // 2010 账户已锁定
          const remainingSeconds = data.remaining_seconds
          if (remainingSeconds !== undefined) {
            setErrors({ login: `账户已锁定，请 ${remainingSeconds} 秒后重试` })
          } else {
            setErrors({ login: message || '账户已锁定，请稍后重试' })
          }
          break
        }
        
        case ERROR_CODES.PASSWORD_EXPIRED: {
          // 2011 密码过期 - 打开修改密码对话框
          setPasswordExpiredDialog({
            open: true,
            userId: data.user_id || '',
            username: data.username || formData.username
          })
          break
        }
        
        case ERROR_CODES.VALIDATION_ERROR: {
          // 1004 表单验证错误
          const validationErrors = error?.errors
          if (validationErrors && Array.isArray(validationErrors)) {
            const formErrors: Record<string, string> = {}
            validationErrors.forEach((err: any) => {
              if (err.field) {
                formErrors[err.field] = err.message
              }
            })
            setErrors(formErrors)
          } else {
            setErrors({ login: message || '输入数据验证失败' })
          }
          break
        }
        
        default:
          // 其他错误（网络错误等）- 已在全局拦截器中处理，这里不重复显示
          break
      }
    } finally {
      setLoading(false)
    }
  }
  
  // 🆕 密码修改成功回调
  const handlePasswordChangeSuccess = () => {
    setPasswordExpiredDialog({ open: false, userId: '', username: '' })
    // 清空密码输入框，让用户用新密码重新登录
    setFormData(prev => ({ ...prev, password: '' }))
    setErrors({ login: '密码已更新，请使用新密码登录' })
  }
  
  // 🆕 关闭告警弹窗并跳转
  const handleAlertDialogClose = () => {
    setAlertDialog({ open: false, alerts: [] })
    navigate('/')
  }
  
  // 🆕 根据告警级别获取颜色
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }
  
  // 获取测试账号提示
  const getTestAccountHints = () => {
    if (!isDevelopment()) {
      return null
    }
    
    return (
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p className="mb-2">测试账号：</p>
        <div className="space-y-1">
          <p>系统管理员：admin / admin123</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-bg-page flex flex-col relative overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl"></div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo 和产品名称 */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Logo size="lg" className="drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              {import.meta.env.VITE_APP_NAME || '管理后台'}
            </h1>
            <p className="text-text-tertiary text-sm">
              欢迎登录，开始您的安全会议
            </p>
          </div>
          
          {/* 登录卡片 */}
          <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  用户名
                </label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="请输入用户名"
                  error={errors.username}
                  autoComplete="username"
                  disabled={loading}
                  className="h-11"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  密码
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="请输入密码"
                    error={errors.password}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-regular transition-colors"
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* 🆕 登录错误显示 */}
              {errors.login && (
                <div className="text-sm text-error bg-error/10 p-3 rounded-md border border-error/30">
                  {errors.login}
                </div>
              )}
              
              {errors.submit && (
                <div className="text-sm text-error bg-error/10 p-3 rounded-md border border-error/30">
                  {errors.submit}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                loading={loading}
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
            
            {getTestAccountHints()}
          </CardContent>
        </Card>
        </div>
      </div>
      
      {/* 底部信息 */}
      <footer className="py-6 text-center">
        <p className="text-sm text-text-tertiary">
          {import.meta.env.VITE_COMPANY_NAME} | v{import.meta.env.VITE_APP_VERSION}
        </p>
      </footer>
      
      {/* 🆕 强制修改密码对话框 */}
      <ForceChangePasswordDialog
        open={passwordExpiredDialog.open}
        onClose={() => setPasswordExpiredDialog({ open: false, userId: '', username: '' })}
        onSuccess={handlePasswordChangeSuccess}
        userId={passwordExpiredDialog.userId}
        username={passwordExpiredDialog.username}
      />
      
      {/* 🆕 告警弹窗 */}
      <Dialog open={alertDialog.open} onOpenChange={(open) => !open && handleAlertDialogClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              系统告警
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {alertDialog.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
              >
                <div className="font-medium mb-1">{alert.title}</div>
                <div className="text-sm opacity-80">{alert.message}</div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAlertDialogClose}>
              知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LoginPage
