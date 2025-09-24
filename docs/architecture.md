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

**本架构文档随项目演进持续更新，请确保团队成员都能访问到最新版本。**