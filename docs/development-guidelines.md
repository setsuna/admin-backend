# 开发规范与最佳实践

## 📋 概述

本文档记录了项目开发中的关键规范、常见错误及最佳实践，帮助开发者避免常见问题，提高代码质量。

## ⚠️ 常见错误及解决方案

### 1. ❌ API 服务层错误访问 .data 属性

**错误表现**：
```
TypeError: Cannot read properties of undefined (reading 'items')
```

**错误代码**：
```typescript
// ❌ 错误示例
export class DictApiService {
  async getDictionaries(filters: DictFilters): Promise<PaginatedResponse<DataDict>> {
    const response = await httpClient.get<PaginatedResponse<DataDict>>(this.basePath, filters)
    return response.data  // ❌ 错误！response 已经是数据，没有 .data 属性
  }
}
```

**正确代码**：
```typescript
// ✅ 正确示例
export class DictApiService {
  async getDictionaries(filters: DictFilters): Promise<PaginatedResponse<DataDict>> {
    // httpClient 已经自动提取了 response.data.data，直接返回即可
    return await httpClient.get<PaginatedResponse<DataDict>>(this.basePath, filters)
  }
}
```

**原因分析**：
1. 后端返回格式：`{ code: 200, data: {...}, message: 'success' }`
2. `httpClient.get()` 内部已经执行：`return response.data?.data || response.data`
3. API 服务层得到的已经是最终的业务数据，不需要再访问 `.data`

**修复检查清单**：
- [ ] 所有 `httpClient.get()` 调用直接返回结果
- [ ] 所有 `httpClient.post()` 调用直接返回结果
- [ ] 所有 `httpClient.put()` 调用直接返回结果
- [ ] 所有 `httpClient.patch()` 调用直接返回结果
- [ ] 所有 `httpClient.delete()` 调用直接返回结果

---

### 2. ❌ 状态值类型不匹配

**错误表现**：
```
Element implicitly has an 'any' type because expression of type 'EntityStatus' 
can't be used to index type '{ enabled: {...}, disabled: {...} }'
```

**错误代码**：
```typescript
// ❌ 错误：使用了错误的状态值
<select value={statusFilter}>
  <option value="active">启用</option>
  <option value="inactive">禁用</option>
</select>

const statusKey = status === 'active' ? 'enabled' : 'disabled'  // ❌ 不必要的映射
```

**正确代码**：
```typescript
// ✅ 正确：使用后端实际返回的状态值
<select value={statusFilter}>
  <option value="enabled">启用</option>
  <option value="disabled">禁用</option>
</select>

// EntityStatus 已经是 'enabled' | 'disabled'，直接使用
const config = statusConfig[status]  // ✅ 直接使用
```

**关键点**：
- 检查后端实际返回的字段值
- 确保前端类型定义与后端一致
- 避免不必要的值映射

---

### 3. ❌ 防御性编程不足

**错误表现**：
```
TypeError: Cannot read properties of undefined (reading 'map')
```

**错误代码**：
```typescript
// ❌ 错误：没有检查 undefined
{dictTypes.map(type => (
  <option key={type.value} value={type.value}>{type.label}</option>
))}
```

**正确代码**：
```typescript
// ✅ 正确：添加防御性检查
{dictTypes && dictTypes.length > 0 ? (
  dictTypes.map(type => (
    <option key={type.value} value={type.value}>{type.label}</option>
  ))
) : null}

// 或者确保初始值不为 undefined
const [dictTypes, setDictTypes] = useState<SelectOption[]>([])  // ✅ 初始为空数组

// API 调用时也要防御
const types = await dictApi.getDictTypes()
setDictTypes(types || [])  // ✅ 确保不是 undefined
```

---

### 4. ❌ 类型导入错误

**错误表现**：
```
Module '@/types' has no exported member 'DictStatus'
```

**错误代码**：
```typescript
// ❌ 错误：导入了不存在的类型
import type { DictStatus } from '@/types'
```

**正确代码**：
```typescript
// ✅ 正确：使用实际存在的类型
import type { EntityStatus } from '@/types'

// 或者检查类型定义文件
// src/types/common/base.types.ts
export type EntityStatus = 'enabled' | 'disabled'
```

**检查方法**：
1. 查看 `src/types/index.ts` 的导出
2. 检查具体的类型定义文件
3. 使用 IDE 的自动导入功能

---

## ✅ 最佳实践

### 1. API 服务层开发

```typescript
// ✅ 标准模板
export class XxxApiService {
  private basePath = API_PATHS.XXX

  // GET 请求
  async getList(filters: Filters): Promise<PaginatedResponse<Item>> {
    return await httpClient.get<PaginatedResponse<Item>>(this.basePath, filters)
  }

  // GET 单个
  async getOne(id: string): Promise<Item> {
    return await httpClient.get<Item>(`${this.basePath}/${id}`)
  }

  // POST 创建
  async create(data: CreateRequest): Promise<Item> {
    return await httpClient.post<Item>(this.basePath, data)
  }

  // PUT 更新
  async update(id: string, data: UpdateRequest): Promise<Item> {
    return await httpClient.put<Item>(`${this.basePath}/${id}`, data)
  }

  // DELETE 删除
  async delete(id: string): Promise<OperationResult> {
    return await httpClient.delete<OperationResult>(`${this.basePath}/${id}`)
  }
}

export const xxxApi = new XxxApiService()
```

### 2. 页面组件中使用 API

```typescript
// ✅ 完整的错误处理和防御性编程
const [data, setData] = useState<Item[]>([])
const [loading, setLoading] = useState(false)

const loadData = async () => {
  try {
    setLoading(true)
    const response = await xxxApi.getList(filters, page, pageSize)
    
    // 直接使用 response，它已经是 { items: [...], pagination: {...} }
    setData(response.items || [])  // 防御性：确保不是 undefined
    setPagination(prev => ({ 
      ...prev, 
      total: response.pagination?.total || 0 
    }))
  } catch (error) {
    console.error('Failed to load data:', error)
    setData([])  // 错误时设置为空数组
    setPagination(prev => ({ ...prev, total: 0 }))
  } finally {
    setLoading(false)
  }
}
```

### 3. 类型定义使用

```typescript
// ✅ 从统一入口导入
import type { 
  User, 
  Meeting, 
  EntityStatus, 
  PaginatedResponse,
  CreateUserRequest 
} from '@/types'

// ✅ 使用类型安全的状态
const [status, setStatus] = useState<EntityStatus>('enabled')
const [users, setUsers] = useState<User[]>([])

// ✅ API 调用时的类型标注
const response = await userApi.getUsers(filters, page, pageSize)
// response 的类型会自动推导为 PaginatedResponse<User>
```

### 4. 状态管理最佳实践

```typescript
// ✅ 使用选择器 hooks
import { useAuth, useUI } from '@/store'

const { user, permissions } = useAuth()
const { theme, notifications } = useUI()

// ✅ 使用业务 hooks
import { usePermission } from '@/hooks/usePermission'

const { hasPermission, hasAnyPermission } = usePermission()
```

### 5. 用户交互组件使用规范 ⭐

**关键原则：禁止使用原生对话框，必须使用系统组件**

#### ❌ 禁止使用的原生方法

```typescript
// ❌ 禁止使用 window.confirm
if (window.confirm('确定要删除吗？')) {
  // ...
}

// ❌ 禁止使用 window.alert
window.alert('操作成功')
alert('操作失败')

// ❌ 禁止使用 window.prompt
const name = window.prompt('请输入名称')
```

**为什么禁止：**
- 样式无法控制，与系统UI不一致
- 无法适配暗色主题
- 用户体验差，功能单一
- 无法记录操作日志
- 阻塞式交互，影响性能

#### ✅ 正确使用系统组件

**1. 确认对话框 - 使用 `useDialog`**

```typescript
import { useDialog } from '@/hooks/useModal'
import { DialogComponents } from '@/components/ui/DialogComponents'

const YourComponent: React.FC = () => {
  const dialog = useDialog()
  
  const handleDelete = async (id: string) => {
    // ✅ 使用系统确认对话框
    const confirmed = await dialog.confirm({
      title: '删除会议',
      message: '确定要删除这个会议吗？此操作不可恢复。',
      type: 'danger',  // 'warning' | 'danger' | 'info'
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    // 执行删除操作...
  }
  
  return (
    <>
      {/* 页面内容 */}
      <Button onClick={() => handleDelete(id)}>删除</Button>
      
      {/* ⚠️ 必须添加：渲染对话框组件 */}
      <DialogComponents dialog={dialog} />
    </>
  )
}
```

**对话框类型说明：**
- `type: 'danger'` - 危险操作（删除、清空等），红色按钮
- `type: 'warning'` - 警告操作（关闭、取消等），橙色按钮
- `type: 'info'` - 信息提示（默认），蓝色按钮

**2. 消息通知 - 使用 `useNotifications`**

```typescript
import { useNotifications } from '@/hooks/useNotifications'

const YourComponent: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications()
  
  const handleSubmit = async () => {
    try {
      const result = await api.submit(data)
      // ✅ 成功提示
      showSuccess('提交成功', result.message)
    } catch (error: any) {
      // ✅ 错误提示
      showError('提交失败', error.message)
    }
  }
  
  const handleWarning = () => {
    // ✅ 警告提示
    showWarning('注意', '这个操作可能需要一些时间')
  }
  
  const handleInfo = () => {
    // ✅ 信息提示
    showInfo('提示', '文件正在上传中...')
  }
  
  return <Button onClick={handleSubmit}>提交</Button>
}
```

**通知方法说明：**
- `showSuccess(title, message?)` - 成功提示（绿色）
- `showError(title, message?)` - 错误提示（红色）
- `showWarning(title, message?)` - 警告提示（橙色）
- `showInfo(title, message?)` - 信息提示（蓝色）

**3. 完整示例 - 状态切换操作**

```typescript
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'

const MeetingListPage: React.FC = () => {
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()
  const [loading, setLoading] = useState(false)
  
  // 打包会议
  const handlePackageMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '打包会议',
      message: '确定要打包这个会议吗？',
      content: '打包后会议将进入就绪状态，无法编辑。',
      type: 'warning',
      confirmText: '确定打包',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    try {
      setLoading(true)
      const result = await meetingApi.packageMeeting(id)
      showSuccess('打包成功', result.message)
      loadMeetings()
    } catch (error: any) {
      showError('打包失败', error.message)
    } finally {
      setLoading(false)
    }
  }
  
  // 删除会议
  const handleDeleteMeeting = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '删除会议',
      message: '确定要删除这个会议吗？此操作不可恢复。',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (!confirmed) return
    
    try {
      const result = await meetingApi.deleteMeeting(id)
      showSuccess('删除成功', result.message)
      loadMeetings()
    } catch (error: any) {
      showError('删除失败', error.message)
    }
  }
  
  return (
    <>
      {/* 页面内容 */}
      <Button onClick={() => handlePackageMeeting(id)}>打包</Button>
      <Button onClick={() => handleDeleteMeeting(id)}>删除</Button>
      
      {/* ⚠️ 必须添加：渲染对话框组件 */}
      <DialogComponents dialog={dialog} />
    </>
  )
}
```

**检查清单：**
- [ ] 所有确认操作使用 `dialog.confirm()`，不使用 `window.confirm()`
- [ ] 所有提示消息使用 `showSuccess/Error/Warning/Info()`，不使用 `alert()`
- [ ] 页面中添加了 `<DialogComponents dialog={dialog} />` 组件
- [ ] 确认对话框使用了合适的 `type`（danger/warning/info）
- [ ] 确认和取消按钮的文字清晰明确
- [ ] 重要操作添加了详细的 `content` 说明

---

## 🔍 代码审查检查清单

### API 服务层
- [ ] 所有 httpClient 调用直接返回结果，不访问 `.data`
- [ ] 所有方法都有正确的类型标注
- [ ] 错误处理适当（通常让上层处理）

### 页面/组件
- [ ] 状态初始值不为 `undefined`（数组用 `[]`，对象用 `{}`）
- [ ] API 调用有完整的 try-catch-finally
- [ ] 列表渲染前检查数组存在性
- [ ] 使用正确的状态值（与后端一致）

### 类型使用
- [ ] 从 `@/types` 统一导入
- [ ] 使用实际存在的类型
- [ ] 状态值类型与后端返回值匹配

### 性能优化
- [ ] 避免不必要的重新渲染
- [ ] 大列表使用虚拟滚动
- [ ] 防抖/节流适当使用

---

## 📚 相关文档

- [架构设计文档](./architecture.md) - 完整的架构说明
- [README](../README.md) - 项目概述和快速开始
- [类型定义](../src/types/index.ts) - 所有可用类型

---

## 🚨 紧急问题快速查找

### "Cannot read properties of undefined (reading 'items')"
→ [API 服务层错误访问 .data 属性](#1--api-服务层错误访问-data-属性)

### "Cannot read properties of undefined (reading 'map')"
→ [防御性编程不足](#3--防御性编程不足)

### "Module has no exported member 'XxxType'"
→ [类型导入错误](#4--类型导入错误)

### "can't be used to index type"
→ [状态值类型不匹配](#2--状态值类型不匹配)

### "如何实现确认对话框和通知？"
→ [用户交互组件使用规范](#5-用户交互组件使用规范-)

---

**本文档会随着项目发现的新问题持续更新，请定期查看最新版本。**
