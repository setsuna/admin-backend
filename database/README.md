# 操作日志数据库设计文档

## 📋 概述

本数据库设计用于支持系统的操作日志功能，包括：
- **应用日志**：记录所有用户的操作（安全管理员查看）
- **三员操作日志**：记录系统管理员、安全管理员的操作（审计员查看）

## 🗄️ 表结构

### operation_logs（操作日志主表）

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | INTEGER | 主键，自增 | ✅ |
| timestamp | TEXT | 操作时间 | ✅ |
| operator | TEXT | 操作人名称 | ✅ |
| operator_id | TEXT | 操作人ID | ✅ |
| operator_role | TEXT | 操作人角色 | ✅ |
| ip_address | TEXT | IP地址 | ✅ |
| module | TEXT | 操作模块 | ✅ |
| action_category | TEXT | 行为类别 | ✅ |
| action_description | TEXT | 操作描述 | ✅ |
| operation_result | TEXT | 操作结果 | ✅ |
| before_data | TEXT | 修改前数据（JSON） | ❌ |
| after_data | TEXT | 修改后数据（JSON） | ❌ |
| change_details | TEXT | 变更说明 | ❌ |
| created_at | TEXT | 创建时间 | ✅ |
| updated_at | TEXT | 更新时间 | ✅ |

## 📊 枚举值说明

### operator_role（操作人角色）
- `SYSTEM_ADMIN` - 系统管理员
- `SECURITY_ADMIN` - 安全管理员
- `AUDITOR` - 审计员
- `ADMIN` - 管理员
- `MEETING_ADMIN` - 会议管理员
- `USER` - 普通用户

### module（操作模块）
- `USER` - 用户管理
- `DEPARTMENT` - 部门管理
- `MEETING` - 会议管理
- `DICT` - 数据字典
- `PERMISSION` - 权限管理
- `SECURITY` - 安全管理
- `SYSTEM` - 系统管理
- `AUTH` - 认证
- `CONFIG` - 配置管理
- `SYNC` - 同步管理

### action_category（行为类别）
- `CREATE` - 创建
- `UPDATE` - 修改
- `DELETE` - 删除
- `VIEW` - 查看
- `LOGIN` - 登录
- `LOGOUT` - 登出
- `EXPORT` - 导出
- `IMPORT` - 导入
- `CONFIG` - 配置
- `SYNC` - 同步

### operation_result（操作结果）
- `success` - 成功
- `failure` - 失败

## 🔍 视图说明

### view_application_logs（应用日志视图）
- 包含所有操作日志
- 用于安全管理员查看
- 按时间倒序排列

### view_three_admin_logs（三员操作日志视图）
- 仅包含系统管理员和安全管理员的操作
- 审计员不能查看自己的日志
- 用于审计员监督
- 按时间倒序排列

## 🚀 使用方法

### 1. 创建数据库

```bash
# 创建数据库文件
sqlite3 logs.db

# 执行SQL脚本
.read logs.sql

# 退出
.quit
```

### 2. 插入日志记录

```sql
INSERT INTO operation_logs (
    timestamp, operator, operator_id, operator_role, ip_address,
    module, action_category, action_description, operation_result,
    before_data, after_data, change_details
) VALUES (
    datetime('now', 'localtime'),
    '安全管理员',
    'security_admin',
    'SECURITY_ADMIN',
    '192.168.1.100',
    'USER',
    'UPDATE',
    '修改用户状态：将用户"张三"的状态从"启用"改为"禁用"',
    'success',
    '{"status": "enabled", "username": "张三"}',
    '{"status": "disabled", "username": "张三"}',
    '将用户"张三"的状态从"启用"改为"禁用"'
);
```

### 3. 查询示例

#### 查询应用日志（分页）
```sql
SELECT * FROM view_application_logs 
LIMIT 20 OFFSET 0;
```

#### 查询三员操作日志（分页）
```sql
SELECT * FROM view_three_admin_logs 
LIMIT 20 OFFSET 0;
```

#### 按时间范围查询
```sql
SELECT * FROM operation_logs 
WHERE timestamp BETWEEN '2024-11-01 00:00:00' AND '2024-11-01 23:59:59'
ORDER BY timestamp DESC;
```

#### 按操作人筛选
```sql
SELECT * FROM operation_logs 
WHERE operator = '安全管理员' 
ORDER BY timestamp DESC;
```

#### 按模块筛选
```sql
SELECT * FROM operation_logs 
WHERE module = 'USER' 
ORDER BY timestamp DESC;
```

#### 查询失败的操作
```sql
SELECT * FROM operation_logs 
WHERE operation_result = 'failure' 
ORDER BY timestamp DESC;
```

#### 复合筛选查询
```sql
SELECT * FROM operation_logs 
WHERE 
    timestamp >= '2024-11-01 00:00:00' 
    AND operator_role = 'SECURITY_ADMIN'
    AND module = 'USER'
    AND operation_result = 'success'
ORDER BY timestamp DESC
LIMIT 20 OFFSET 0;
```

### 4. 统计查询

#### 统计各模块的操作次数
```sql
SELECT module, COUNT(*) as count 
FROM operation_logs 
GROUP BY module 
ORDER BY count DESC;
```

#### 统计各角色的操作次数
```sql
SELECT operator_role, COUNT(*) as count 
FROM operation_logs 
GROUP BY operator_role 
ORDER BY count DESC;
```

#### 统计成功失败比例
```sql
SELECT 
    operation_result,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM operation_logs), 2) as percentage
FROM operation_logs 
GROUP BY operation_result;
```

## 🔧 维护命令

### 查看表信息
```sql
PRAGMA table_info(operation_logs);
```

### 查看索引信息
```sql
PRAGMA index_list(operation_logs);
```

### 统计信息
```sql
-- 总日志数
SELECT COUNT(*) as total_logs FROM operation_logs;

-- 三员日志数
SELECT COUNT(*) as three_admin_logs FROM view_three_admin_logs;

-- 数据库大小
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

### 清理历史数据
```sql
-- 删除30天前的日志
DELETE FROM operation_logs 
WHERE timestamp < datetime('now', '-30 days');

-- 优化数据库
VACUUM;
```

### 更新统计信息（性能优化）
```sql
ANALYZE;
```

## 📈 性能优化建议

1. **索引优化**
   - 已为常用查询字段创建索引
   - 时间字段使用倒序索引（DESC）

2. **数据清理**
   - 定期清理历史数据（建议保留3-6个月）
   - 可考虑归档到历史表

3. **分表策略**
   - 数据量大时可按月或季度分表
   - 例如：`operation_logs_2024_11`

4. **查询优化**
   - 使用 `EXPLAIN QUERY PLAN` 分析慢查询
   - 避免全表扫描

5. **定期维护**
   - 执行 `VACUUM` 压缩数据库
   - 执行 `ANALYZE` 更新统计信息

## 🔐 安全建议

1. **数据访问控制**
   - 应用层控制访问权限
   - 审计员只能查看三员日志视图

2. **数据完整性**
   - 日志记录只允许插入，不允许修改或删除
   - 可考虑实现触发器阻止UPDATE/DELETE

3. **敏感数据处理**
   - before_data/after_data 中的敏感信息应脱敏
   - 密码等信息不应记录明文

4. **备份策略**
   - 定期备份日志数据库
   - 重要操作前先备份

## 📝 注意事项

1. **时间格式**
   - 使用 `datetime('now', 'localtime')` 获取本地时间
   - 格式：`YYYY-MM-DD HH:MM:SS`

2. **JSON数据**
   - before_data 和 after_data 存储为JSON文本
   - 可使用 SQLite 的 JSON 函数处理

3. **三员日志特殊性**
   - 审计员不能查看自己的操作日志
   - 通过 operator_role 字段筛选

4. **操作描述规范**
   - 应包含完整的操作内容
   - 数据变更直接写在描述中
   - 便于快速理解操作内容

## 🔗 相关文档

- [前端开发规范](../docs/development-guidelines.md)
- [架构设计文档](../docs/architecture.md)
- [SQLite JSON函数文档](https://www.sqlite.org/json1.html)
