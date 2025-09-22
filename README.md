# Admin Backend

一个现代化的管理后台系统，基于 React + TypeScript + Tailwind CSS 构建，集成完整的认证、权限管理、数据字典等功能。

## 🚀 特性

- **现代化技术栈**: React 18 + TypeScript + Vite + TailwindCSS
- **完整认证系统**: 登录/登出、Token管理、权限控制
- **优雅的UI**: shadcn/ui 风格的设计系统
- **权限管理**: 基于角色的访问控制(RBAC)
- **数据管理**: TanStack Query + Zustand
- **功能齐全**: 用户管理、部门管理、数据字典、会议管理

## 📦 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🏗️ 项目架构

```
src/
├── components/          # 组件库
│   ├── ui/             # 基础UI组件 (Button, Card, Modal等)
│   ├── features/       # 业务功能组件
│   └── layouts/        # 布局组件 (Header, Sidebar, MainLayout)
├── pages/              # 页面组件 (LoginPage等)
├── services/           # API服务层
│   ├── core/          # 核心服务 (认证、HTTP客户端)
│   ├── api.ts         # API拦截器和基础配置
│   ├── auth.ts        # 认证服务 [已迁移到core/auth.service.ts]
│   ├── user.ts        # 用户相关API
│   ├── dict.ts        # 数据字典API
│   └── permission.ts  # 权限管理API
├── hooks/              # 自定义Hooks
│   ├── usePermission.ts    # 权限管理Hook
│   ├── useUser.ts         # 用户管理Hook
│   └── useModal.ts        # 模态框Hook
├── store/              # 状态管理 (Zustand)
│   └── index.ts       # 全局状态、设备状态、权限状态
├── types/              # TypeScript类型定义
├── config/             # 配置文件
│   ├── env.config.ts       # 环境配置
│   ├── api.config.ts       # API配置
│   └── auth.config.ts      # 认证配置
├── utils/              # 工具函数
└── styles/             # 样式文件
```

## 🎨 设计系统

项目采用现代化设计系统：

- **主题系统**: Light/Dark/System 多主题支持
- **组件库**: 基于 Tailwind CSS 的可复用组件
- **响应式**: 完整的移动端适配
- **无障碍**: 符合 WAI-ARIA 标准

## 🔐 认证与权限

### 认证流程
- **登录**: 支持用户名/密码登录
- **Token管理**: JWT Token + Refresh Token
- **状态持久化**: localStorage + Zustand store
- **自动刷新**: Token过期前自动刷新

### 权限系统
- **基于角色**: Admin, User, Meeting_Admin, Auditor, Security_Admin
- **动态菜单**: 根据权限动态生成菜单
- **路由守卫**: 页面级别的权限控制
- **API权限**: 请求拦截器自动添加认证头

### 核心服务
```typescript
// 认证服务 (新架构)
import { authService, auth } from '@/services/core/auth.service'

// 使用示例
const result = await auth.login({ username, password })
const user = await auth.getCurrentUser()
const hasPermission = authService.hasPermission('user:read')
```

## 🛠️ 核心功能

### 用户管理
- 用户CRUD操作
- 角色分配
- 状态管理 (激活/停用)
- 密级管理
- 批量操作

### 组织管理
- 部门树形结构管理
- 部门层级关系
- 员工与部门关联

### 数据字典
- 系统配置管理
- 菜单配置
- 枚举值管理
- 多级字典支持

### 会议管理
- 会议创建/编辑
- 参会人员管理
- 会议材料管理
- 会议状态跟踪

### 权限管理
- 权限分组管理
- 角色权限矩阵
- 权限调试器 (开发环境)

## 📡 API集成

### 请求配置
```typescript
// API基础配置
baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
timeout: 10000

// 认证头自动添加
Authorization: Bearer ${token}
```

### 错误处理
- 统一错误拦截
- 401自动跳转登录
- 业务错误提示
- 网络错误处理

## 🔧 开发指南

### 📝 AI 开发指导

**重要提醒：在使用 AI 工具协助开发时，请务必遵循以下原则：**

#### 导入规范
```typescript
// ✅ 正确：直接导入UI组件
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// ❌ 禁止：通过index.ts导入(会导致循环依赖)
import { Button, Card } from '@/components/ui'
```

#### 认证服务使用
```typescript
// ✅ 推荐：使用新架构
import { authService, auth } from '@/services/core/auth.service'

// ❌ 已废弃：旧的auth.ts已迁移
import { auth } from '@/services/auth'
```

### 添加新功能

1. **新页面**: `src/pages/` + 路由配置
2. **新API**: `src/services/` + 类型定义
3. **新组件**: `src/components/ui/` 或 `src/components/features/`
4. **新权限**: 在权限配置中添加权限码

### 状态管理规范

```typescript
// 全局状态 - Zustand
const { user, setUser } = useGlobalStore()

// 服务器状态 - TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: userApi.getUsers
})

// 权限状态
const { hasPermission } = usePermission()
```

## 🌐 环境配置

### 开发环境
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_ENABLE_MOCK=false
VITE_REQUEST_TIMEOUT=10000
```

### 生产环境
```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_ENABLE_MOCK=false
VITE_REQUEST_TIMEOUT=30000
```

## 🎯 最佳实践

### 代码组织
- 功能模块化，避免大文件
- 组件单一职责
- Hook复用逻辑
- 类型优先开发

### 性能优化
- React.memo 包装纯组件
- useMemo/useCallback 优化计算
- 路由懒加载
- 图片懒加载

### 安全考虑
- Token安全存储
- API权限验证
- XSS防护
- CSRF防护

## 🚦 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 📱 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 📋 TODO

- [ ] 单元测试覆盖
- [ ] E2E测试
- [ ] 国际化支持
- [ ] PWA支持
- [ ] Docker部署
- [ ] 监控告警
- [ ] 性能优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 更新日志

### v1.0.0 (Latest)
- ✅ 完成认证架构重构
- ✅ 废弃旧的auth.ts，迁移到core/auth.service.ts
- ✅ 统一Token管理配置
- ✅ 优化权限系统集成
- ✅ 修复循环依赖问题
- ✅ 完善类型定义

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
