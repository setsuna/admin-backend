import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import { useGlobalStore } from '@/store'
import { auth } from '@/services/auth'
import { envConfig } from '@/config/env.config'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setUser } = useGlobalStore()
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
        username: formData.username,
        mockMode: envConfig.ENABLE_MOCK,
        apiBaseUrl: envConfig.API_BASE_URL 
      })
      
      // 使用统一的认证服务
      const result = await auth.login({
        username: formData.username,
        password: formData.password
      })
      
      console.log('Login success:', result)
      
      // 保存用户信息到全局状态
      setUser(result.user)
      
      // 跳转到首页
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : '登录失败，请重试'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }
  
  // 获取测试账号提示
  const getTestAccountHints = () => {
    // 只有在Mock模式下才显示测试账号
    if (!envConfig.ENABLE_MOCK) {
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
