import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Server, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components'
import { useGlobalStore } from '@/store'
import { apiClient } from '@/services/api'

export function LoginPage() {
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
    
    try {
      const response = await apiClient.post('/auth/login', formData)
      
      // 保存token
      localStorage.setItem('token', response.data.token)
      
      // 保存用户信息
      setUser(response.data.user)
      
      // 跳转到首页
      navigate('/')
    } catch (error: any) {
      setErrors({ submit: error.message || '登录失败' })
    } finally {
      setLoading(false)
    }
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <div className="text-sm text-destructive">
                {errors.submit}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              登录
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>默认账号：admin / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
