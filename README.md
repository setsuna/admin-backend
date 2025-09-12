# Admin Backend

一个现代化的管理后台种子项目，基于 React + TypeScript + Tailwind CSS 构建。

## 🚀 特性

- **现代化技术栈**: React 18 + TypeScript + Vite
- **优雅的UI**: Tailwind CSS + shadcn/ui 风格的设计系统
- **数据管理**: TanStack Query + Zustand
- **功能完整**: CRUD操作、YAML编辑、实时状态、设备管理
- **开发友好**: 完整的TypeScript类型定义、ESLint配置
- **长期维护**: 清晰的目录结构、组件化架构

## 📦 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览打包结果
npm run preview
```

## 🏗️ 项目结构

```
src/
├── components/          # 组件库
│   ├── ui/             # 基础UI组件
│   ├── features/       # 功能组件
│   └── layouts/        # 布局组件
├── pages/              # 页面组件
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── store/              # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── styles/             # 样式文件
```

## 🎨 设计系统

项目采用基于 Tailwind CSS 的设计系统，包含：

- **色彩系统**: 语义化的颜色变量
- **空间系统**: 一致的间距规范
- **组件库**: 可复用的UI组件
- **深色模式**: 完整的主题切换支持

## 🔧 核心功能

### 设备管理
- 设备列表展示
- 实时状态监控
- 设备操作（重启、配置等）
- 状态统计图表

### 配置管理
- YAML文件编辑
- 语法高亮和验证
- 配置导入/导出
- 版本管理

### 实时通信
- WebSocket连接管理
- 设备状态实时更新
- 系统通知推送

## 🛠️ 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/router.tsx` 添加路由配置
3. 在侧边栏添加导航链接

### 添加新组件

1. UI组件放在 `src/components/ui/`
2. 功能组件放在 `src/components/features/`
3. 在对应的 `index.ts` 文件中导出

### 状态管理

- 全局状态使用 Zustand
- 服务器状态使用 TanStack Query
- 本地状态使用 React useState

### API集成

1. 在 `src/services/` 添加API服务
2. 在 `src/hooks/` 创建对应的数据hooks
3. 在 `src/types/` 定义类型接口

## 🌐 后端集成

项目默认配置了与Go Gin后端的集成：

- API代理: `/api` -> `http://localhost:8080`
- WebSocket: `/ws` -> `ws://localhost:8080`
- 认证: Bearer Token

## 📱 响应式设计

- 移动端友好的布局
- 侧边栏自适应折叠
- 表格响应式处理

## 🚦 开发模式

```bash
# 开发模式
npm run dev

# 类型检查
npm run lint

# 构建预览
npm run preview
```

## 📝 TODO

- [ ] 用户管理页面
- [ ] 数据分析页面
- [ ] 系统设置页面
- [ ] 多语言支持
- [ ] 单元测试
- [ ] E2E测试

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
