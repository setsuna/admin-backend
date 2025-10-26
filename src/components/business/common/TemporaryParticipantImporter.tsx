import React, { useState, useRef } from 'react'
import { FileText, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import SecurityLevelSelect from '@/components/ui/SecurityLevelSelect'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import { Button } from '@/components/ui/Button'
import type { TemporaryParticipant } from '@/types'

interface TemporaryParticipantImporterProps {
  onImport: (participants: TemporaryParticipant[]) => void
}

interface ParseResult {
  success: TemporaryParticipant[]
  errors: Array<{ line: number; message: string }>
}

type Mode = 'manual' | 'batch'

const parseTemporaryParticipants = (text: string, defaultSecurityLevel: string): ParseResult => {
  const lines = text.trim().split('\n').filter(line => line.trim())
  const success: TemporaryParticipant[] = []
  const errors: Array<{ line: number; message: string }> = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    const parts = trimmedLine.split(/[,，]/).map(p => p.trim()).filter(p => p)

    if (parts.length === 0) {
      errors.push({ line: index + 1, message: '空行' })
      return
    }

    const name = parts[0]
    if (!name) {
      errors.push({ line: index + 1, message: '姓名不能为空' })
      return
    }

    const securityLevel = parts[1] || defaultSecurityLevel

    success.push({
      name,
      department: '外部',
      email: '',
      securityLevel
    })
  })

  return { success, errors }
}

const TemporaryParticipantImporter: React.FC<TemporaryParticipantImporterProps> = ({
  onImport
}) => {
  const [mode, setMode] = useState<Mode>('manual')
  const [inputText, setInputText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  
  // 手动添加模式
  const [manualName, setManualName] = useState('')
  const [manualSecurityLevel, setManualSecurityLevel] = useState('')
  const { securityLevels, isLoading } = useSecurityLevels()
  const securitySelectRef = useRef<{ focus: () => void; openDropdown: () => void } | null>(null)

  // 设置默认密级为第一个
  React.useEffect(() => {
    if (!manualSecurityLevel && securityLevels.length > 0) {
      setManualSecurityLevel(securityLevels[0].value)
    }
  }, [securityLevels, manualSecurityLevel])

  const handleParse = (text: string) => {
    setInputText(text)
    if (!text.trim()) {
      setParseResult(null)
      return
    }
    const defaultSecurityLevel = securityLevels[0]?.value || 'unclassified'
    const result = parseTemporaryParticipants(text, defaultSecurityLevel)
    setParseResult(result)
  }

  const handleBatchConfirm = () => {
    if (parseResult && parseResult.success.length > 0) {
      onImport(parseResult.success)
      setInputText('')
      setParseResult(null)
    }
  }

  const handleManualAdd = () => {
    if (!manualName.trim()) {
      return
    }

    const participant: TemporaryParticipant = {
      name: manualName.trim(),
      department: '外部',
      email: '',
      securityLevel: manualSecurityLevel
    }

    onImport([participant])
    setManualName('')
    setManualSecurityLevel(securityLevels[0]?.value || '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setManualName(value)
    
    // 检测逗号输入
    if (value.endsWith(',') || value.endsWith('，')) {
      // 移除逗号
      setManualName(value.slice(0, -1))
      // 聚焦到密级选择框并展开
      setTimeout(() => {
        securitySelectRef.current?.focus()
        securitySelectRef.current?.openDropdown()
      }, 0)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && manualName.trim()) {
      e.preventDefault()
      handleManualAdd()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode切换 */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setMode('manual')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
              ${mode === 'manual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <UserPlus className="h-4 w-4" />
            单个添加
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
              ${mode === 'batch'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <FileText className="h-4 w-4" />
            批量导入
          </button>
        </div>
      </div>

      {/* 手动添加模式 */}
      {mode === 'manual' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <div className="font-medium mb-1">快捷操作提示</div>
              <div className="space-y-1 text-xs">
                <div>• 输入逗号：自动切换到密级字段</div>
                <div>• 数字键 1-4：快速选择密级</div>
                <div>• Enter键：添加人员</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualName}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                placeholder="请输入临时人员姓名"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密级 <span className="text-red-500">*</span>
              </label>
              {isLoading ? (
                <div className="text-sm text-gray-500">加载密级选项...</div>
              ) : (
                <SecurityLevelSelect
                  ref={securitySelectRef}
                  value={manualSecurityLevel}
                  onChange={setManualSecurityLevel}
                  options={securityLevels}
                />
              )}
            </div>

            <Button
              onClick={handleManualAdd}
              disabled={!manualName.trim() || !manualSecurityLevel || isLoading}
              className="w-full"
            >
              添加到列表
            </Button>
          </div>
        </div>
      )}

      {/* 批量导入模式 */}
      {mode === 'batch' && (
        <>
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-medium text-blue-900 mb-1">格式说明</div>
                <div className="text-blue-700 space-y-1">
                  <div>• 每行一个人员</div>
                  <div>• 格式：姓名,密级（可选）</div>
                  <div className="text-xs text-blue-600 pl-4">
                    示例1：张三,secret
                  </div>
                  <div className="text-xs text-blue-600 pl-4">
                    示例2：李四（密级使用默认值）
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <textarea
              value={inputText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="在此粘贴人员名单...&#10;&#10;每行一个人员&#10;格式：姓名,密级"
              className="w-full h-48 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
            />

            {parseResult && (
              <div className="mt-4 space-y-3">
                {parseResult.success.length > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        成功解析 {parseResult.success.length} 人
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {parseResult.success.map((p, i) => {
                        const securityOption = securityLevels.find(s => s.value === p.securityLevel)
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm text-green-800">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-green-600">·</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              {securityOption?.name || p.securityLevel}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

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

          {parseResult && parseResult.success.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={handleBatchConfirm}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                确认导入 {parseResult.success.length} 人
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TemporaryParticipantImporter
