import React, { useState } from 'react'
import { FileText, CheckCircle, AlertCircle } from 'lucide-react'
import type { TemporaryParticipant } from '@/types'

interface TemporaryParticipantImporterProps {
  onImport: (participants: TemporaryParticipant[]) => void
}

interface ParseResult {
  success: TemporaryParticipant[]
  errors: Array<{ line: number; message: string }>
}

const SECURITY_LEVEL_CONFIG = {
  unclassified: { label: '普通', icon: '🔓', badge: 'bg-gray-100 text-gray-800' },
  confidential: { label: '机密', icon: '🔒', badge: 'bg-blue-100 text-blue-800' },
  secret: { label: '绝密', icon: '🔒', badge: 'bg-orange-100 text-orange-800' },
  top_secret: { label: '最高机密', icon: '🔐', badge: 'bg-red-100 text-red-800' }
}

const parseTemporaryParticipants = (text: string): ParseResult => {
  const lines = text.trim().split('\n').filter(line => line.trim())
  const success: TemporaryParticipant[] = []
  const errors: Array<{ line: number; message: string }> = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // 支持多种分隔符：逗号、Tab
    const parts = trimmedLine.split(/[,，\t]/).map(p => p.trim()).filter(p => p)

    if (parts.length === 0) {
      errors.push({ line: index + 1, message: '空行' })
      return
    }

    const name = parts[0]
    if (!name) {
      errors.push({ line: index + 1, message: '姓名不能为空' })
      return
    }

    success.push({
      name,
      department: parts[1] || '外部',
      email: parts[2] || '',
      securityLevel: parts[3] || 'unclassified'
    })
  })

  return { success, errors }
}

const TemporaryParticipantImporter: React.FC<TemporaryParticipantImporterProps> = ({
  onImport
}) => {
  const [inputText, setInputText] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  const handleParse = (text: string) => {
    setInputText(text)
    if (!text.trim()) {
      setParseResult(null)
      return
    }
    const result = parseTemporaryParticipants(text)
    setParseResult(result)
  }

  const handleConfirm = () => {
    if (parseResult && parseResult.success.length > 0) {
      onImport(parseResult.success)
      setInputText('')
      setParseResult(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-medium text-blue-900 mb-1">格式说明</div>
            <div className="text-blue-700 space-y-1">
              <div>• 完整格式：姓名,部门,邮箱,密级</div>
              <div className="text-xs text-blue-600 pl-4">
                示例：张三,外部单位,zhang@example.com,confidential
              </div>
              <div>• 简化格式：姓名,部门,邮箱</div>
              <div className="text-xs text-blue-600 pl-4">
                示例：李四,合作方,li@example.com
              </div>
              <div>• 仅姓名：张三（默认外部人员、普通密级）</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          value={inputText}
          onChange={(e) => handleParse(e.target.value)}
          placeholder="在此粘贴人员名单...&#10;&#10;支持从 Excel 或文本文件复制粘贴&#10;每行一个人员信息"
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
                    const securityConfig = SECURITY_LEVEL_CONFIG[p.securityLevel as keyof typeof SECURITY_LEVEL_CONFIG]
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm text-green-800">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-green-600">·</span>
                        <span>{p.department}</span>
                        {p.email && (
                          <>
                            <span className="text-green-600">·</span>
                            <span>{p.email}</span>
                          </>
                        )}
                        {securityConfig && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${securityConfig.badge}`}>
                            {securityConfig.icon} {securityConfig.label}
                          </span>
                        )}
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
            onClick={handleConfirm}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            确认导入 {parseResult.success.length} 人
          </button>
        </div>
      )}
    </div>
  )
}

export default TemporaryParticipantImporter
