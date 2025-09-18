import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Server, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
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
          <p>会议管理员：meeting_admin / meeting123</p>
          <p>审计员：auditor / audit123</p>
          <p>普通用户：user / user123</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Server className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">登录管理后台</CardTitle>
          <p className="text-sm text-muted-foreground">
            请输入您的登录凭据
            {envConfig.ENABLE_MOCK && (
              <span className="block mt-1 text-orange-600">
                当前为Mock模式
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">用户名</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="请输入用户名"
                error={errors.username}
                autoComplete="username"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">密码</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="请输入密码"
                  error={errors.password}
                  autoComplete="current-password"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
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
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
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
  )
}

export default LoginPage
