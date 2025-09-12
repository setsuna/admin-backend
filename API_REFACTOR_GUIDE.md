# 🚀 API架构重构文档

## 📋 重构概述

本次重构将现有的Mock API架构升级为可以无缝切换到真实API的标准架构，提供以下核心功能：

- ✅ 统一的HTTP客户端和错误处理
- ✅ JWT认证和权限管理
- ✅ 标准化的API响应格式
- ✅ RESTful API路径规范
- ✅ 环境变量配置管理
- ✅ Mock/Real API自动切换
- ✅ 向后兼容的API接口

## 🏗️ 架构结构

```
src/
├── config/                    # 配置层
│   ├── api.config.ts         # API基础配置
│   ├── auth.config.ts        # 认证配置
│   └── env.config.ts         # 环境变量管理
│
├── services/
│   ├── core/                 # 核心基础设施
│   │   ├── http.client.ts    # HTTP客户端
│   │   ├── auth.service.ts   # 认证服务
│   │   ├── interceptors.ts   # 拦截器
│   │   └── error.handler.ts  # 错误处理
│   │
│   ├── api/                  # 真实API服务
│   │   ├── dict.api.ts      # 数据字典API
│   │   ├── meeting.api.ts   # 会议API
│   │   ├── user.api.ts      # 用户API
│   │   └── permission.api.ts # 权限API
│   │
│   ├── types/               # API类型定义
│   │   ├── api.types.ts     # 通用API类型
│   │   ├── dict.types.ts    # 数据字典类型
│   │   └── meeting.types.ts # 会议类型
│   │
│   ├── index.ts            # 统一导出
│   ├── dict.ts             # 重构后的字典服务
│   ├── meeting.ts          # 重构后的会议服务
│   └── permission.ts       # 重构后的权限服务
│
└── .env.development         # 开发环境配置
└── .env.production          # 生产环境配置
```

## ⚙️ 环境配置

### 开发环境 (自动使用Mock API)
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_REQUEST_TIMEOUT=10000
VITE_ENABLE_REQUEST_LOG=true
VITE_ENABLE_MOCK=true
```

### 生产环境 (使用真实API)
```bash
# .env.production
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_REQUEST_TIMEOUT=10000
VITE_ENABLE_REQUEST_LOG=false
VITE_ENABLE_MOCK=false
```

## 🔄 API切换机制

系统会根据环境变量自动选择使用Mock API或真实API：

```typescript
// 自动检测环境
const shouldUseMock = () => {
  return envConfig.ENABLE_MOCK || envConfig.DEV
}

// 创建对应的API服务
const createApiService = () => {
  if (shouldUseMock()) {
    return new MockApiService()
  } else {
    return new RealApiService()
  }
}
```

## 📝 API响应格式标准

### 标准响应格式
```typescript
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
  requestId: string
}
```

### 分页响应格式
```typescript
interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

## 🛠️ RESTful API路径规范

所有API遵循RESTful设计原则：

| 操作 | HTTP方法 | 路径 | 说明 |
|-----|----------|------|------|
| 获取列表 | GET | `/api/v1/dictionaries` | 获取数据字典列表 |
| 创建 | POST | `/api/v1/dictionaries` | 创建数据字典 |
| 获取详情 | GET | `/api/v1/dictionaries/{id}` | 获取字典详情 |
| 更新 | PUT | `/api/v1/dictionaries/{id}` | 更新字典 |
| 删除 | DELETE | `/api/v1/dictionaries/{id}` | 删除字典 |

## 🔐 认证和安全

### JWT Token管理
```typescript
// 登录
const response = await authService.login({
  username: 'admin',
  password: 'password'
})

// 自动添加Authorization头
// Authorization: Bearer <token>
```

### 权限验证
```typescript
// 检查用户权限
const hasPermission = authService.hasPermission('system:dict')

// 检查多个权限
const hasAllPermissions = authService.hasAllPermissions([
  'meeting:create',
  'meeting:manage'
])
```

## 📊 使用示例

### 数据字典API
```typescript
import { dictApi } from '@/services'

// 获取字典列表（自动切换Mock/Real API）
const response = await dictApi.getDictionaries(
  { keyword: '设备' },  // 筛选条件
  1,                    // 页码
  20                    // 页大小
)

// 创建字典
const newDict = await dictApi.createDictionary({
  dictCode: 'NEW_TYPE',
  dictName: '新类型',
  dictType: 'system',
  status: 'enabled',
  items: [...]
})
```

### 会议API
```typescript
import { meetingApi } from '@/services'

// 获取会议列表
const meetings = await meetingApi.getMeetings(
  { status: 'preparation' },
  1,
  10
)

// 创建草稿会议
const draft = await meetingApi.createDraftMeeting()

// 上传会议文件
const file = await meetingApi.uploadMeetingFile(
  meetingId,
  fileObject,
  agendaId
)
```

## 🔧 高级功能

### 错误重试机制
```typescript
import { retryManager } from '@/services/core/error.handler'

// 自动重试失败的请求
const result = await retryManager.executeWithRetry(
  () => apiCall(),
  3,    // 最大重试次数
  1000  // 重试延迟(ms)
)
```

### 请求日志
开发环境会自动记录所有API请求和响应：
```
🚀 API Request [req_1234567890_1]
URL: http://localhost:8080/api/v1/dictionaries
Method: GET
Headers: { Authorization: "Bearer ...", ... }
Params: { page: 1, pageSize: 20 }

✅ API Response [req_1234567890_1] - 245ms
Status: 200
Data: { items: [...], pagination: {...} }
```

### 文件上传
```typescript
import { httpClient } from '@/services/core/http.client'

// 上传文件（带进度回调）
const response = await httpClient.upload('/files/upload', formData, {
  onUploadProgress: (progressEvent) => {
    const progress = (progressEvent.loaded / progressEvent.total) * 100
    console.log(`上传进度: ${progress}%`)
  }
})
```

## 🚀 切换到生产API

当需要切换到真实API时，只需要：

1. **修改环境变量**：
   ```bash
   VITE_API_BASE_URL=https://your-production-api.com/api/v1
   VITE_ENABLE_MOCK=false
   ```

2. **可能需要调整字段映射** (如果API响应格式有差异)

3. **测试验证** 所有功能正常工作

## ⚠️ 注意事项

1. **向后兼容**：所有现有的页面组件调用方式保持不变
2. **类型安全**：所有API都有完整的TypeScript类型定义
3. **错误处理**：统一的错误处理和用户友好的提示
4. **性能优化**：请求去重、缓存、重试机制

## 🎯 最终目标达成

- ✅ **可无缝切换**：Mock API ↔ Real API
- ✅ **标准化架构**：RESTful + 标准响应格式  
- ✅ **完整的安全机制**：JWT + 权限控制
- ✅ **向后兼容**：现有代码无需修改
- ✅ **类型安全**：完整的TypeScript支持
- ✅ **开发友好**：详细的日志和错误信息

现在项目已经具备了企业级API架构，可以轻松应对后续的真实API对接需求！🎉
