import React, { useState, useEffect } from 'react'
import { FileText, CheckCircle, AlertCircle, Info, Eye, EyeOff, Edit2 } from 'lucide-react'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import type { TemporaryParticipant } from '@/types'

interface TemporaryParticipantImporterProps {
  onImport: (participants: TemporaryParticipant[]) => void
}

interface ParseResult {
  success: TemporaryParticipant[]
  errors: Array<{ line: number; message: string }>
}

const parseTemporaryParticipants = (
  text: string, 
  defaultSecurityLevel: string,
  defaultPassword: string,
  customLevels: Map<string, string> = new Map()
): ParseResult => {
  const lines = text.trim().split('\n').filter(line => line.trim())
  const success: TemporaryParticipant[] = []
  const errors: Array<{ line: number; message: string }> = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // 按分隔符拆分，只取第一列作为姓名
    const parts = trimmedLine.split(/[,，\t\s]+/)
    const name = parts[0]?.trim()
    
    if (!name) {
      errors.push({ line: index + 1, message: '姓名不能为空' })
      return
    }

    success.push({
      name,
      department: '外部',
      email: '',
      securityLevel: customLevels.get(name) || defaultSecurityLevel,
      password: defaultPassword
    })
  })

  return { success, errors }
}

const TemporaryParticipantImporter: React.FC<TemporaryParticipantImporterProps> = ({
  onImport
}) => {
  const [inputText, setInputText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState('')
  const [defaultPassword, setDefaultPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordChangeAlert, setShowPasswordChangeAlert] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [batchSecurityLevel, setBatchSecurityLevel] = useState('')
  const [customSecurityLevels, setCustomSecurityLevels] = useState<Map<string, string>>(new Map())
  const { securityLevels, isLoading } = useSecurityLevels()

  // 设置默认密级
  useEffect(() => {
    if (!selectedSecurityLevel && securityLevels.length > 0) {
      const defaultValue = String(securityLevels[0].value)
      setSelectedSecurityLevel(defaultValue)
      setBatchSecurityLevel(defaultValue)
    }
  }, [securityLevels, selectedSecurityLevel])

  const handleParse = (text: string) => {
    setInputText(text)
    setSelectedIndices(new Set())
    if (!text.trim()) {
      setParseResult(null)
      setCustomSecurityLevels(new Map()) // 清空输入时清空自定义密级
      return
    }
    const result = parseTemporaryParticipants(text, selectedSecurityLevel, defaultPassword, customSecurityLevels)
    setParseResult(result)
  }

  const handleSecurityLevelChange = (newLevel: string) => {
    // 在修改默认密级时，将当前已解析的人员密级记录下来，防止被覆盖
    if (parseResult && parseResult.success.length > 0) {
      const newCustomLevels = new Map(customSecurityLevels)
      parseResult.success.forEach(p => {
        if (!newCustomLevels.has(p.name)) {
          newCustomLevels.set(p.name, p.securityLevel || selectedSecurityLevel)
        }
      })
      setCustomSecurityLevels(newCustomLevels)
    }
    
    setSelectedSecurityLevel(newLevel)
  }

  const handlePasswordChange = (newPassword: string) => {
    const hadParticipants = parseResult && parseResult.success.length > 0
    setDefaultPassword(newPassword)
    
    if (hadParticipants) {
      setShowPasswordChangeAlert(true)
      setTimeout(() => setShowPasswordChangeAlert(false), 3000)
      
      const updated = {
        ...parseResult!,
        success: parseResult!.success.map(p => ({
          ...p,
          password: newPassword
        }))
      }
      setParseResult(updated)
    }
  }

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedIndices(newSelected)
  }

  const handleSelectAll = () => {
    if (parseResult && selectedIndices.size === parseResult.success.length) {
      setSelectedIndices(new Set())
    } else if (parseResult) {
      setSelectedIndices(new Set(parseResult.success.map((_, i) => i)))
    }
  }

  const handleBatchUpdateSecurityLevel = () => {
    if (!parseResult || selectedIndices.size === 0) return

    // 记录用户自定义的密级
    const newCustomLevels = new Map(customSecurityLevels)
    parseResult.success.forEach((p, i) => {
      if (selectedIndices.has(i)) {
        newCustomLevels.set(p.name, batchSecurityLevel)
      }
    })
    setCustomSecurityLevels(newCustomLevels)

    const updated = {
      ...parseResult,
      success: parseResult.success.map((p, i) => 
        selectedIndices.has(i) ? { ...p, securityLevel: batchSecurityLevel } : p
      )
    }
    setParseResult(updated)
    setSelectedIndices(new Set())
  }

  const handleConfirm = () => {
    if (parseResult && parseResult.success.length > 0) {
      onImport(parseResult.success)
      setInputText('')
      setParseResult(null)
      setSelectedIndices(new Set())
      setCustomSecurityLevels(new Map())
    }
  }

  return (
    <div className="flex h-full">
      {/* 左侧：配置区 */}
      <div className="w-80 border-r bg-bg-container p-4 space-y-4 overflow-y-auto">
        {/* 格式说明 */}
        <div>
          <div className="flex items-start gap-2 mb-3">
            <FileText className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-text-primary mb-1">格式说明</div>
              <div className="text-sm text-text-secondary space-y-1">
                <div>• 每行一个姓名</div>
                <div className="text-xs text-text-tertiary pl-4">
                  示例：张三
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {/* 默认密级 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              默认密级
            </label>
            {isLoading ? (
              <div className="text-xs text-text-tertiary">加载中...</div>
            ) : (
              <div className="space-y-2">
                {securityLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2.5 py-1.5 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="securityLevel"
                      value={level.value}
                      checked={selectedSecurityLevel === level.value}
                      onChange={(e) => handleSecurityLevelChange(e.target.value)}
                      className="w-4 h-4 text-info focus:ring-info"
                    />
                    <span className="text-sm text-text-primary">{level.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 默认密码 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              默认密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={defaultPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="统一密码"
                className="w-full px-3 py-1.5 pr-10 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-bg-card"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 密码修改提示 */}
        {showPasswordChangeAlert && (
          <div className="p-2 bg-warning/10 border border-warning/30 rounded-md flex items-start gap-2 text-sm text-warning">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>已应用到所有人员</span>
          </div>
        )}
      </div>

      {/* 右侧：编辑区 */}
      <div className="flex-1 flex flex-col">
        {/* 输入区 */}
        <div className="p-4 border-b">
          <textarea
            value={inputText}
            onChange={(e) => handleParse(e.target.value)}
            placeholder="在此粘贴人员名单...&#10;&#10;每行一个姓名"
            className="w-full h-32 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm resize-none"
          />
        </div>

        {/* 解析结果 */}
        <div className="flex-1 overflow-y-auto">
          {parseResult && (
            <div className="p-4 space-y-3">
              {/* 批量操作栏 */}
              {parseResult.success.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-bg-container border rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIndices.size === parseResult.success.length && parseResult.success.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-info focus:ring-info rounded"
                    />
                    <span className="text-sm text-text-secondary">
                      全选 ({selectedIndices.size}/{parseResult.success.length})
                    </span>
                  </label>

                  {selectedIndices.size > 0 && (
                    <>
                      <div className="flex-1 flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-text-regular" />
                        <span className="text-sm text-text-secondary">批量修改密级：</span>
                        <select
                          value={batchSecurityLevel}
                          onChange={(e) => setBatchSecurityLevel(e.target.value)}
                          className="px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {securityLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleBatchUpdateSecurityLevel}
                          className="px-3 py-1 text-sm bg-info text-white rounded hover:bg-info/90 transition-colors"
                        >
                          应用
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 成功列表 */}
              {parseResult.success.length > 0 && (
                <div className="border border-success/20 rounded-md">
                  <div className="p-3 bg-success/5 border-b border-success/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-text-primary">
                        成功解析 {parseResult.success.length} 人
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {parseResult.success.map((p, i) => {
                      const securityOption = securityLevels.find(s => s.value === p.securityLevel)
                      const securityColorMap: Record<string, string> = {
                        'internal': 'bg-green-500',
                        'confidential': 'bg-yellow-500',
                        'secret': 'bg-red-500'
                      }
                      const securityColor = securityColorMap[p.securityLevel || ''] || 'bg-gray-500'
                      const isSelected = selectedIndices.has(i)
                      return (
                        <div
                          key={i}
                          className={`
                            flex items-center gap-3 px-3 py-2 border-b border-success/10 last:border-b-0
                            ${isSelected ? 'bg-info/5' : 'bg-bg-card hover:bg-muted'}
                            transition-colors cursor-pointer
                          `}
                          onClick={() => handleToggleSelect(i)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-info focus:ring-info rounded"
                          />
                          <span className="font-medium text-text-primary min-w-[80px]">{p.name}</span>
                          <span className="text-text-tertiary">·</span>
                          <span className={`text-xs px-2 py-0.5 rounded text-white ${securityColor}`}>
                            {securityOption?.name || p.securityLevel}
                          </span>
                          {p.password && (
                            <>
                              <span className="text-text-tertiary">·</span>
                              <span className="text-xs text-text-regular">
                                密码: {p.password.substring(0, 3)}***
                              </span>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 错误列表 */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-error/5 border border-error/20 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-error" />
                    <span className="text-sm font-medium text-text-primary">
                      {parseResult.errors.length} 行格式错误
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {parseResult.errors.map((err, i) => (
                      <div key={i} className="text-sm text-error">
                        第 {err.line} 行：{err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        {parseResult && parseResult.success.length > 0 && (
          <div className="p-4 border-t bg-bg-container">
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-info text-white rounded-md hover:bg-info/90 transition-colors font-medium"
            >
              确认导入 {parseResult.success.length} 人
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemporaryParticipantImporter
