# 代码Review清单

## 📋 Overview

本清单基于重构后的新架构设计，确保代码质量符合企业级标准。请在每次代码review时使用此清单。

## 🏗️ 架构一致性检查

### ✅ 导入路径规范
- [ ] **UI组件直接导入**: 使用 `import { Button } from '@/components/ui/Button'`，禁止 `from '@/components/ui'`
- [ ] **业务组件路径正确**: 按业务域导入，如 `@/components/business/user/UserCard`
- [ ] **Hooks直接导入**: 使用 `import { usePermission } from '@/hooks/usePermission'`，禁止 `from '@/hooks'`
- [ ] **类型导入规范**: 优先使用 `import type { User, Meeting } from '@/types'`
- [ ] **服务导入统一**: 推荐使用 `import { userService } from '@/services'`

### ✅ 文件组织结构
- [ ] **组件按业务域分组**: 新业务组件放在对应的 `business/{domain}/` 目录
- [ ] **类型定义位置正确**: API类型在 `types/api/`，业务类型在 `types/domain/`
- [ ] **服务层结构清晰**: 核心服务在 `core/`，业务服务在根目录，API服务在 `api/`
- [ ] **配置文件统一**: 使用 `@/config` 统一配置，不直接使用环境变量

### ✅ 循环依赖检查
- [ ] **无index.ts统一导出**: 组件和hooks目录不应有index.ts文件
- [ ] **导入路径不形成环**: 检查是否存在A→B→A的导入关系
- [ ] **层级关系清晰**: 上层可以导入下层，下层不能导入上层

---

**请确保每次代码review都认真对照此清单，维护项目的高质量标准！** 🎯