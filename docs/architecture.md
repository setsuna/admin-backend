# 架构设计文档

## 📋 概述

本文档详细说明了Admin Backend项目经过六阶段重构后的最终架构设计。该架构旨在提供企业级的代码质量、可维护性和可扩展性。

## 🏗️ 整体架构设计

### 架构原则

1. **单一职责原则**: 每个模块、文件、函数都有明确的单一职责
2. **关注点分离**: 不同层级处理不同的关注点，避免耦合
3. **依赖倒置**: 高层模块不依赖低层模块，都依赖抽象
4. **开闭原则**: 对扩展开放，对修改封闭
5. **类型安全**: 全链路TypeScript类型检查

### 分层架构

```
┌─────────────────────────────────────────┐
│                Pages                    │  页面层 - 路由和页面组件
├─────────────────────────────────────────┤
│              Components                 │  组件层 - UI组件和业务组件
├─────────────────────────────────────────┤
│                Hooks                    │  Hooks层 - 业务逻辑封装
├─────────────────────────────────────────┤
│                Store                    │  状态层 - 全局状态管理
├─────────────────────────────────────────┤
│               Services                  │  服务层 - API调用和业务服务
├─────────────────────────────────────────┤
│                Types                    │  类型层 - TypeScript类型定义
├─────────────────────────────────────────┤
│                Config                   │  配置层 - 应用配置管理
├─────────────────────────────────────────┤
│                Utils                    │  工具层 - 通用工具函数
└─────────────────────────────────────────┘
```

## 📁 详细架构说明

### 1. 组件层 (Components)

#### 设计理念
- **分层设计**: ui → business → features → layouts
- **业务域分组**: 按用户、会议、权限等业务域组织
- **直接导入**: 避免循环依赖，明确依赖关系

#### 目录结构
```
components/
├── ui/                 # 基础UI组件
│   ├── Button.tsx     # 按钮组件
│   ├── Card.tsx       # 卡片组件
│   ├── Modal.tsx      # 模态框组件
│   └── ...
├── business/          # 业务组件 (按业务域分组)
│   ├── user/         # 用户相关业务组件
│   │   ├── UserCard.tsx
│   │   ├── UserForm.tsx
│   │   └── RoleSelect.tsx
│   ├── meeting/      # 会议相关业务组件
│   │   ├── MeetingCard.tsx
│   │   ├── AgendaForm.tsx
│   │   └── ParticipantSelector.tsx
│   ├── permission/   # 权限相关业务组件
│   │   ├── PermissionGuard.tsx
│   │   ├── PermissionCheck.tsx
│   │   └── PermissionDebugger.tsx
│   └── department/   # 部门相关业务组件
├── features/         # 功能特性组件
│   ├── DataTable.tsx
│   ├── StatsCard.tsx
│   └── ...
└── layouts/          # 布局组件
    ├── MainLayout.tsx
    ├── Header.tsx
    └── Sidebar.tsx
```

#### 使用规范
```typescript
// ✅ 正确的导入方式
import { Button } from '@/components/ui/Button'
import { UserCard } from '@/components/business/user/UserCard'
import { PermissionGuard } from '@/components/business/permission/PermissionGuard'

// ❌ 禁止的导入方式 (会导致循环依赖)
import { Button, Card } from '@/components/ui'  // 已移除
import { UserCard } from '@/components'         // 已移除
```

---

### 2. 服务层 (Services)

#### 设计理念
- **分层架构**: Core服务 → API服务 → Business服务
- **统一HTTP客户端**: 所有请求使用统一的 httpClient
- **自动数据提取**: httpClient 自动提取 response.data.data
- **类型安全**: 完整的 TypeScript 类型支持

#### 目录结构
```
services/
├── core/              # 核心服务
│   ├── http.client.ts   # 统一HTTP客户端
│   ├── auth.service.ts  # 认证服务
│   ├── error.handler.ts # 错误处理器
│   └── interceptors.ts  # 请求/响应拦截器
├── api/               # API服务层
│   ├── dict.api.ts      # 字典API服务
│   ├── user.api.ts      # 用户API服务
│   └── meeting.api.ts   # 会议API服务
└── *.ts               # 业务服务层
    ├── dict.ts          # 字典业务服务
    ├── user.ts          # 用户业务服务
    └── meeting.ts       # 会议业务服务
```

#### ⚠️ 关键开发规则（必须遵守）

**重要：httpClient 已经自动提取了 response.data.data，不需要再次访问 .data**

```typescript
// ✅ 正确：API服务层直接返回 httpClient 的结果
export class DictApiService {
  private basePath = API_PATHS.DICTIONARIES

  async getDictionaries(
    filters: DictFilters,
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<DataDict>> {
    // httpClient.get 已经返回 response.data.data，直接返回
    return await httpClient.get<PaginatedResponse<DataDict>>(this.basePath, {
      ...filters,
      page,
      pageSize
    })
  }
  
  async getDictionary(id: string): Promise<DataDict> {
    // 直接返回，不需要 .data
    return await httpClient.get<DataDict>(`${this.basePath}/${id}`)
  }
  
  async createDictionary(data: CreateDictRequest): Promise<DataDict> {
    // POST/PUT/PATCH/DELETE 同样直接返回
    return await httpClient.post<DataDict>(this.basePath, data)
  }
}

// ❌ 错误：不要再次访问 .data
export class DictApiService {
  async getDictionaries(...): Promise<PaginatedResponse<DataDict>> {
    const response = await httpClient.get<PaginatedResponse<DataDict>>(...)
    return response.data  // ❌ 错误！会返回 undefined
  }
}
```

**原理说明：**

1. **后端返回的标准格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": { "items": [...], "pagination": {...} },
  "timestamp": 1234567890
}
```

2. **httpClient 的内部处理** (http.client.ts)：
```typescript
async get<T>(url: string, params?: any): Promise<T> {
  const response = await this.instance.get(url, { params })
  // 自动提取 data 字段
  return response.data?.data || response.data
}
```

3. **API服务层得到的已经是最终数据**：
```typescript
{ items: [...], pagination: {...} }  // 已经是业务数据
```

**所有 httpClient 方法都遵循此规则：**
- `httpClient.get<T>()` → 直接返回 `T`
- `httpClient.post<T>()` → 直接返回 `T`
- `httpClient.put<T>()` → 直接返回 `T`
- `httpClient.patch<T>()` → 直接返回 `T`
- `httpClient.delete<T>()` → 直接返回 `T`

#### 使用规范
```typescript
// ✅ 正确：在页面或组件中使用
import { dictApi } from '@/services/dict'
import { userApi } from '@/services/user'

// API调用
const response = await dictApi.getDictionaries(filters, page, pageSize)
// response 已经是 { items: [...], pagination: {...} }
setDictionaries(response.items)

// ❌ 错误：不要再次访问 .data
const response = await dictApi.getDictionaries(filters, page, pageSize)
setDictionaries(response.data.items)  // ❌ response.data 是 undefined
```

---

**本架构文档随项目演进持续更新，请确保团队成员都能访问到最新版本。**