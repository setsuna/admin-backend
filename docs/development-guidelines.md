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

---

**本文档会随着项目发现的新问题持续更新，请定期查看最新版本。**
