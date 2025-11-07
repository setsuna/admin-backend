# 会议包同步API快速参考

## 核心变化 🎯

### 旧版本（全局同步）
```json
POST /api/v1/mount/sync/meeting-package
{
  "meetingId": "meeting_001"
}
```
❌ **问题**: 同步到所有设备

### 新版本（指定设备）
```json
POST /api/v1/mount/sync/meeting-package
{
  "meetingId": "meeting_001",
  "serialNumber": "WST300LX1000560"  // 必填！
}
```
✅ **正确**: 只同步到指定设备

## 关键点 ⚠️

### 1. 设备序列号是必填项

```javascript
// ❌ 错误：缺少 serialNumber
{
  "meetingId": "meeting_001"
}

// ✅ 正确：包含设备序列号
{
  "meetingId": "meeting_001",
  "serialNumber": "WST300LX1000560"
}
```

### 2. 设备必须在线

```javascript
// 先查询在线设备
const devices = await fetch('/api/v1/mount/online-devices');

// 只能同步到在线设备
const onlineDevice = devices.data.items.find(d => 
  d.status === 1 && d.serialNumber === targetSerialNumber
);

if (!onlineDevice) {
  alert('设备未在线');
  return;
}
```

### 3. 目录结构

每个设备独立的同步目录：
```
/media/root1/WST300LX1000560/.fsync/    ← 设备 1
/media/root1/WST300LX1000561/.fsync/    ← 设备 2
```

## 完整流程 🔄

```javascript
// 1. 获取在线设备
const getOnlineDevices = async () => {
  const response = await fetch('/api/v1/mount/online-devices');
  return response.json();
};

// 2. 同步到指定设备
const syncToDevice = async (meetingId, serialNumber) => {
  const response = await fetch('/api/v1/mount/sync/meeting-package', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ meetingId, serialNumber })
  });
  return response.json();
};

// 3. 监听进度
const ws = new WebSocket('ws://localhost:8080/api/v1/ws');
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'sync_progress') {
    console.log(`进度: ${msg.data.progress}%`);
  }
};

// 4. 查询任务状态
const checkStatus = async (taskId) => {
  const response = await fetch(`/api/v1/mount/sync/tasks/${taskId}/status`);
  return response.json();
};
```

## 批量同步 📦

```javascript
// 同步到多个设备
const syncToMultipleDevices = async (meetingId, serialNumbers) => {
  const tasks = await Promise.all(
    serialNumbers.map(serialNumber =>
      syncToDevice(meetingId, serialNumber)
    )
  );
  
  console.log(`创建了 ${tasks.length} 个同步任务`);
  return tasks.map(t => t.data.taskId);
};

// 使用
const onlineDevices = ['WST300LX1000560', 'WST300LX1000561'];
const taskIds = await syncToMultipleDevices('meeting_001', onlineDevices);
```

## 错误处理 ❌

```javascript
try {
  await syncToDevice(meetingId, serialNumber);
} catch (error) {
  if (error.message.includes('未在线')) {
    console.error('设备离线');
  } else if (error.message.includes('未打包')) {
    console.error('会议尚未打包');
  } else {
    console.error('同步失败:', error);
  }
}
```

## 响应对比 📊

### 旧版本响应
```json
{
  "taskId": "task_abc123",
  "meetingId": "meeting_001",
  "status": "pending"
}
```

### 新版本响应
```json
{
  "taskId": "task_abc123",
  "meetingId": "meeting_001",
  "serialNumber": "WST300LX1000560",      // 新增
  "devicePath": "/media/root1/WST...",    // 新增
  "packagePath": "meeting_001.pkg",       // 新增
  "status": "pending"
}
```

## 常见错误 🔧

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| 参数错误 | 缺少 serialNumber | 添加设备序列号参数 |
| 目标设备未在线 | 设备离线 | 等待设备挂载或检查挂载状态 |
| 会议尚未打包 | 未调用打包接口 | 先调用 `/meetings/{id}/pack` |
| 获取挂载路径失败 | 路径不存在 | 检查设备是否正确挂载 |

## React Hook 示例 ⚛️

```javascript
function useMeetingSync(meetingId) {
  const [devices, setDevices] = useState([]);
  const [progress, setProgress] = useState({});
  
  // 获取在线设备
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/v1/mount/online-devices');
      const data = await res.json();
      setDevices(data.data.items.filter(d => d.status === 1));
    }
    load();
  }, []);
  
  // 监听进度
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/api/v1/ws');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'sync_progress') {
        setProgress(prev => ({
          ...prev,
          [msg.data.task_id]: msg.data
        }));
      }
    };
    return () => ws.close();
  }, []);
  
  // 同步函数
  const syncToDevice = async (serialNumber) => {
    const res = await fetch('/api/v1/mount/sync/meeting-package', {
      method: 'POST',
      body: JSON.stringify({ meetingId, serialNumber })
    });
    return res.json();
  };
  
  return { devices, progress, syncToDevice };
}

// 使用
function MeetingSync({ meetingId }) {
  const { devices, progress, syncToDevice } = useMeetingSync(meetingId);
  
  return (
    <div>
      {devices.map(device => (
        <button 
          key={device.serialNumber}
          onClick={() => syncToDevice(device.serialNumber)}
        >
          同步到 {device.serialNumber}
        </button>
      ))}
    </div>
  );
}
```

## 测试清单 ✅

- [ ] 设备序列号参数验证
- [ ] 设备在线状态检查
- [ ] 会议打包状态验证
- [ ] 单设备同步成功
- [ ] 多设备并发同步
- [ ] 设备离线错误处理
- [ ] 进度实时更新
- [ ] WebSocket 推送接收
- [ ] 任务状态查询
- [ ] 错误重试机制

## 迁移检查 🔄

从旧版本迁移到新版本需要检查：

1. ✅ 所有调用都添加了 `serialNumber` 参数
2. ✅ 添加了设备选择UI组件
3. ✅ 更新了错误处理逻辑（新增设备离线错误）
4. ✅ 响应数据结构适配（新增字段）
5. ✅ 批量同步逻辑改为遍历设备列表

## 配置建议 ⚙️

```toml
[mount]
enabled = true
base_path = "/media"

# 每个设备2个Worker（避免资源耗尽）
max_concurrent_tasks = 2

# 队列适中即可
task_queue_size = 50

# 进度更新频率
progress_update_interval = "500ms"
progress_update_bytes = 1048576  # 1MB
```