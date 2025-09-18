# Admin Backend 项目结构指南

## 项目概述

这是一个基于 React + TypeScript + Vite 的管理后台项目，主要用于会议管理系统。

**技术栈：**
- React 18.2.0 + TypeScript
- Vite 7.0.6 (注意：使用了特殊的分包配置解决 Zustand 冲突)
- React Router Dom 6.20.1
- Zustand 4.4.7 (状态管理)
- TanStack React Query 5.8.4 (数据查询)
- TanStack React Table 8.10.7 (表格)
- React Hook Form + Zod (表单验证)
- Tailwind CSS + 自定义 UI 组件
- Lucide React (图标库)

## 核心目录结构

```
src/
├── components/           # 组件库
│   ├── ui/              # 基础 UI 组件 (Button, Input, Card, Table 等)
│   ├── layouts/         # 布局组件 (MainLayout)
│   ├── features/        # 业务功能组件
│   ├── PermissionGuard.tsx  # 权限守卫组件
│   └── index.ts         # 统一导出
├── pages/               # 页面组件
│   ├── Dashboard.tsx
│   ├── LoginPage.tsx
│   ├── MeetingListPage.tsx
│   ├── MyMeetingPage.tsx
│   ├── CreateMeetingPage.tsx
│   └── index.ts
├── store/               # Zustand 状态管理
│   └── index.ts         # 全局状态 (user, theme, notifications 等)
├── types/               # TypeScript 类型定义
│   └── index.ts         # 所有业务类型
├── hooks/               # 自定义 Hooks
├── services/            # API 服务
├── utils/               # 工具函数
├── config/              # 配置文件
├── styles/              # 样式文件
├── router.tsx           # 路由配置
├── App.tsx              # 应用根组件
└── main.tsx             # 应用入口
```

## 重要配置文件

### vite.config.ts 重要说明
**⚠️ 关键：** 项目使用了特殊的分包配置来解决 Zustand 状态管理冲突问题，不要随意修改 `manualChunks` 配置！

```typescript
// 关键配置：
resolve: {
  dedupe: ['react', 'react-dom', 'zustand']  // 强制去重
}
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'state-management': ['zustand'],  // 关键：单独分包
        // ... 其他配置
      }
    }
  }
}
```

## 添加新页面的标准流程

### 1. 创建页面组件

**位置：** `src/pages/YourNewPage.tsx`

**模板结构：**
```typescript
import { useState } from 'react'
import { useGlobalStore } from '@/store'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components'
import type { YourDataType } from '@/types'

const YourNewPage = () => {
  const { user } = useGlobalStore()
  const [loading, setLoading] = useState(false)
  
  // 业务逻辑
  
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>页面标题</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 页面内容 */}
        </CardContent>
      </Card>
    </div>
  )
}

export default YourNewPage
```

### 2. 添加类型定义（如需要）

**位置：** `src/types/index.ts`

```typescript
// 在文件末尾添加新的类型
export interface YourDataType {
  id: string
  name: string
  // 其他字段...
}
```

### 3. 更新路由配置

**位置：** `src/router.tsx`

```typescript
// 1. 添加懒加载导入
const YourNewPage = lazy(() => import('@/pages/YourNewPage'))

// 2. 在路由配置中添加路由
{
  path: 'your-new-path',
  element: (
    <PermissionGuard permissions={['your:permission']}>
      <LazyWrapper>
        <YourNewPage />
      </LazyWrapper>
    </PermissionGuard>
  ),
}
```

### 4. 更新页面导出

**位置：** `src/pages/index.ts`

```typescript
export { default as YourNewPage } from './YourNewPage'
```

## 权限系统

项目使用基于权限码的权限控制：

**权限码格式：** `module:action`
- 示例：`meeting:view`, `meeting:manage`, `dashboard:view`

**权限守卫使用：**
```typescript
<PermissionGuard permissions={['meeting:manage']}>
  <YourComponent />
</PermissionGuard>
```

**用户角色：**
- `xunyidi`: 超管 (完整权限)
- `admin`: 会议管理员 (完整权限)
- `sysadm`: 系统管理员
- `secadm`: 安全管理员
- `auditadm`: 审计员
- `user`: 普通用户

## 状态管理 (Zustand)

**全局状态包含：**
- `user`: 用户信息
- `theme`: 主题设置
- `sidebarCollapsed`: 侧边栏状态
- `notifications`: 通知列表
- `globalLoading`: 全局加载状态

**使用示例：**
```typescript
import { useGlobalStore } from '@/store'

const { user, setUser, addNotification } = useGlobalStore()
```

## UI 组件库

**可用组件：**
- `Button`, `Input`, `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Table`, `Loading`, `Modal`, `Notification`
- `Select`, `StatusIndicator`

**导入方式：**
```typescript
import { Button, Card, Input } from '@/components'
```

## 表单处理

使用 React Hook Form + Zod 验证：

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '名称不能为空'),
  email: z.string().email('邮箱格式不正确'),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema)
})
```

## 数据表格

使用 TanStack React Table：

```typescript
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: 'name',
    header: '名称',
  },
  // 更多列...
]

const table = useReactTable({
  data: yourData,
  columns,
  getCoreRowModel: getCoreRowModel(),
})
```

## API 查询

使用 TanStack React Query：

```typescript
import { useQuery } from '@tanstack/react-query'
import { yourApiService } from '@/services'

const { data, isLoading, error } = useQuery({
  queryKey: ['your-data'],
  queryFn: yourApiService.fetchData
})
```

## 样式规范

- **主要使用 Tailwind CSS**
- **响应式优先：** 移动端适配
- **主题支持：** 支持 light/dark/system/gov-red 主题
- **组件样式：** 尽量使用现有 UI 组件，保持一致性

## 构建注意事项

1. **打包前测试：** 
```bash
npm run build
npm run preview
```

2. **不要修改 vite.config.ts 的分包配置**，这是为了解决 Zustand 冲突问题

3. **新页面必须使用懒加载：**
```typescript
const YourPage = lazy(() => import('@/pages/YourPage'))
```

## 常见模式

### 列表页面模式
- 搜索筛选 + 数据表格 + 分页
- 操作按钮：新增、编辑、删除

### 表单页面模式
- Card 布局 + React Hook Form + Zod 验证
- 保存、取消按钮

### 详情页面模式
- 分 Tab 显示不同信息
- 支持编辑模式切换
