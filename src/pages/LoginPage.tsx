import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/store'
import { auth } from '@/services/core/auth.service'
import { isDevelopment } from '@/config'
// 🔧 修复：导入通知Hook用于处理特殊情况
import { useNotifications } from '@/hooks/useNotifications'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser, setPermissions } = useAuth()
  // 🔧 修复：使用通知系统显示成功消息
  const { showSuccess } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
      
      // 🔧 修复：使用统一的认证服务，错误会自动在全局拦截器中处理
      const result = await auth.login({
        username: formData.username,
        password: formData.password
      })
      
      console.log('Login success:', result)
      
      // 🔧 完整更新 store：从 localStorage 读取包含 permissions 的完整用户信息
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const fullUser = JSON.parse(userStr)
        setUser(fullUser)
        setPermissions(fullUser.permissions || [])
      } else {
        // 降级方案：使用返回的简化用户信息
        setUser(result.user as any)
        setPermissions([])
      }
      
      // 显示成功消息
      showSuccess('登录成功', `欢迎回来，${result.user.username}!`)
      
      // 跳转到首页
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      
      // 🔧 修复：错误信息已在全局拦截器中处理和显示
      // 这里只需要处理本地状态，不再重复显示错误
      
      // 只有在特殊情况下（比如表单验证错误）才显示在表单中
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code
        if (errorCode === 1004) { // 表单验证错误
          const validationErrors = (error as any).errors
          if (validationErrors && Array.isArray(validationErrors)) {
            const formErrors: Record<string, string> = {}
            validationErrors.forEach((err: any) => {
              if (err.field) {
                formErrors[err.field] = err.message
              }
            })
            setErrors(formErrors)
          }
        }
      }
      
      // 其他错误不在这里处理，由全局错误处理系统显示
    } finally {
      setLoading(false)
    }
  }
  
  // 获取测试账号提示
  const getTestAccountHints = () => {
    // 只有在开发环境下才显示测试账号
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* 主内容区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-8">
            {/* Logo 和产品名称 */}
            <div className="flex justify-center mb-6">
              <Logo size="md" className="" />
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
              
              {errors.submit && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
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
      
      {/* 底部信息 */}
      <footer className="py-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {import.meta.env.VITE_COMPANY_NAME} | v{import.meta.env.VITE_APP_VERSION}
        </p>
      </footer>
    </div>
  )
}

export default LoginPage
