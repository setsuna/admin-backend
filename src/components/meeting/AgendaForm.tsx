import React from 'react'
import { Input, Button } from '@/components'
import { Plus, X, Upload } from 'lucide-react'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel } from '@/types'

const securityLevelOptions = [
  { value: 'internal', label: '内部' },
  { value: 'confidential', label: '秘密' },
  { value: 'secret', label: '机密' }
]

interface AgendaFormProps {
  agendas: MeetingAgenda[]
  onAddAgenda: () => void
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onFileUpload: (agendaId: string, files: FileList | null) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
}

const AgendaForm: React.FC<AgendaFormProps> = ({
  agendas,
  onAddAgenda,
  onRemoveAgenda,
  onUpdateAgendaName,
  onFileUpload,
  onRemoveMaterial,
  onUpdateMaterialSecurity
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleFileSelect = (agendaId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      onFileUpload(agendaId, files)
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">会议议题</h3>
        <Button variant="outline" size="sm" onClick={onAddAgenda}>
          <Plus className="h-4 w-4 mr-2" />
          添加议题
        </Button>
      </div>

      {agendas.map((agenda, index) => (
        <div key={agenda.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              value={agenda.name}
              onChange={(e) => onUpdateAgendaName(agenda.id, e.target.value)}
              placeholder={`议题 ${index + 1} 名称`}
              className="flex-1"
            />
            {agendas.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveAgenda(agenda.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 文件上传区域 */}
          <div>
            <label className="block text-sm font-medium mb-2">上传材料</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => handleFileSelect(agenda.id)}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                点击上传或拖拽文件到此处
              </p>
              <p className="text-xs text-gray-400 mt-1">
                支持 PDF, Word, Excel, PowerPoint 格式
              </p>
            </div>

            {/* 已上传文件列表 */}
            {agenda.materials.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">已上传文件：</p>
                {agenda.materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <p className="font-medium">{material.name}</p>
                        <p className="text-gray-500">{formatFileSize(material.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={material.securityLevel}
                        onChange={(e) => onUpdateMaterialSecurity(agenda.id, material.id, e.target.value as MeetingSecurityLevel)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        {securityLevelOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMaterial(agenda.id, material.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AgendaForm
