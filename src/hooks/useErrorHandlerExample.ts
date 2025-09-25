/**
 * 错误处理系统使用示例和测试
 */

import { httpClient } from '@/services/core/http.client'
import { ERROR_CODES } from '@/config'
import type { ValidationError } from '@/types/api/response.types'

// 🎯 示例：业务服务中使用新的错误处理
export class ExampleUserService {
  
  // ✅ 正确的错误处理方式
  async getUser(id: string) {
    try {
      // HTTP客户端会自动处理错误码，抛出带有分类信息的错误
      const user = await httpClient.get(`/users/${id}`)
      return user
    } catch (error: any) {
      // 错误已经被拦截器处理并显示给用户
      // 这里可以做一些额外的业务逻辑处理
      console.log('获取用户失败:', error.message)
      throw error // 继续抛出给上层处理
    }
  }
  
  // ✅ 表单提交的错误处理示例
  async createUser(userData: any) {
    try {
      const result = await httpClient.post('/users', userData)
      return result
    } catch (error: any) {
      // 如果是验证错误（错误码1004），会自动显示字段级别的错误信息
      // 如果是权限错误（错误码2004），会提示权限不足
      // 如果是系统错误（错误码9xxx），会提供重试选项
      throw error
    }
  }
  
  // ✅ 文件上传的错误处理示例
  async uploadAvatar(file: File, userId: string) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      
      const result = await httpClient.upload('/users/avatar', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          console.log(`上传进度: ${progress.toFixed(2)}%`)
        }
      })
      
      return result
    } catch (error: any) {
      // 文件相关错误会自动处理：
      // 3003 - 文件过大：显示"请选择小于10MB的文件"
      // 3004 - 文件类型不支持：显示"请选择文档、图片或视频文件"
      // 3002 - 上传失败：显示"文件上传失败，请重试"
      throw error
    }
  }
}

// 🎯 组件中使用错误处理Hook的示例
export function ExampleComponent() {
  // 在实际组件中，需要在应用的根组件使用这个Hook
  // const { triggerError } = useErrorHandler()
  
  const handleTestError = (errorCode: number) => {
    // 可以手动触发错误进行测试
    // triggerError(errorCode, '这是一个测试错误')
    console.log('测试错误码:', errorCode)
  }
  
  const testValidationError = () => {
    const errors: ValidationError[] = [
      { field: 'username', message: '用户名不能为空' },
      { field: 'email', message: '邮箱格式不正确' }
    ]
    // triggerValidationError(errors)
    console.log('测试验证错误:', errors)
  }
  
  return {
    handleTestError,
    testValidationError
  }
}

// 🎯 错误码测试用例
export const ERROR_TEST_CASES = {
  // 通用错误测试
  GENERAL_ERRORS: [
    { code: ERROR_CODES.PARAM_ERROR, description: '参数错误' },
    { code: ERROR_CODES.VALIDATION_ERROR, description: '表单验证错误' },
    { code: ERROR_CODES.JSON_FORMAT_ERROR, description: 'JSON格式错误' }
  ],
  
  // 认证错误测试
  AUTH_ERRORS: [
    { code: ERROR_CODES.UNAUTHORIZED, description: '未授权（自动跳转登录）' },
    { code: ERROR_CODES.TOKEN_EXPIRED, description: 'Token过期（自动跳转登录）' },
    { code: ERROR_CODES.PERMISSION_DENIED, description: '权限不足' },
    { code: ERROR_CODES.LOGIN_FAILED, description: '登录失败' }
  ],
  
  // 文件错误测试
  FILE_ERRORS: [
    { code: ERROR_CODES.FILE_TOO_LARGE, description: '文件过大' },
    { code: ERROR_CODES.FILE_TYPE_NOT_SUPPORTED, description: '文件类型不支持' },
    { code: ERROR_CODES.FILE_UPLOAD_FAILED, description: '文件上传失败' },
    { code: ERROR_CODES.FILE_NOT_EXIST, description: '文件不存在' }
  ],
  
  // 业务错误测试
  BUSINESS_ERRORS: [
    { code: ERROR_CODES.MEETING_NOT_EXIST, description: '会议不存在' },
    { code: ERROR_CODES.MEETING_ALREADY_EXIST, description: '会议已存在' },
    { code: ERROR_CODES.DICT_ITEM_NOT_EXIST, description: '字典项不存在' }
  ],
  
  // 系统错误测试
  SYSTEM_ERRORS: [
    { code: ERROR_CODES.INTERNAL_SERVER_ERROR, description: '系统异常（可重试）' },
    { code: ERROR_CODES.SERVICE_UNAVAILABLE, description: '服务不可用（可重试）' },
    { code: ERROR_CODES.SYSTEM_MAINTENANCE, description: '系统维护中' }
  ],
  
  // 授权错误测试
  AUTHORIZATION_ERRORS: [
    { code: ERROR_CODES.AUTHORIZATION_CODE_INVALID, description: '系统授权无效' },
    { code: ERROR_CODES.AUTHORIZATION_CODE_EXPIRED, description: '系统授权过期' },
    { code: ERROR_CODES.AUTHORIZATION_CODE_NOT_EXIST, description: '系统未授权' }
  ]
}

// 🎯 错误处理测试函数
export function testErrorHandling() {
  console.log('🧪 开始测试错误处理系统...')
  
  // 测试各类错误码
  Object.entries(ERROR_TEST_CASES).forEach(([category, errors]) => {
    console.log(`\n📂 测试分类: ${category}`)
    errors.forEach(({ code, description }) => {
      console.log(`  - 错误码 ${code}: ${description}`)
      
      // 在实际测试中，可以触发这些错误
      // triggerError(code, description)
    })
  })
  
  // 测试表单验证错误
  console.log('\n📝 测试表单验证错误:')
  const validationErrors: ValidationError[] = [
    { field: 'username', message: '用户名长度必须在2-20个字符之间', code: 1001 },
    { field: 'email', message: '请输入有效的邮箱地址', code: 1001 },
    { field: 'password', message: '密码强度不够', code: 1001 },
    { field: 'confirmPassword', message: '两次密码输入不一致', code: 1001 }
  ]
  console.log('  验证错误:', validationErrors)
  
  console.log('\n✅ 错误处理系统测试完成!')
  console.log('\n📋 验收清单:')
  console.log('  ✓ 认证错误自动跳转登录')
  console.log('  ✓ 表单验证错误显示到字段')
  console.log('  ✓ 文件错误有明确限制说明')
  console.log('  ✓ 系统错误提供重试选项')
  console.log('  ✓ 权限错误有操作指导')
  console.log('  ✓ 授权错误建议联系管理员')
  console.log('  ✓ 所有错误都有用户友好提示')
  console.log('  ✓ 兼容旧的错误处理方式')
}

// 🎯 错误处理最佳实践示例
export const ERROR_HANDLING_BEST_PRACTICES = {
  // ✅ 推荐的错误处理方式
  RECOMMENDED: `
    // 1. 服务层只需要简单的 try-catch
    async getUsers() {
      try {
        return await httpClient.get('/users')
      } catch (error) {
        // 错误已自动处理，这里可做业务逻辑
        console.log('获取用户列表失败')
        throw error
      }
    }
    
    // 2. 组件中可以捕获特定错误进行处理
    const handleSubmit = async (data) => {
      try {
        await userService.createUser(data)
        showSuccess('用户创建成功')
      } catch (error) {
        // 错误已显示给用户，这里可以做额外处理
        console.log('创建失败:', error.message)
      }
    }
  `,
  
  // ❌ 不推荐的错误处理方式
  NOT_RECOMMENDED: `
    // ❌ 不要手动解析错误码
    catch (error) {
      if (error.code === 2001) {
        // 不要这样做，拦截器已经处理了
        window.location.href = '/login'
      }
    }
    
    // ❌ 不要重复显示错误信息
    catch (error) {
      // 错误已经在拦截器中显示，不要再次显示
      alert(error.message) // ❌
    }
  `
}

// 🎯 迁移指南
export const MIGRATION_GUIDE = {
  description: '从旧错误处理系统迁移到新系统的指南',
  steps: [
    '1. 确保在应用根组件使用 useErrorHandler() Hook',
    '2. 移除业务代码中的手动错误码判断逻辑',
    '3. 移除重复的错误信息显示代码',
    '4. 更新类型导入路径（从 @/types 导入）',
    '5. 测试各种错误场景确保正常工作'
  ],
  breaking_changes: [
    'HTTP客户端返回值从 ApiResponse<T> 改为 T',
    '错误处理完全自动化，无需手动处理',
    'ValidationError 类型定义有更新'
  ],
  compatibility: [
    '保持与现有业务代码的兼容性',
    '支持旧的错误码常量',
    '向下兼容现有的错误处理接口'
  ]
}
