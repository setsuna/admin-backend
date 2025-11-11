批量同步API使用说明（前端）
概述
批量同步API已改为异步模式，解决了之前SSE连接断开导致任务丢失的问题。现在创建批量任务会立即返回，所有子任务在后台异步创建。
调用流程
1. 创建批量任务（立即返回）
POST /api/v1/mount/sync/batch
请求体：
json{
  "meetingIds": ["meeting-id-1", "meeting-id-2"],
  "serialNumbers": ["WST300LX1000560", "WST300LX1000600"],
  "metadata": {}
}
立即返回：
json{
  "code": 200,
  "data": {
    "batchId": "batch_20251110_172109_abc123",
    "totalCount": 4,
    "status": "pending",
    "createdAt": 1699610469
  }
}
```

**注意：** 此时批量任务已创建，但子任务还在后台异步创建中。

---

### 2. 轮询批量任务状态（推荐间隔2秒）
```
GET /api/v1/mount/sync/batch/{batchId}/status
返回示例：
json{
  "code": 200,
  "data": {
    "batchId": "batch_20251110_172109_abc123",
    "status": "running",
    "totalCount": 4,
    "createdCount": 3,
    "statusCounts": {
      "pending": 0,
      "running": 1,
      "completed": 2,
      "failed": 0
    },
    "createdAt": 1699610469,
    "updatedAt": 1699610500,
    "duration": 31.5
  }
}
```

**字段说明：**
- `status`: 批量任务状态
  - `pending` - 等待中
  - `running` - 创建中/进行中
  - `completed` - 全部完成
  - `partial_failed` - 部分失败
- `totalCount`: 总任务数（会议数 × 设备数）
- `createdCount`: 已创建的子任务数
- `statusCounts`: 子任务状态统计
  - `pending`: 等待中
  - `running`: 进行中
  - `completed`: 已完成
  - `failed`: 失败

---

### 3. 获取所有子任务详情
```
GET /api/v1/mount/sync/batch/{batchId}/tasks
返回示例：
json{
  "code": 200,
  "data": {
    "batchId": "batch_20251110_172109_abc123",
    "tasks": [
      {
        "taskId": "task_20251110_172109_a68e8684",
        "meetingId": "meeting-id-1",
        "serialNumber": "WST300LX1000600",
        "status": "completed",
        "createdAt": "2025-11-10T17:21:09Z",
        "completedAt": "2025-11-10T17:21:50Z",
        "packageSize": 165905,
        "fileCount": 1
      },
      {
        "taskId": "task_20251110_172110_dd02f4ad",
        "meetingId": "meeting-id-1",
        "serialNumber": "WST300LX1000560",
        "status": "running",
        "createdAt": "2025-11-10T17:21:10Z"
      },
      {
        "meetingId": "meeting-id-2",
        "serialNumber": "WST300LX1000600",
        "status": "failed",
        "errorCode": 1001,
        "errorMessage": "设备未在线"
      }
    ]
  }
}
```

**子任务字段：**
- `taskId`: 子任务ID（成功创建才有）
- `status`: 子任务状态
- `errorCode` / `errorMessage`: 失败原因（失败时才有）

---

### 4. 查看单个任务实时进度（现有接口）
拿到子任务的 `taskId` 后，使用现有SSE接口查看实时进度：
```
GET /api/v1/mount/sync/tasks/{taskId}/progress/stream?serialNumber=WST300LX1000600
```

这个接口会推送进度事件，包含百分比、速度、预计剩余时间等。

---

### 5. 列出所有批量任务
```
GET /api/v1/mount/sync/batch
返回示例：
json{
  "code": 200,
  "data": {
    "tasks": [
      {
        "batchId": "batch_20251110_172109_abc123",
        "status": "completed",
        "totalCount": 4,
        "createdAt": "2025-11-10T17:21:09Z"
      }
    ],
    "total": 1
  }
}

前端展示建议
批量任务列表页面
显示所有批量任务，每个任务显示：

批量任务ID
创建时间
总任务数
完成进度（x/n）
状态标签

批量任务详情页面

顶部卡片：显示整体状态

总任务数
成功/失败/进行中数量
总耗时


子任务表格：显示所有子任务

会议ID
设备序列号
状态（带颜色标签）
进度条（如果正在进行）
失败原因（如果失败）
操作按钮：查看详细进度、重试


自动刷新：轮询 /batch/{batchId}/status 接口，每2秒刷新一次

实时进度展示
点击某个子任务的"查看进度"按钮后，打开弹窗：

建立SSE连接到 /tasks/{taskId}/progress/stream
显示实时进度条、速度、ETA
显示已拷贝/总字节数


核心改进点
✅ 不依赖连接 - 批量任务创建不受网络影响
✅ 随时查询 - 可以刷新页面后继续查看进度
✅ 不会丢失 - 即使断网，后台任务继续执行
✅ 灵活展示 - 可以轮询或SSE，任选方式