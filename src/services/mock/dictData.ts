/**
 * 数据字典Mock数据
 * 所有字典项和字典定义的Mock配置
 */

import type { DataDict, DictItem } from '@/types'

// Mock字典项数据
export const mockDictItems: Record<string, DictItem[]> = {
  'DEVICE_TYPE': [
    { id: '1', code: 'TABLET', name: '平板设备', value: 1, status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '2', code: 'PHONE', name: '手机设备', value: 2, status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '3', code: 'PC', name: '电脑设备', value: 3, status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '4', code: 'TV', name: '电视设备', value: 4, status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '5', code: 'PROJECTOR', name: '投影设备', value: 5, status: 'disabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'MEETING_STATUS': [
    { id: '6', code: 'PREPARATION', name: '准备中', value: 'preparation', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '7', code: 'DISTRIBUTABLE', name: '可下发', value: 'distributable', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '8', code: 'IN_PROGRESS', name: '进行中', value: 'in_progress', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '9', code: 'CLOSED', name: '已关闭', value: 'closed', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'ROOM_TYPE': [
    { id: '10', code: 'CONFERENCE_ROOM', name: '会议室', value: 1, status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '11', code: 'BOARD_ROOM', name: '董事会议室', value: 2, status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '12', code: 'TRAINING_ROOM', name: '培训室', value: 3, status: 'disabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '13', code: 'AUDITORIUM', name: '礼堂', value: 4, status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '14', code: 'VIDEO_ROOM', name: '视频会议室', value: 5, status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '15', code: 'BREAK_ROOM', name: '茶歇室', value: 6, status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '16', code: 'PHONE_BOOTH', name: '电话亭', value: 7, status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '17', code: 'OUTDOOR_SPACE', name: '户外场地', value: 8, status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'FILE_FORMAT': [
    { id: '18', code: 'PDF', name: 'PDF文档', value: 'pdf', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '19', code: 'DOCX', name: 'Word文档', value: 'docx', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '20', code: 'PPTX', name: 'PowerPoint演示文稿', value: 'pptx', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '21', code: 'XLSX', name: 'Excel表格', value: 'xlsx', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '22', code: 'TXT', name: '文本文件', value: 'txt', status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '23', code: 'JPG', name: 'JPEG图片', value: 'jpg', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '24', code: 'PNG', name: 'PNG图片', value: 'png', status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '25', code: 'MP4', name: 'MP4视频', value: 'mp4', status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '26', code: 'AVI', name: 'AVI视频', value: 'avi', status: 'disabled', sort: 9, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '27', code: 'MP3', name: 'MP3音频', value: 'mp3', status: 'enabled', sort: 10, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '28', code: 'WAV', name: 'WAV音频', value: 'wav', status: 'enabled', sort: 11, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '29', code: 'ZIP', name: 'ZIP压缩包', value: 'zip', status: 'enabled', sort: 12, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'USER_ROLE': [
    { id: '30', code: 'ADMIN', name: '系统管理员', value: 'admin', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '31', code: 'MEETING_ADMIN', name: '会议管理员', value: 'meeting_admin', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '32', code: 'AUDITOR', name: '审计员', value: 'auditor', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '33', code: 'USER', name: '普通用户', value: 'user', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '34', code: 'GUEST', name: '访客用户', value: 'guest', status: 'disabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '35', code: 'VIP', name: 'VIP用户', value: 'vip', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'MENU_GROUPS': [
    { id: '36', code: 'WORKSPACE', name: '工作台', value: 'workspace', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '37', code: 'MEETING', name: '会议管理', value: 'meeting', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '38', code: 'SYNC', name: '同步管理', value: 'sync', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '39', code: 'PERSONNEL', name: '人员管理', value: 'personnel', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '40', code: 'ORGANIZATION', name: '组织架构', value: 'organization', status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '41', code: 'SYSTEM', name: '系统管理', value: 'system', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '42', code: 'MONITORING', name: '监控告警', value: 'monitoring', status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'MENU_ITEMS': [
    // 工作台分组
    { id: '43', code: 'DASHBOARD', name: '仪表板', value: JSON.stringify({ key: 'dashboard', label: '仪表板', icon: 'BarChart3', path: '/', permissions: ['dashboard:view'], group: 'workspace' }), status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 会议管理分组
    { id: '44', code: 'MEETING_LIST', name: '会议列表', value: JSON.stringify({ key: 'meeting-list', label: '会议列表', icon: 'Calendar', path: '/meetings', permissions: ['meeting:view'], group: 'meeting' }), status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '45', code: 'MY_MEETINGS', name: '我的会议', value: JSON.stringify({ key: 'my-meetings', label: '我的会议', icon: 'User', path: '/my-meetings', permissions: ['meeting:view'], group: 'meeting' }), status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 同步管理分组
    { id: '46', code: 'SYNC_STATUS', name: '同步状态', value: JSON.stringify({ key: 'sync-status', label: '同步状态', icon: 'RefreshCw', path: '/sync-status', permissions: ['sync:view'], group: 'sync' }), status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 人员管理分组
    { id: '47', code: 'PARTICIPANTS', name: '参会人员', value: JSON.stringify({ key: 'participants', label: '参会人员', icon: 'Users', path: '/participants', permissions: ['personnel:view'], group: 'personnel' }), status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '48', code: 'ROLE_PERMISSIONS', name: '角色权限', value: JSON.stringify({ key: 'role-permissions', label: '角色权限', icon: 'Shield', path: '/role-permissions', permissions: ['role:manage'], group: 'personnel' }), status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '49', code: 'SECURITY_LEVELS', name: '人员密级', value: JSON.stringify({ key: 'security-levels', label: '人员密级', icon: 'Lock', path: '/security-levels', permissions: ['security:manage'], group: 'personnel' }), status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 组织架构分组
    { id: '50', code: 'DEPARTMENTS', name: '部门管理', value: JSON.stringify({ key: 'departments', label: '部门管理', icon: 'Building', path: '/departments', permissions: ['org:manage'], group: 'organization' }), status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '51', code: 'STAFF_MANAGEMENT', name: '人员管理', value: JSON.stringify({ key: 'staff-management', label: '人员管理', icon: 'UserCheck', path: '/staff', permissions: ['staff:manage'], group: 'organization' }), status: 'enabled', sort: 9, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 系统管理分组
    { id: '52', code: 'DATA_DICTIONARY', name: '数据字典', value: JSON.stringify({ key: 'data-dictionary', label: '数据字典', icon: 'Book', path: '/data-dictionary', permissions: ['system:dict'], group: 'system' }), status: 'enabled', sort: 10, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '53', code: 'BASIC_CONFIG', name: '基础配置', value: JSON.stringify({ key: 'basic-config', label: '基础配置', icon: 'Settings', path: '/basic-config', permissions: ['system:config'], group: 'system' }), status: 'enabled', sort: 11, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '54', code: 'SYSTEM_LOGS', name: '系统日志', value: JSON.stringify({ key: 'system-logs', label: '系统日志', icon: 'FileText', path: '/system-logs', permissions: ['system:logs'], group: 'system' }), status: 'enabled', sort: 12, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '55', code: 'ADMIN_LOGS', name: '操作日志（系统员）', value: JSON.stringify({ key: 'admin-logs', label: '操作日志（系统员）', icon: 'ScrollText', path: '/admin-logs', permissions: ['logs:admin'], group: 'system' }), status: 'enabled', sort: 13, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '56', code: 'AUDIT_LOGS', name: '操作日志（审计员）', value: JSON.stringify({ key: 'audit-logs', label: '操作日志（审计员）', icon: 'Search', path: '/audit-logs', permissions: ['logs:audit'], group: 'system' }), status: 'enabled', sort: 14, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    
    // 监控告警分组
    { id: '57', code: 'ANOMALY_ALERTS', name: '异常行为告警', value: JSON.stringify({ key: 'anomaly-alerts', label: '异常行为告警', icon: 'AlertTriangle', path: '/anomaly-alerts', permissions: ['monitor:alerts'], group: 'monitoring' }), status: 'enabled', sort: 15, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ],

  'MENU_ICONS': [
    { id: '58', code: 'BAR_CHART_3', name: '条形图3', value: 'BarChart3', status: 'enabled', sort: 1, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '59', code: 'CALENDAR', name: '日历', value: 'Calendar', status: 'enabled', sort: 2, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '60', code: 'USER', name: '用户', value: 'User', status: 'enabled', sort: 3, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '61', code: 'USERS', name: '用户组', value: 'Users', status: 'enabled', sort: 4, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '62', code: 'REFRESH_CW', name: '刷新', value: 'RefreshCw', status: 'enabled', sort: 5, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '63', code: 'SHIELD', name: '盾牌', value: 'Shield', status: 'enabled', sort: 6, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '64', code: 'LOCK', name: '锁', value: 'Lock', status: 'enabled', sort: 7, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '65', code: 'BUILDING', name: '建筑', value: 'Building', status: 'enabled', sort: 8, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '66', code: 'USER_CHECK', name: '用户检查', value: 'UserCheck', status: 'enabled', sort: 9, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '67', code: 'BOOK', name: '书本', value: 'Book', status: 'enabled', sort: 10, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '68', code: 'SETTINGS', name: '设置', value: 'Settings', status: 'enabled', sort: 11, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '69', code: 'FILE_TEXT', name: '文件文本', value: 'FileText', status: 'enabled', sort: 12, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '70', code: 'SCROLL_TEXT', name: '滚动文本', value: 'ScrollText', status: 'enabled', sort: 13, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '71', code: 'SEARCH', name: '搜索', value: 'Search', status: 'enabled', sort: 14, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '72', code: 'ALERT_TRIANGLE', name: '警告三角', value: 'AlertTriangle', status: 'enabled', sort: 15, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
  ]
}

// Mock字典定义数据
export const mockDataDicts: DataDict[] = [
  {
    id: '1',
    dictCode: 'DEVICE_TYPE',
    dictName: '设备类型',
    dictType: 'device',
    status: 'enabled',
    itemCount: 5,
    remark: '会议平板设备类型分类',
    items: mockDictItems['DEVICE_TYPE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    dictCode: 'MEETING_STATUS',
    dictName: '会议状态',
    dictType: 'meeting',
    status: 'enabled',
    itemCount: 4,
    remark: '会议流程状态定义',
    items: mockDictItems['MEETING_STATUS'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    dictCode: 'ROOM_TYPE',
    dictName: '会议室类型',
    dictType: 'room',
    status: 'disabled',
    itemCount: 8,
    remark: '会议室场地类型分类',
    items: mockDictItems['ROOM_TYPE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    dictCode: 'FILE_FORMAT',
    dictName: '文件格式',
    dictType: 'file',
    status: 'enabled',
    itemCount: 12,
    remark: '支持的文件格式类型',
    items: mockDictItems['FILE_FORMAT'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '5',
    dictCode: 'USER_ROLE',
    dictName: '用户角色',
    dictType: 'user',
    status: 'enabled',
    itemCount: 6,
    remark: '系统用户角色权限定义',
    items: mockDictItems['USER_ROLE'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '6',
    dictCode: 'MENU_GROUPS',
    dictName: '菜单分组',
    dictType: 'menu',
    status: 'enabled',
    itemCount: 7,
    remark: '系统菜单分组定义',
    items: mockDictItems['MENU_GROUPS'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '7',
    dictCode: 'MENU_ITEMS',
    dictName: '菜单项',
    dictType: 'menu',
    status: 'enabled',
    itemCount: 15,
    remark: '系统菜单项配置',
    items: mockDictItems['MENU_ITEMS'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '8',
    dictCode: 'MENU_ICONS',
    dictName: '可用图标',
    dictType: 'menu',
    status: 'enabled',
    itemCount: 15,
    remark: '菜单可用图标列表',
    items: mockDictItems['MENU_ICONS'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  }
]
