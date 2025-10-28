# 授权错误对话框自动显示功能

## 📋 功能概述

当用户登录时，如果后端返回授权验证失败（错误码 6001），系统会自动弹出授权对话框，显示授权相关信息。

## 🎯 实现功能

### 1. **自动检测授权错误**
- 监听所有 API 响应
- 检测错误码 `6001`（系统授权验证失败）
- 自动触发授权对话框

### 2. **完整数据传递**
授权对话框会接收后端返回的完整授权信息：
- `applicationCode`: 系统授权码（加密字符串）
- `error_code`: 错误代码（如 `LICENSE_INVALID`）
- `error_message`: 详细错误消息
- `need_license`: 是否需要授权标志
- `message`: 主要错误消息
- `code`: 数字错误码（6001）

## 📦 修改的文件

### 1. **interceptors.ts** (`src/services/core/interceptors.ts`)
```typescript
// 修改点：
- handleApiError 函数添加 fullData 参数
- 调用 handleApiError 时传递 data.data
- handleAuthorizationError 检测 6001 错误码并显示对话框
```

### 2. **ui.types.ts** (`src/types/common/ui.types.ts`)
```typescript
// 新增字段：
export interface AuthErrorDialogData {
  // ... 原有字段
  code?: number              // 错误码
  errorDetails?: string      // 错误详情
  applicationCode?: string   // 系统授权码
  errorMessage?: string      // 后端错误消息
  needLicense?: boolean      // 是否需要授权
}
```

## 🔍 后端响应格式

当授权验证失败时，后端返回：
```json
{
  "code": 6001,
  "message": "系统授权验证失败",
  "data": {
    "applicationCode": "MPocvFDaDggsZ2OrZ9T5Hi...",
    "error_code": "LICENSE_INVALID",
    "error_message": "系统授权无效",
    "need_license": true
  },
  "timestamp": 1761658475,
  "requestId": "c9f782c7-7083-4b7d-b32d-96229b3ac265"
}
```

## ✨ 功能特性

### 自动触发场景
1. **用户登录时**
   - 用户提交登录表单
   - 后端验证授权失败（6001）
   - 自动弹出授权对话框

2. **任意 API 调用**
   - 任何 API 返回 6001 错误码
   - 自动弹出授权对话框

### 对话框行为
- **不允许关闭**: `allowClose: false`（授权失败是阻断性错误）
- **错误模式**: `mode: 'error'`（红色警告样式）
- **不显示当前状态**: `showCurrentStatus: false`

## 🛠️ 使用方式

### 方式一：后端返回 6001 错误（自动）
```typescript
// 无需任何前端代码，系统自动处理
// 后端返回 6001 错误码 → 自动显示对话框
```

### 方式二：手动触发（URL参数）
```typescript
// 访问任意页面时添加 info=true 参数
// 例如：http://localhost:3000/dashboard?info=true
```

### 方式三：编程方式调用
```typescript
import { useAuth } from '@/store'

const { showAuthManagement } = useAuth()

// 显示授权管理信息（info模式）
showAuthManagement()

// 或显示授权错误（error模式）
const { showAuthError } = useAuth()
showAuthError({
  message: '自定义错误消息',
  code: 6001,
  mode: 'error',
  allowClose: false,
  showCurrentStatus: false,
  applicationCode: 'xxx...',
  errorCode: 'LICENSE_INVALID',
  errorMessage: '系统授权无效',
  needLicense: true
})
```

## 🔄 工作流程

```
1. 用户登录
   ↓
2. 后端验证授权
   ↓
3. 返回 6001 错误码
   ↓
4. errorInterceptor 捕获错误
   ↓
5. handleApiError 分类处理
   ↓
6. handleAuthorizationError 检测 6001
   ↓
7. 调用 showAuthError
   ↓
8. 显示授权对话框
   ↓
9. 用户查看授权信息/输入授权码
```

## 📝 错误处理

### 降级处理
如果授权对话框加载失败：
```typescript
// 自动降级为普通错误提示
errorHandler.handleError(
  new Error('系统授权验证失败，请联系系统管理员'),
  'PERMISSION_DENIED'
)
```

### 日志记录
```typescript
// 控制台输出
console.error('Failed to show auth error dialog:', err)
```

## 🎨 对话框展示

授权对话框会显示：
- ✅ 主要错误消息
- ✅ 错误码（6001）
- ✅ 系统授权码（applicationCode）
- ✅ 详细错误信息
- ✅ 授权码输入框（如果对话框支持）

## 🔐 安全考虑

1. **授权码加密**: applicationCode 是加密后的字符串
2. **阻断性错误**: 授权失败不允许关闭对话框
3. **错误隔离**: 不同的错误码走不同的处理流程

## 🐛 故障排查

### 问题：对话框没有显示
**检查项：**
1. 后端是否返回正确的错误码 6001
2. data.data 中是否包含 need_license: true
3. 控制台是否有错误日志
4. Store 是否正确导入

### 问题：数据显示不完整
**检查项：**
1. 后端返回的 data.data 字段是否完整
2. 类型定义是否匹配
3. 授权对话框组件是否支持新增字段

## 📚 相关文档

- [错误处理系统](./error-handling.md)
- [开发规范](./development-guidelines.md)
- [架构文档](./architecture.md)

---

**最后更新**: 2025-01-XX  
**版本**: 1.0.0
