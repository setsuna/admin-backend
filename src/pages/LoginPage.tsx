import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Server, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components'
import { useGlobalStore } from '@/store'
import { apiClient } from '@/services/api'
import type { User } from '@/types'

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
    
    // 模拟登录延迟
    setTimeout(() => {
      // 简单的账号密码验证
      if ((formData.username === 'admin' && formData.password === 'admin123') || 
          (formData.username === 'user' && formData.password === 'user123')) {
        
        // 生成mock token
        const mockToken = `token_${Date.now()}_${Math.random().toString(36).substring(2)}`
        localStorage.setItem('token', mockToken)
        
        // 保存用户信息
        const mockUser: User = {
          id: formData.username === 'admin' ? '1' : '2',
          username: formData.username,
          email: `${formData.username}@example.com`,
          role: formData.username === 'admin' ? 'admin' : 'user',
          avatar: '',
          createdAt: new Date().toISOString(),
          // 权限信息将由usePermission钩子从API获取
        }
        setUser(mockUser)
        
        // 跳转到首页
        navigate('/')
      } else {
        setErrors({ submit: '用户名或密码错误' })
      }
      
      setLoading(false)
    }, 800) // 模拟网络延迟
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
            <p>测试账号：</p>
            <p>管理员：admin / admin123</p>
            <p>普通用户：user / user123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
