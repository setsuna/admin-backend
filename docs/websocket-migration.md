# WebSocket 框架重构迁移指南

## 📋 重构概述

WebSocket 框架已完成重构，采用**分层 + 插件化**设计，解决以下问题：

✅ **代码重复** - 删除重复实现，统一使用新架构  
✅ **职责清晰** - 分离基础设施和业务逻辑  
✅ **扩展灵活** - 插件化消息处理，易于扩展  
✅ **性能优化** - 精确订阅，避免不必要的重渲染  
✅ **类型安全** - 完整的 TypeScript 支持

## 🏗️ 新架构

```
src/services/websocket/
├── client.ts              # 核心客户端（连接、重连、消息分发）
├── handlers/              # 消息处理器（插件化）
│   ├── device.handler.ts      # 设备消息
│   ├── notification.handler.ts # 系统通知
│   └── meeting.handler.ts     # 会议消息
├── hooks/                 # React Hooks
│   ├── useWSConnection.ts     # 连接管理（顶层使用）
│   └── useWSSubscription.ts   # 消息订阅（业务组件使用）
├── types.ts              # 类型定义
└── index.ts              # 统一导出
```

## 🔄 迁移步骤

### 1. 更新顶层组件

**之前（/src/hooks/useWebSocket.ts）：**
```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

function App() {
  useWebSocket()  // ❌ 旧的Hook
  return <Router />
}
```

**现在：**
```typescript
import { useWSConnection } from '@/services/websocket'

function App() {
  useWSConnection()  // ✅ 新的Hook
  return <Router />
}
```

### 2. 业务组件订阅消息（新功能）

现在可以在任何组件灵活订阅特定消息：

```typescript
import { useWSSubscription } from '@/services/websocket'

// 订阅单个消息类型
function DevicePage() {
  useWSSubscription('device_online', (message) => {
    console.log('Device online:', message.data)
    // 刷新设备列表
    refetchDevices()
  })
  
  return <DeviceList />
}

// 订阅多个消息类型
function MeetingPage() {
  useWSSubscription(['meeting_create', 'meeting_update', 'meeting_delete'], (message) => {
    console.log('Meeting changed:', message)
    // 刷新会议列表
    refetchMeetings()
  })
  
  return <MeetingList />
}

// 订阅所有消息（用于调试）
function DebugPanel() {
  useWSSubscription('*', (message) => {
    console.log('WS message:', message)
  })
  
  return <pre>{JSON.stringify(messages, null, 2)}</pre>
}
```

### 3. 监听连接状态

```typescript
import { useWSState } from '@/services/websocket'

function StatusIndicator() {
  const { isConnected, isConnecting, state } = useWSState()
  
  return (
    <div className="status-indicator">
      {isConnecting && '连接中...'}
      {isConnected && '已连接'}
      {!isConnected && !isConnecting && '未连接'}
    </div>
  )
}
```

### 4. 添加自定义消息处理器（扩展）

如果需要处理新的消息类型：

```typescript
// 1. 创建新的处理器
// src/services/websocket/handlers/custom.handler.ts
import type { WSMessage } from '../types'

export class CustomMessageHandler {
  private onCustomEvent?: (data: any) => void

  setCallbacks(callbacks: {
    onCustomEvent?: (data: any) => void
  }) {
    this.onCustomEvent = callbacks.onCustomEvent
  }

  handleCustomMessage(message: WSMessage<any>): void {
    console.log('[Handler] Custom message:', message.data)
    this.onCustomEvent?.(message.data)
  }
}

export const customHandler = new CustomMessageHandler()

// 2. 在 useWSConnection 中注册
import { customHandler } from '../handlers/custom.handler'

customHandler.setCallbacks({
  onCustomEvent: (data) => {
    console.log('Custom event:', data)
  }
})

const unsubscribeCustom = wsClient.on('custom_event', customHandler.handleCustomMessage.bind(customHandler))
```

## ✨ 新特性

### 1. 类型安全的消息订阅

```typescript
import type { DeviceOnlineData } from '@/services/websocket'

// 泛型支持，自动推导消息数据类型
useWSSubscription<DeviceOnlineData>('device_online', (message) => {
  // message.data 自动推导为 DeviceOnlineData
  console.log(message.data.serialNumber)
})
```

### 2. 自动字段命名转换

后端返回的 `snake_case` 字段自动转换为 `camelCase`：

```typescript
// 后端返回
{ task_id: '123', current_file: 'test.txt' }

// 前端接收
{ taskId: '123', currentFile: 'test.txt' }
```

### 3. 更好的日志

所有日志统一使用 `[WS]` 前缀，便于过滤：

```
[WS] Initializing connection...
[WS] Connected
[WS] State: connecting → connected
[Handler] Device online: {...}
```

### 4. 独立的音效管理

音效处理从业务逻辑中分离，在处理器中统一管理。

## 📊 性能优化

### 避免不必要的重渲染

**之前：**
```typescript
const { addNotification } = useUI()  // ❌ 订阅了整个 UI state
```

**现在：**
```typescript
const addNotification = useStore((state) => state.addNotification)  // ✅ 只订阅方法
```

### 精确订阅

只订阅需要的消息类型，不监听无关消息。

## 🔧 兼容性

旧的 `/src/hooks/useWebSocket.ts` 已更新为新架构，保持 API 不变，现有代码无需修改。

但**强烈建议**迁移到新的 Hook，以获得更好的灵活性和性能。

## 📝 最佳实践

### DO ✅

```typescript
// ✅ 在顶层组件初始化连接一次
function App() {
  useWSConnection()
  return <Router />
}

// ✅ 在业务组件订阅特定消息
function DevicePage() {
  useWSSubscription('device_online', handleDeviceOnline)
}

// ✅ 只订阅需要的状态
const addNotification = useStore(state => state.addNotification)

// ✅ 使用类型泛型
useWSSubscription<DeviceOnlineData>('device_online', handler)
```

### DON'T ❌

```typescript
// ❌ 不要在多个组件调用 useWSConnection
function ComponentA() {
  useWSConnection()  // 错误！
}

// ❌ 不要订阅不需要的状态
const { theme, notifications, ...everything } = useUI()  // 过度订阅

// ❌ 不要在处理器中执行耗时操作
wsClient.on('message', async (msg) => {
  await heavyOperation()  // 阻塞其他消息
})
```

## 🗑️ 废弃文件

以下文件已废弃，将在下一版本删除：

- ❌ `/src/services/core/websocket.service.ts` → 使用 `/src/services/websocket/client.ts`
- ❌ `/src/services/websocket.ts` → 使用 `/src/services/websocket/`
- ❌ `/src/types/common/websocket.types.ts` → 使用 `/src/services/websocket/types.ts`

## 🆘 遇到问题？

1. **连接不上？** 检查 token 是否有效，查看控制台 `[WS]` 日志
2. **收不到消息？** 确认消息类型是否正确，检查是否正确订阅
3. **页面重渲染？** 检查是否只订阅方法，不订阅状态数据
4. **类型报错？** 确保从正确的路径导入类型

---

**迁移完成后，请删除旧文件并更新 `/src/hooks/useWebSocket.ts` 的导入路径。**
