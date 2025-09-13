# 权限管理系统

权限管理混合方案的实现文档。本系统实现了菜单字典与权限系统的分离关注点设计。

## 🎯 设计理念

**混合方案核心**：菜单字典负责界面结构，权限系统负责访问控制

```
用户 → 角色 → 权限 → 资源(菜单)
```

## 📁 文件结构

```
src/
├── types/index.ts                    # 权限相关类型定义
├── services/
│   ├── permission.ts                # 权限服务
│   └── mock/dictData.ts             # 菜单字典数据
├── components/
│   ├── PermissionGuard.tsx          # 路由权限守卫
│   ├── PermissionCheck.tsx          # 组件级权限验证
│   └── PermissionDebugger.tsx       # 开发调试工具
├── pages/permission/
│   ├── PermissionManagePage.tsx     # 权限管理页面
│   └── PermissionDemoPage.tsx       # 权限功能演示
├── hooks/usePermission.ts           # 权限钩子
└── router.tsx                       # 路由配置
```

## 🚀 核心功能

### 1. 菜单字典声明权限需求

菜单配置中只声明需要什么权限，不管理权限本身：

```typescript
{
  key: 'data-dictionary',
  label: '数据字典',
  icon: 'Book',
  path: '/data-dictionary',
  permissions: ['system:dict:read'], // 只声明权限需求
  group: 'system'
}
```

### 2. 权限系统管理权限分配

扩展的权限数据结构支持细粒度控制：

```typescript
interface Permission {
  id: string
  name: string
  code: string
  category: string        // 权限分类
  resource: string        // 资源标识
  action: 'read' | 'write' | 'delete' | 'manage' // 操作类型
  description?: string
}
```

### 3. 角色权限矩阵管理

通过 `/role-permissions` 页面可以：
- 查看所有角色和权限的矩阵关系
- 动态编辑角色权限
- 创建、编辑、删除角色
- 按权限组批量分配权限

## 🛠️ 使用方法

### 路由级权限控制

```tsx
<PermissionGuard permissions={['system:dict:read']}>
  <DataDictionaryPage />
</PermissionGuard>
```

### 组件级权限控制

```tsx
import { PermissionCheck, PermissionButton } from '@/components'

// 基础权限检查
<PermissionCheck 
  permissions={['personnel:write']}
  fallback={<div>权限不足</div>}
>
  <EditButton />
</PermissionCheck>

// 权限按钮
<PermissionButton
  permissions={['personnel:delete']}
  onClick={handleDelete}
  className="btn-danger"
>
  删除用户
</PermissionButton>
```

### 权限钩子使用

```tsx
import { usePermission, usePermissionState } from '@/hooks'

function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermission()
  const { canRead, canWrite, canDelete } = usePermissionState([
    'personnel:read', 
    'personnel:write', 
    'personnel:delete'
  ])

  if (!canRead) return null

  return (
    <div>
      {canWrite && <EditForm />}
      {canDelete && <DeleteButton />}
    </div>
  )
}
```

### 批量权限检查

```tsx
import { useBatchPermissionCheck } from '@/components'

function AdminPanel() {
  const permissions = useBatchPermissionCheck({
    canViewUsers: ['personnel:read'],
    canEditUsers: ['personnel:write'],
    canManageRoles: ['role:manage'],
    canViewLogs: ['system:logs:read']
  })

  return (
    <div>
      {permissions.canViewUsers && <UserList />}
      {permissions.canEditUsers && <UserEditForm />}
      {permissions.canManageRoles && <RoleManager />}
      {permissions.canViewLogs && <LogViewer />}
    </div>
  )
}
```

## 🎯 权限代码规范

权限代码采用层次化命名：

```
{资源}:{操作}[:{详细操作}]

示例：
- dashboard:view           # 仪表板查看
- meeting:read            # 会议读取
- meeting:write           # 会议创建/编辑
- meeting:delete          # 会议删除
- meeting:manage          # 会议全面管理
- system:dict:read        # 数据字典读取
- system:dict:manage      # 数据字典管理
- logs:admin:read         # 管理员日志查看
```

## 🔧 开发调试

### 权限调试器

开发环境下会显示权限调试器，提供：
- 当前用户信息
- 用户权限列表
- 可见菜单信息
- 系统权限和角色信息
- 权限测试工具
- 调试数据导出

### 权限演示页面

访问 `/permission-demo` 查看各种权限验证组件的使用示例。

## 📋 角色权限预设

### 系统管理员 (admin)
- 拥有所有权限
- 可以管理用户、角色、系统配置

### 会议管理员 (meeting_admin)
- 会议相关的读写权限
- 人员管理权限
- 同步状态查看权限

### 普通用户 (user)
- 基础查看权限
- 会议读取权限
- 同步状态查看权限

### 审计员 (auditor)
- 日志查看权限
- 监控告警权限
- 部分业务数据查看权限

## 🔄 权限继承和组合

权限系统支持：
- **权限继承**：manage 权限自动包含 read/write/delete 权限
- **权限组合**：可以同时检查多个权限（AND/OR 逻辑）
- **降级处理**：菜单字典读取失败时使用最小化菜单

## 🎨 自定义扩展

### 添加新权限

1. 在 `services/permission.ts` 的 `mockPermissions` 中添加权限定义
2. 在对应角色的 `permissions` 数组中添加权限代码
3. 在菜单字典或组件中声明权限需求

### 添加新角色

1. 在 `services/permission.ts` 的 `mockRoles` 中添加角色定义
2. 在权限管理页面中分配相应权限

### 自定义权限验证逻辑

可以在 `PermissionCheck` 组件或 `usePermission` 钩子中扩展验证逻辑。

## 🚀 最佳实践

1. **最小权限原则**：只给用户必需的权限
2. **权限分组**：按功能模块组织权限
3. **降级友好**：提供合适的权限不足提示
4. **开发调试**：使用权限调试器验证权限配置
5. **权限测试**：在权限演示页面测试各种场景

## 🔧 技术实现

- **权限缓存**：使用 React Query 缓存权限数据
- **菜单构建**：从数据字典动态构建菜单
- **权限验证**：运行时权限匹配检查
- **状态管理**：Zustand 管理权限状态
- **类型安全**：完整的 TypeScript 类型定义

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 完成权限数据结构设计
- ✅ 实现菜单字典与权限分离
- ✅ 创建权限管理页面
- ✅ 开发权限验证组件
- ✅ 添加权限调试工具
- ✅ 完成权限演示页面
- ✅ 更新路由权限配置

### 计划功能
- 🔄 权限继承机制优化
- 🔄 权限模板功能
- 🔄 权限变更审计日志
- 🔄 角色权限批量导入/导出
- 🔄 动态权限刷新机制
