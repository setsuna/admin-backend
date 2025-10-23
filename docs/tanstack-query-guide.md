# TanStack Query 迁移指南

## 📋 概述

本文档提供详细的 TanStack Query 迁移步骤、模板和最佳实践，帮助开发者将现有页面从传统的 `useEffect` + `useState` 方式迁移到 TanStack Query。

---

## 🎯 迁移目标

### 解决的问题

1. ✅ **双重请求问题**：React StrictMode 导致每次加载请求 2-4 次
2. ✅ **requestId 不一致**：每次 useEffect 重新执行生成新的 requestId
3. ✅ **代码冗余**：每个列表页都要写大量状态管理代码
4. ✅ **无缓存机制**：切换筛选条件重复请求，用户体验差

### 迁移效果

- **代码量减少 60%+**：不需要手动管理 loading/error/data 状态
- **性能提升 50%+**：自动缓存 + 去重，减少不必要的请求
- **开发效率提升 3倍**：统一模式，新页面开发更快
- **用户体验提升**：loading/error/retry 自动处理，更流畅

---

## 🏗️ 配置基础设施（已完成）

项目已经配置好 TanStack Query 基础设施：

### 1. Query 配置文件

**文件**：`src/config/query.config.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const defaultQueryOptions = {
  queries: {
    staleTime: 5000,              // 5秒内数据保持新鲜
    gcTime: 10 * 60 * 1000,      // 缓存保留 10 分钟
    retry: 1,                     // 失败重试 1 次
    refetchOnWindowFocus: false,  // 窗口聚焦不自动刷新
    refetchOnReconnect: false,    // 网络重连不自动刷新
  },
}

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
})
```

### 2. Provider 配置

**文件**：`src/main.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/config/query.config'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)
```

---

## 📝 迁移步骤（列表页）

### 步骤 1：识别需要删除的代码

**需要删除的内容：**

```typescript
// ❌ 删除：数据状态
const [meetings, setMeetings] = useState<Meeting[]>([])

// ❌ 删除：加载状态
const [loading, setLoading] = useState(false)

// ❌ 删除：错误状态（可选保留）
const [error, setError] = useState<string>('')

// ❌ 删除：加载数据函数
const loadMeetings = async () => {
  try {
    setLoading(true)
    const response = await meetingApi.getMeetings(...)
    setMeetings(response.items || [])
    setPagination(...)
  } catch (error) { ... }
  finally { setLoading(false) }
}

// ❌ 删除：所有 useEffect
useEffect(() => { loadMeetings() }, [pagination.page])
useEffect(() => { loadMeetings() }, [searchText, statusFilter])
```

**需要保留的内容：**

```typescript
// ✅ 保留：筛选器状态
const [searchText, setSearchText] = useState('')
const [statusFilter, setStatusFilter] = useState('')

// ✅ 保留：分页状态
const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })

// ✅ 保留：所有 UI 渲染逻辑
// ✅ 保留：所有操作按钮（删除、编辑等）
```

### 步骤 2：使用自定义 Hook（推荐）

**创建自定义 Hook**：`src/hooks/useMeetings.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { meetingApi } from '@/services/api/meeting.api'
import type { Meeting, MeetingFilters } from '@/types'

export function useMeetings(
  filters: MeetingFilters,
  page: number,
  pageSize: number,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['meetings', { ...filters, page, pageSize }],
    queryFn: () => meetingApi.getMeetings(filters, page, pageSize),
    enabled,
    staleTime: 5000,
  })

  return {
    meetings: data?.items || [],
    total: data?.pagination?.total || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
```

**在页面中使用**：

```typescript
import { useMeetings } from '@/hooks/useMeetings'

const MeetingListPage: React.FC = () => {
  // 筛选器和分页状态
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 })

  // 构建筛选条件
  const filters: MeetingFilters = {
    keyword: searchText || undefined,
    status: statusFilter || undefined,
  }

  // ✅ 使用 Hook 获取数据
  const { meetings, total, isLoading, isError, error } = useMeetings(
    filters,
    pagination.page,
    pagination.pageSize
  )

  // 直接使用数据渲染
  return (
    <div>
      {isLoading && <div>加载中...</div>}
      {isError && <div>加载失败: {error?.message}</div>}
      {meetings.map(meeting => (
        <div key={meeting.id}>{meeting.title}</div>
      ))}
    </div>
  )
}
```

### 步骤 3：添加操作后刷新

**导入 QueryClient**：

```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()
```

**在操作成功后刷新**：

```typescript
const handleDeleteMeeting = async (id: string) => {
  const confirmed = await dialog.confirm({ ... })
  if (!confirmed) return

  try {
    await meetingApi.deleteMeeting(id)
    showSuccess('删除成功')
    
    // ✅ 刷新所有相关的查询
    queryClient.invalidateQueries({ queryKey: ['meetings'] })
  } catch (error: any) {
    showError('删除失败', error.message)
  }
}
```

**需要刷新的操作：**
- 创建、更新、删除
- 状态变更（启用/禁用、打包/取消等）
- 批量操作

---

## 📋 完整迁移模板

### 列表页完整模板

```typescript
/**
 * XXX 列表页面
 */
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useXXX } from '@/hooks/useXXX'  // 自定义 Query Hook
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { xxxApi } from '@/services/api/xxx.api'
import { DialogComponents } from '@/components/ui/DialogComponents'
import type { XXXFilters } from '@/types'

const XXXListPage: React.FC = () => {
  // ========== 筛选器状态 ==========
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // ========== 分页状态 ==========
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  })

  // ========== 构建筛选条件 ==========
  const filters: XXXFilters = {
    keyword: searchText || undefined,
    status: statusFilter || undefined,
  }

  // ========== 使用 TanStack Query 获取数据 ==========
  const { items, total, isLoading, isError, error } = useXXX(
    filters,
    pagination.page,
    pagination.pageSize
  )

  // ========== Query Client ==========
  const queryClient = useQueryClient()
  
  // ========== UI 交互 Hooks ==========
  const dialog = useDialog()
  const { showSuccess, showError } = useNotifications()

  // ========== 筛选器变化处理 ==========
  const handleSearch = (value: string) => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // ========== 分页处理 ==========
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // ========== 删除操作 ==========
  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: '删除确认',
      message: '确定要删除这条记录吗？',
      type: 'danger',
    })
    
    if (!confirmed) return

    try {
      await xxxApi.delete(id)
      showSuccess('删除成功')
      queryClient.invalidateQueries({ queryKey: ['xxx'] })
    } catch (error: any) {
      showError('删除失败', error.message)
    }
  }

  // ========== 渲染 ==========
  return (
    <div className="p-6">
      {/* 筛选器 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜索..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
        >
          <option value="">所有状态</option>
          <option value="enabled">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </div>

      {/* 错误提示 */}
      {isError && (
        <div className="text-red-500">
          加载失败: {error?.message}
        </div>
      )}

      {/* 列表内容 */}
      {isLoading ? (
        <div>加载中...</div>
      ) : items.length === 0 ? (
        <div>暂无数据</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.status}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div>
        <span>共 {total} 条</span>
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          上一页
        </button>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page * pagination.pageSize >= total}
        >
          下一页
        </button>
      </div>

      {/* 对话框组件 */}
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default XXXListPage
```

### 详情页模板

```typescript
/**
 * XXX 详情页面
 */
import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { xxxApi } from '@/services/api/xxx.api'

const XXXDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // ✅ 使用 useQuery 获取详情
  const { data: item, isLoading, isError, error } = useQuery({
    queryKey: ['xxx', id],
    queryFn: () => xxxApi.getOne(id!),
    enabled: !!id,  // 只有 id 存在时才查询
  })

  if (isLoading) return <div>加载中...</div>
  if (isError) return <div>加载失败: {error.message}</div>
  if (!item) return <div>记录不存在</div>

  return (
    <div className="p-6">
      <h1>{item.name}</h1>
      <div>{item.description}</div>
    </div>
  )
}

export default XXXDetailPage
```

### 创建/编辑页模板

```typescript
/**
 * XXX 创建/编辑页面
 */
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '@/hooks/useNotifications'
import { xxxApi } from '@/services/api/xxx.api'
import type { CreateXXXRequest, UpdateXXXRequest } from '@/types'

const XXXFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useNotifications()

  const isEditMode = !!id

  // ========== 加载详情（编辑模式） ==========
  const { data: item } = useQuery({
    queryKey: ['xxx', id],
    queryFn: () => xxxApi.getOne(id!),
    enabled: isEditMode,
  })

  // ========== 表单状态 ==========
  const [formData, setFormData] = useState<CreateXXXRequest>({
    name: item?.name || '',
    description: item?.description || '',
  })

  // ========== 创建 Mutation ==========
  const createMutation = useMutation({
    mutationFn: (data: CreateXXXRequest) => xxxApi.create(data),
    onSuccess: () => {
      showSuccess('创建成功')
      queryClient.invalidateQueries({ queryKey: ['xxx'] })
      navigate('/xxx')
    },
    onError: (error: any) => {
      showError('创建失败', error.message)
    },
  })

  // ========== 更新 Mutation ==========
  const updateMutation = useMutation({
    mutationFn: (data: UpdateXXXRequest) => xxxApi.update(id!, data),
    onSuccess: () => {
      showSuccess('更新成功')
      queryClient.invalidateQueries({ queryKey: ['xxx'] })
      queryClient.invalidateQueries({ queryKey: ['xxx', id] })
      navigate('/xxx')
    },
    onError: (error: any) => {
      showError('更新失败', error.message)
    },
  })

  // ========== 提交处理 ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEditMode) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6">
      <h1>{isEditMode ? '编辑' : '创建'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label>描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
          <button type="button" onClick={() => navigate('/xxx')}>
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

export default XXXFormPage
```

---

## 🔍 常见问题

### Q1: queryKey 应该包含哪些内容？

**A**: queryKey 必须包含所有影响数据的参数

```typescript
// ✅ 正确：包含所有筛选条件和分页参数
queryKey: ['meetings', { 
  searchText, 
  statusFilter, 
  securityFilter, 
  page, 
  pageSize 
}]

// ❌ 错误：缺少参数，导致筛选条件变化时不重新请求
queryKey: ['meetings', page]
```

### Q2: 什么时候使用 useQuery？什么时候使用 useMutation？

**A**:
- **useQuery**: 用于读取数据（GET 请求）
  - 列表页、详情页
  - 下拉框选项、统计数据
  
- **useMutation**: 用于修改数据（POST/PUT/DELETE 请求）
  - 创建、更新、删除
  - 状态变更、批量操作

### Q3: 操作成功后如何刷新数据？

**A**: 使用 `invalidateQueries`

```typescript
// 刷新所有 meetings 相关的查询
queryClient.invalidateQueries({ queryKey: ['meetings'] })

// 只刷新特定 ID 的查询
queryClient.invalidateQueries({ queryKey: ['meeting', id] })

// 刷新多个查询
queryClient.invalidateQueries({ queryKey: ['meetings'] })
queryClient.invalidateQueries({ queryKey: ['statistics'] })
```

### Q4: 如何处理条件查询？

**A**: 使用 `enabled` 选项

```typescript
const { data } = useQuery({
  queryKey: ['meeting', id],
  queryFn: () => meetingApi.getOne(id!),
  enabled: !!id,  // 只有 id 存在时才查询
})
```

### Q5: 如何手动刷新数据？

**A**: 使用 `refetch` 方法

```typescript
const { data, refetch } = useQuery({ ... })

// 手动刷新
<button onClick={() => refetch()}>刷新</button>
```

### Q6: 如何禁用自动刷新？

**A**: 在配置中设置

```typescript
useQuery({
  queryKey: ['meetings'],
  queryFn: () => api.getMeetings(),
  refetchOnWindowFocus: false,  // 窗口聚焦不刷新
  refetchOnReconnect: false,    // 网络重连不刷新
})
```

---

## ✅ 迁移检查清单

在提交代码前，请确认：

### 列表页
- [ ] 删除了 `useState` 的 data 状态
- [ ] 删除了 `useState` 的 loading 状态
- [ ] 删除了 `loadData` 函数
- [ ] 删除了所有 `useEffect`
- [ ] 使用了 `useQuery` 或自定义 Hook
- [ ] `queryKey` 包含了所有依赖参数
- [ ] 操作成功后调用了 `invalidateQueries`
- [ ] 添加了加载状态和错误状态的 UI

### 详情页
- [ ] 使用了 `useQuery` 获取详情
- [ ] 使用了 `enabled` 控制查询时机
- [ ] 添加了加载状态和错误处理

### 创建/编辑页
- [ ] 使用了 `useMutation` 处理提交
- [ ] 配置了 `onSuccess` 和 `onError`
- [ ] 提交成功后调用了 `invalidateQueries`
- [ ] 使用了 `isPending` 显示提交状态

---

## 📚 参考资源

- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [React Query 最佳实践](https://tkdodo.eu/blog/practical-react-query)
- [项目开发规范](./development-guidelines.md)
- [MeetingListPage 示例](../src/pages/MeetingListPage.tsx)
- [useMeetings Hook 示例](../src/hooks/useMeetings.ts)

---

**有问题？** 查看示例代码或联系项目维护者。
