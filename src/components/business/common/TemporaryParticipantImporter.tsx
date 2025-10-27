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
  defaultPassword: string
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
      securityLevel: defaultSecurityLevel,
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
      return
    }
    const result = parseTemporaryParticipants(text, selectedSecurityLevel, defaultPassword)
    setParseResult(result)
  }

  const handleSecurityLevelChange = (newLevel: string) => {
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
    }
  }

  return (
    <div className="flex h-full">
      {/* 左侧：配置区 */}
      <div className="w-80 border-r bg-blue-50 p-4 space-y-4 overflow-y-auto">
        {/* 格式说明 */}
        <div>
          <div className="flex items-start gap-2 mb-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-blue-900 mb-1">格式说明</div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• 每行一个姓名</div>
                <div className="text-xs text-blue-600 pl-4">
                  示例：张三
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-4">
          {/* 默认密级 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              默认密级
            </label>
            {isLoading ? (
              <div className="text-xs text-blue-600">加载中...</div>
            ) : (
              <div className="space-y-2">
                {securityLevels.map((level) => (
                  <label
                    key={level.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-blue-100 px-2.5 py-1.5 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="securityLevel"
                      value={level.value}
                      checked={selectedSecurityLevel === level.value}
                      onChange={(e) => handleSecurityLevelChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-900">{level.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 默认密码 */}
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              默认密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={defaultPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="统一密码"
                className="w-full px-3 py-1.5 pr-10 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          <div className="p-2 bg-amber-100 border border-amber-300 rounded-md flex items-start gap-2 text-sm text-amber-800">
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
            className="w-full h-32 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          />
        </div>

        {/* 解析结果 */}
        <div className="flex-1 overflow-y-auto">
          {parseResult && (
            <div className="p-4 space-y-3">
              {/* 批量操作栏 */}
              {parseResult.success.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-md">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIndices.size === parseResult.success.length && parseResult.success.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      全选 ({selectedIndices.size}/{parseResult.success.length})
                    </span>
                  </label>

                  {selectedIndices.size > 0 && (
                    <>
                      <div className="flex-1 flex items-center gap-2">
                        <Edit2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">批量修改密级：</span>
                        <select
                          value={batchSecurityLevel}
                          onChange={(e) => setBatchSecurityLevel(e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {securityLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleBatchUpdateSecurityLevel}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
                <div className="border border-green-200 rounded-md">
                  <div className="p-3 bg-green-50 border-b border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        成功解析 {parseResult.success.length} 人
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {parseResult.success.map((p, i) => {
                      const securityOption = securityLevels.find(s => s.value === p.securityLevel)
                      const isSelected = selectedIndices.has(i)
                      return (
                        <div
                          key={i}
                          className={`
                            flex items-center gap-3 px-3 py-2 border-b border-green-100 last:border-b-0
                            ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}
                            transition-colors cursor-pointer
                          `}
                          onClick={() => handleToggleSelect(i)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <span className="font-medium text-gray-900 min-w-[80px]">{p.name}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {securityOption?.name || p.securityLevel}
                          </span>
                          {p.password && (
                            <>
                              <span className="text-gray-400">·</span>
                              <span className="text-xs text-gray-500">
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
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      {parseResult.errors.length} 行格式错误
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {parseResult.errors.map((err, i) => (
                      <div key={i} className="text-sm text-red-700">
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
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleConfirm}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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
