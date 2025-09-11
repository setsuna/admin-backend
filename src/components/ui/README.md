# 提示框组件使用说明

本项目提供了完整的提示框组件系统，用于替代浏览器原生的 `alert`、`confirm` 等方法。

## 组件概览

### 1. Modal 基础组件
- `Modal`: 基础模态框组件
- `AlertModal`: 警告/信息提示框
- `ConfirmModal`: 确认对话框

### 2. Hook
- `useModal`: 基础模态框状态管理
- `useDialog`: 对话框管理（alert 和 confirm）

### 3. 全局提供者
- `DialogProvider`: 全局对话框提供者
- `useGlobalDialog`: 全局对话框 hook
- `showAlert`: 全局 alert 方法
- `showConfirm`: 全局 confirm 方法

## 使用方法

### 方法一：在组件中直接使用

```tsx
import { useDialog } from '@/hooks'

const MyComponent = () => {
  const { alert, confirm, AlertComponent, ConfirmComponent } = useDialog()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '确定要删除吗？',
      message: '删除后无法恢复',
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消'
    })
    
    if (confirmed) {
      // 执行删除操作
    }
  }

  const handleError = async () => {
    await alert({
      type: 'error',
      title: '操作失败',
      message: '请检查网络连接后重试'
    })
  }

  return (
    <div>
      {/* 你的组件内容 */}
      <button onClick={handleDelete}>删除</button>
      
      {/* 必须包含这两个组件 */}
      <AlertComponent />
      <ConfirmComponent />
    </div>
  )
}
```

### 方法二：使用全局提供者（推荐）

1. 在 App 根组件中包装 DialogProvider：

```tsx
import { DialogProvider } from '@/components/ui'

function App() {
  return (
    <DialogProvider>
      {/* 你的应用内容 */}
    </DialogProvider>
  )
}
```

2. 在任何组件中使用：

```tsx
import { useGlobalDialog } from '@/components/ui'

const MyComponent = () => {
  const { alert, confirm } = useGlobalDialog()

  const handleAction = async () => {
    await alert({
      type: 'success',
      title: '操作成功',
      message: '数据已保存'
    })
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '确认删除',
      message: '此操作不可撤销',
      type: 'danger'
    })
    
    if (confirmed) {
      // 执行删除
    }
  }

  return (
    <div>
      <button onClick={handleAction}>保存</button>
      <button onClick={handleDelete}>删除</button>
    </div>
  )
}
```

3. 或者使用便捷的全局方法：

```tsx
import { showAlert, showConfirm } from '@/components/ui'

// 在任何地方调用
await showAlert({
  type: 'info',
  title: '提示',
  message: '请先登录'
})

const confirmed = await showConfirm({
  title: '确认操作',
  message: '是否继续？'
})
```

## API 参考

### AlertOptions
```typescript
interface AlertOptions {
  type?: 'info' | 'warning' | 'error' | 'success'
  title: string
  message?: string
  confirmText?: string
}
```

### ConfirmOptions
```typescript
interface ConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}
```

## 迁移指南

### 替换浏览器原生方法

| 原生方法 | 新方法 |
|---------|--------|
| `alert('消息')` | `await alert({ title: '提示', message: '消息' })` |
| `confirm('确认吗？')` | `await confirm({ title: '确认吗？' })` |
| `window.alert()` | `await showAlert()` |
| `window.confirm()` | `await showConfirm()` |

### 示例迁移

**之前：**
```tsx
if (window.confirm('确定要删除吗？')) {
  // 删除操作
}
```

**之后：**
```tsx
const confirmed = await confirm({
  title: '确定要删除吗？',
  type: 'danger',
  confirmText: '删除',
  cancelText: '取消'
})

if (confirmed) {
  // 删除操作
}
```

## 样式定制

组件使用 Tailwind CSS，支持暗色模式。可以通过修改组件源码来自定义样式。

## 注意事项

1. 所有对话框方法都是异步的，记得使用 `await`
2. 使用 `useDialog` 时必须在组件中包含 `AlertComponent` 和 `ConfirmComponent`
3. 使用全局方法前确保 `DialogProvider` 已挂载
4. 组件会自动处理 ESC 键关闭和遮罩层点击关闭
