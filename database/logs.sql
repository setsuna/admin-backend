-- ============================================
-- 操作日志系统数据库设计 (SQLite)
-- ============================================
-- 
-- 功能说明：
-- 1. 应用日志：记录系统所有用户的操作（安全管理员查看）
-- 2. 三员操作日志：记录系统管理员、安全管理员的操作（审计员查看，不包括审计员自己）
--
-- 设计原则：
-- - 使用单表设计，通过 operator_role 字段区分三员操作
-- - 支持数据变更前后对比
-- - 完整的时间戳和审计信息
-- ============================================

-- ============================================
-- 1. 操作日志主表
-- ============================================
CREATE TABLE IF NOT EXISTS operation_logs (
    -- 主键
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- 时间信息
    timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),  -- 操作时间，格式：YYYY-MM-DD HH:MM:SS
    
    -- 操作人信息
    operator TEXT NOT NULL,                    -- 操作人名称（三员为：系统管理员、安全管理员、审计员）
    operator_id TEXT NOT NULL,                 -- 操作人ID
    operator_role TEXT NOT NULL,               -- 操作人角色（USER, ADMIN, SYSTEM_ADMIN, SECURITY_ADMIN, AUDITOR, MEETING_ADMIN等）
    
    -- 来源信息
    ip_address TEXT NOT NULL,                  -- 操作者IP地址
    
    -- 操作信息
    module TEXT NOT NULL,                      -- 操作模块（USER, DEPARTMENT, MEETING, DICT, PERMISSION, SECURITY, SYSTEM, AUTH, CONFIG, SYNC）
    action_category TEXT NOT NULL,             -- 行为类别（CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, EXPORT, IMPORT, CONFIG, SYNC）
    action_description TEXT NOT NULL,          -- 操作描述（详细说明，包含数据变更内容）
    operation_result TEXT NOT NULL DEFAULT 'success', -- 操作结果（success, failure）
    
    -- 数据变更信息（可选，仅修改操作需要）
    before_data TEXT,                          -- 修改前的数据（JSON格式）
    after_data TEXT,                           -- 修改后的数据（JSON格式）
    change_details TEXT,                       -- 变更说明（人类可读的描述）
    
    -- 审计字段
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),  -- 记录创建时间
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))   -- 记录更新时间
);

-- ============================================
-- 2. 索引设计
-- ============================================

-- 时间索引（最常用的查询条件）
CREATE INDEX IF NOT EXISTS idx_operation_logs_timestamp 
ON operation_logs(timestamp DESC);

-- 操作人角色索引（用于区分三员操作）
CREATE INDEX IF NOT EXISTS idx_operation_logs_operator_role 
ON operation_logs(operator_role);

-- 操作模块索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_module 
ON operation_logs(module);

-- 行为类别索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_action_category 
ON operation_logs(action_category);

-- 操作结果索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_operation_result 
ON operation_logs(operation_result);

-- 组合索引：时间 + 角色（用于三员日志查询优化）
CREATE INDEX IF NOT EXISTS idx_operation_logs_timestamp_role 
ON operation_logs(timestamp DESC, operator_role);

-- 操作人ID索引（用于查询特定用户的操作）
CREATE INDEX IF NOT EXISTS idx_operation_logs_operator_id 
ON operation_logs(operator_id);

-- IP地址索引（用于安全审计）
CREATE INDEX IF NOT EXISTS idx_operation_logs_ip_address 
ON operation_logs(ip_address);

-- ============================================
-- 3. 触发器：自动更新 updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_operation_logs_timestamp 
AFTER UPDATE ON operation_logs
FOR EACH ROW
BEGIN
    UPDATE operation_logs 
    SET updated_at = datetime('now', 'localtime')
    WHERE id = OLD.id;
END;

-- ============================================
-- 4. 视图：应用日志（所有操作）
-- ============================================
CREATE VIEW IF NOT EXISTS view_application_logs AS
SELECT 
    id,
    timestamp,
    operator,
    operator_id,
    operator_role,
    ip_address,
    module,
    action_category,
    action_description,
    operation_result,
    before_data,
    after_data,
    change_details,
    created_at,
    updated_at
FROM operation_logs
ORDER BY timestamp DESC;

-- ============================================
-- 5. 视图：三员操作日志（仅系统管理员和安全管理员）
-- ============================================
CREATE VIEW IF NOT EXISTS view_three_admin_logs AS
SELECT 
    id,
    timestamp,
    operator,
    operator_id,
    operator_role,
    ip_address,
    module,
    action_category,
    action_description,
    operation_result,
    before_data,
    after_data,
    change_details,
    created_at,
    updated_at
FROM operation_logs
WHERE operator_role IN ('SYSTEM_ADMIN', 'SECURITY_ADMIN')  -- 审计员不查看自己的日志
ORDER BY timestamp DESC;

-- ============================================
-- 6. 示例数据插入
-- ============================================

-- 应用日志示例数据
INSERT INTO operation_logs (
    timestamp, operator, operator_id, operator_role, ip_address,
    module, action_category, action_description, operation_result,
    before_data, after_data, change_details
) VALUES 
-- 安全管理员操作
(
    '2024-11-01 10:30:25',
    '安全管理员',
    'security_admin',
    'SECURITY_ADMIN',
    '192.168.1.100',
    'USER',
    'UPDATE',
    '修改用户状态：将用户"李四"的状态从"启用"改为"禁用"',
    'success',
    '{"status": "enabled", "username": "李四"}',
    '{"status": "disabled", "username": "李四"}',
    '将用户"李四"的状态从"启用"改为"禁用"'
),
-- 系统管理员操作
(
    '2024-11-01 10:20:45',
    '系统管理员',
    'system_admin',
    'SYSTEM_ADMIN',
    '192.168.1.102',
    'SYSTEM',
    'CONFIG',
    '修改系统配置：将最大登录尝试次数从3次修改为5次',
    'success',
    '{"maxLoginAttempts": 3}',
    '{"maxLoginAttempts": 5}',
    '将最大登录尝试次数从3次修改为5次'
),
-- 普通用户操作
(
    '2024-11-01 10:15:30',
    '孙七',
    'user_004',
    'USER',
    '192.168.1.103',
    'AUTH',
    'LOGIN',
    '用户登录失败：密码错误',
    'failure',
    NULL,
    NULL,
    NULL
),
-- 审计员操作（三员日志中不显示）
(
    '2024-11-01 10:10:12',
    '审计员',
    'auditor',
    'AUDITOR',
    '192.168.1.101',
    'AUTH',
    'LOGIN',
    '审计员登录系统',
    'success',
    NULL,
    NULL,
    NULL
),
-- 安全管理员操作
(
    '2024-11-01 10:05:00',
    '安全管理员',
    'security_admin',
    'SECURITY_ADMIN',
    '192.168.1.100',
    'PERMISSION',
    'UPDATE',
    '修改角色权限：为角色"管理员"添加了"删除用户"权限',
    'success',
    '{"permissions": ["user:read", "user:write"]}',
    '{"permissions": ["user:read", "user:write", "user:delete"]}',
    '为角色"管理员"添加了"删除用户"权限'
),
-- 会议管理员操作
(
    '2024-11-01 09:50:00',
    '赵六',
    'user_003',
    'MEETING_ADMIN',
    '192.168.1.102',
    'MEETING',
    'CREATE',
    '创建会议：标题为"项目评审会"，状态为草稿',
    'success',
    NULL,
    '{"title": "项目评审会", "status": "draft"}',
    NULL
);

-- ============================================
-- 7. 常用查询示例
-- ============================================

-- 查询所有应用日志（分页）
-- SELECT * FROM view_application_logs LIMIT 20 OFFSET 0;

-- 查询三员操作日志（分页）
-- SELECT * FROM view_three_admin_logs LIMIT 20 OFFSET 0;

-- 按时间范围查询
-- SELECT * FROM operation_logs 
-- WHERE timestamp BETWEEN '2024-11-01 00:00:00' AND '2024-11-01 23:59:59'
-- ORDER BY timestamp DESC;

-- 按操作人查询
-- SELECT * FROM operation_logs WHERE operator = '安全管理员' ORDER BY timestamp DESC;

-- 按模块查询
-- SELECT * FROM operation_logs WHERE module = 'USER' ORDER BY timestamp DESC;

-- 按行为类别查询
-- SELECT * FROM operation_logs WHERE action_category = 'UPDATE' ORDER BY timestamp DESC;

-- 查询失败的操作
-- SELECT * FROM operation_logs WHERE operation_result = 'failure' ORDER BY timestamp DESC;

-- 统计各模块的操作次数
-- SELECT module, COUNT(*) as count FROM operation_logs GROUP BY module ORDER BY count DESC;

-- 统计各角色的操作次数
-- SELECT operator_role, COUNT(*) as count FROM operation_logs GROUP BY operator_role ORDER BY count DESC;

-- 查询特定IP的所有操作
-- SELECT * FROM operation_logs WHERE ip_address = '192.168.1.100' ORDER BY timestamp DESC;

-- ============================================
-- 8. 数据维护
-- ============================================

-- 删除30天前的日志（可定期执行）
-- DELETE FROM operation_logs 
-- WHERE timestamp < datetime('now', '-30 days');

-- 查看表信息
-- PRAGMA table_info(operation_logs);

-- 查看索引信息
-- PRAGMA index_list(operation_logs);

-- 查看表统计信息
-- SELECT COUNT(*) as total_logs FROM operation_logs;
-- SELECT COUNT(*) as three_admin_logs FROM view_three_admin_logs;

-- ============================================
-- 9. 性能优化建议
-- ============================================
-- 
-- 1. 定期清理历史数据（如保留最近3-6个月的日志）
-- 2. 考虑分表策略（按月或季度分表）
-- 3. 对于大量查询，考虑使用EXPLAIN QUERY PLAN分析查询性能
-- 4. 定期执行VACUUM命令优化数据库文件大小
-- 5. 考虑使用ANALYZE命令更新统计信息
--
-- ============================================
