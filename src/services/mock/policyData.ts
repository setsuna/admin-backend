import type { 
  SecurityPolicy,
  ApiResponse,
  SystemSecurityLevel
} from '@/types'

// Mock策略配置数据
let mockPolicyConfig: SecurityPolicy = {
  // 系统安全策略
  systemSecurityLevel: 'confidential',
  allowSecurityDowngrade: false,
  
  // 文件管理策略
  serverFileRetentionDays: 90,
  clientFileExpirationHours: 24,
  fileUploadMaxSize: 100,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  fileEncryptionEnabled: true,
  
  // 认证与密码策略
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    changeIntervalDays: 90,
    maxFailAttempts: 5,
    lockoutDurationMinutes: 30,
    preventReuse: 5
  },
  
  // 会话管理策略
  sessionTimeoutMinutes: 480,
  idleLockTimeoutMinutes: 30,
  maxConcurrentSessions: 3,
  rememberPasswordEnabled: true,
  singleSignOnEnabled: false,
  
  // 访问控制策略
  ipWhitelistEnabled: false,
  ipWhitelist: [],
  allowedLoginHours: {
    start: '08:00',
    end: '18:00',
    enabled: false
  },
  deviceBindingEnabled: false,
  geoLocationRestricted: false,
  
  // 审计策略
  auditLogRetentionDays: 365,
  sensitiveOperationLogging: 'standard',
  auditLogExportEnabled: true,
  
  // 系统维护策略
  maintenanceWindow: {
    start: '02:00',
    end: '04:00',
    enabled: true
  },
  autoBackupEnabled: true,
  backupRetentionDays: 30
}

// Mock策略历史记录
const mockPolicyHistory = [
  {
    id: '1',
    version: 3,
    config: { ...mockPolicyConfig },
    updatedBy: 'admin',
    updatedByName: '系统管理员',
    updatedAt: '2025-09-14T10:30:00.000Z',
    reason: '调整密码策略，增强系统安全性'
  },
  {
    id: '2',
    version: 2,
    config: {
      ...mockPolicyConfig,
      passwordPolicy: {
        ...mockPolicyConfig.passwordPolicy,
        minLength: 6,
        changeIntervalDays: 120
      }
    },
    updatedBy: 'security_admin',
    updatedByName: '安全管理员',
    updatedAt: '2025-09-10T14:20:00.000Z',
    reason: '根据安全审计结果调整配置'
  },
  {
    id: '3',
    version: 1,
    config: {
      ...mockPolicyConfig,
      systemSecurityLevel: 'internal' as SystemSecurityLevel,
      fileEncryptionEnabled: false
    },
    updatedBy: 'admin',
    updatedByName: '系统管理员',
    updatedAt: '2025-09-01T09:00:00.000Z',
    reason: '初始配置'
  }
]

// 模拟延迟
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms))

// Mock服务
export const mockPolicyService = {
  // 获取当前策略配置
  async getPolicyConfig(): Promise<ApiResponse<SecurityPolicy>> {
    await delay()
    
    return {
      code: 200,
      message: 'success',
      data: { ...mockPolicyConfig }
    }
  },

  // 更新策略配置
  async updatePolicyConfig(config: SecurityPolicy): Promise<ApiResponse<SecurityPolicy>> {
    await delay(1200)
    
    // 验证系统密级不能降级
    if (config.systemSecurityLevel !== mockPolicyConfig.systemSecurityLevel) {
      const levelOrder = { 'internal': 0, 'confidential': 1, 'secret': 2 }
      const currentLevel = levelOrder[mockPolicyConfig.systemSecurityLevel]
      const newLevel = levelOrder[config.systemSecurityLevel]
      
      if (newLevel < currentLevel && !config.allowSecurityDowngrade) {
        throw new Error('系统密级不能降级，请先启用允许降级选项')
      }
    }
    
    // 基本验证
    if (config.passwordPolicy.minLength < 6) {
      throw new Error('密码最小长度不能少于6位')
    }
    
    if (config.sessionTimeoutMinutes < 5) {
      throw new Error('会话超时时间不能少于5分钟')
    }
    
    if (config.serverFileRetentionDays < 1) {
      throw new Error('服务器文件存储周期不能少于1天')
    }
    
    // 更新配置
    mockPolicyConfig = { ...config }
    
    // 添加到历史记录
    mockPolicyHistory.unshift({
      id: (mockPolicyHistory.length + 1).toString(),
      version: mockPolicyHistory.length + 1,
      config: { ...config },
      updatedBy: 'current_user',
      updatedByName: '当前用户',
      updatedAt: new Date().toISOString(),
      reason: '策略配置更新'
    })
    
    return {
      code: 200,
      message: 'success',
      data: { ...mockPolicyConfig }
    }
  },

  // 获取策略配置历史
  async getPolicyHistory(limit: number = 20): Promise<ApiResponse<Array<{
    id: string
    version: number
    config: SecurityPolicy
    updatedBy: string
    updatedByName: string
    updatedAt: string
    reason?: string
  }>>> {
    await delay()
    
    const history = mockPolicyHistory.slice(0, limit)
    
    return {
      code: 200,
      message: 'success',
      data: history
    }
  },

  // 恢复到指定版本
  async restorePolicyVersion(versionId: string): Promise<ApiResponse<SecurityPolicy>> {
    await delay(1000)
    
    const version = mockPolicyHistory.find(h => h.id === versionId)
    if (!version) {
      throw new Error('指定的版本不存在')
    }
    
    mockPolicyConfig = { ...version.config }
    
    // 添加恢复记录
    mockPolicyHistory.unshift({
      id: (mockPolicyHistory.length + 1).toString(),
      version: mockPolicyHistory.length + 1,
      config: { ...version.config },
      updatedBy: 'current_user',
      updatedByName: '当前用户',
      updatedAt: new Date().toISOString(),
      reason: `恢复到版本 ${version.version}`
    })
    
    return {
      code: 200,
      message: 'success',
      data: { ...mockPolicyConfig }
    }
  },

  // 验证策略配置
  async validatePolicyConfig(config: SecurityPolicy): Promise<ApiResponse<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }>> {
    await delay(500)
    
    const errors: string[] = []
    const warnings: string[] = []
    
    // 验证规则
    if (config.passwordPolicy.minLength < 6) {
      errors.push('密码最小长度不能少于6位')
    } else if (config.passwordPolicy.minLength < 8) {
      warnings.push('建议密码最小长度设置为8位或以上')
    }
    
    if (config.sessionTimeoutMinutes < 5) {
      errors.push('会话超时时间不能少于5分钟')
    } else if (config.sessionTimeoutMinutes > 720) {
      warnings.push('会话超时时间过长，可能存在安全风险')
    }
    
    if (config.passwordPolicy.maxFailAttempts > 10) {
      warnings.push('密码错误次数限制过高，建议设置为5次以下')
    }
    
    if (!config.fileEncryptionEnabled && config.systemSecurityLevel !== 'internal') {
      warnings.push('在高密级环境下建议启用文件加密存储')
    }
    
    if (config.rememberPasswordEnabled && config.systemSecurityLevel === 'secret') {
      warnings.push('绝密级别系统不建议启用记住密码功能')
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        valid: errors.length === 0,
        errors,
        warnings
      }
    }
  },

  // 获取默认策略配置
  async getDefaultPolicyConfig(): Promise<ApiResponse<SecurityPolicy>> {
    await delay()
    
    const defaultConfig: SecurityPolicy = {
      systemSecurityLevel: 'internal',
      allowSecurityDowngrade: false,
      
      serverFileRetentionDays: 90,
      clientFileExpirationHours: 24,
      fileUploadMaxSize: 50,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      fileEncryptionEnabled: true,
      
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        changeIntervalDays: 90,
        maxFailAttempts: 5,
        lockoutDurationMinutes: 15,
        preventReuse: 3
      },
      
      sessionTimeoutMinutes: 480,
      idleLockTimeoutMinutes: 30,
      maxConcurrentSessions: 2,
      rememberPasswordEnabled: false,
      singleSignOnEnabled: false,
      
      ipWhitelistEnabled: false,
      ipWhitelist: [],
      allowedLoginHours: {
        start: '09:00',
        end: '17:00',
        enabled: false
      },
      deviceBindingEnabled: false,
      geoLocationRestricted: false,
      
      auditLogRetentionDays: 180,
      sensitiveOperationLogging: 'standard',
      auditLogExportEnabled: false,
      
      maintenanceWindow: {
        start: '02:00',
        end: '04:00',
        enabled: true
      },
      autoBackupEnabled: true,
      backupRetentionDays: 30
    }
    
    return {
      code: 200,
      message: 'success',
      data: defaultConfig
    }
  },

  // 导出策略配置
  async exportPolicyConfig(): Promise<Blob> {
    await delay()
    
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      config: mockPolicyConfig
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    return blob
  },

  // 导入策略配置
  async importPolicyConfig(file: File): Promise<ApiResponse<SecurityPolicy>> {
    await delay(1000)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          
          if (!data.config) {
            reject(new Error('导入文件格式错误'))
            return
          }
          
          // 简单验证
          const config = data.config as SecurityPolicy
          if (!config.systemSecurityLevel || !config.passwordPolicy) {
            reject(new Error('导入的配置文件不完整'))
            return
          }
          
          resolve({
            code: 200,
            message: 'success',
            data: config
          })
        } catch (error) {
          reject(new Error('导入文件解析失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  },

  // 获取策略影响分析
  async getPolicyImpactAnalysis(config: SecurityPolicy): Promise<ApiResponse<{
    affectedUsers: number
    affectedSessions: number
    systemChanges: string[]
    riskAssessment: 'low' | 'medium' | 'high'
  }>> {
    await delay(800)
    
    const changes: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    
    // 分析密码策略变化
    if (config.passwordPolicy.minLength > mockPolicyConfig.passwordPolicy.minLength) {
      changes.push(`密码最小长度调整为 ${config.passwordPolicy.minLength} 位`)
    }
    
    // 分析会话策略变化
    if (config.sessionTimeoutMinutes !== mockPolicyConfig.sessionTimeoutMinutes) {
      changes.push(`会话超时时间调整为 ${config.sessionTimeoutMinutes} 分钟`)
    }
    
    // 分析系统密级变化
    if (config.systemSecurityLevel !== mockPolicyConfig.systemSecurityLevel) {
      changes.push(`系统密级调整为 ${config.systemSecurityLevel}`)
      riskLevel = 'high'
    }
    
    // 分析文件策略变化
    if (config.fileEncryptionEnabled !== mockPolicyConfig.fileEncryptionEnabled) {
      changes.push(`文件加密存储 ${config.fileEncryptionEnabled ? '启用' : '禁用'}`)
      riskLevel = config.fileEncryptionEnabled ? 'medium' : 'high'
    }
    
    return {
      code: 200,
      message: 'success',
      data: {
        affectedUsers: Math.floor(Math.random() * 100) + 50,
        affectedSessions: Math.floor(Math.random() * 20) + 10,
        systemChanges: changes,
        riskAssessment: riskLevel
      }
    }
  }
}