import React, { useCallback } from 'react'
import { Input, Button } from '@/components'
import { X, FileText, File, Image } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel } from '@/types'

const securityLevelOptions = [
  { value: 'internal', label: '内部' },
  { value: 'confidential', label: '秘密' },
  { value: 'secret', label: '机密' }
]

interface AgendaFormProps {
  agendas: MeetingAgenda[]
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onFileUpload: (agendaId: string, files: File[]) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
}

const AgendaForm: React.FC<AgendaFormProps> = ({
  agendas,
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const FileDropzone: React.FC<{ agendaId: string }> = ({ agendaId }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      onFileUpload(agendaId, acceptedFiles)
    }, [agendaId])

    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragReject,
      rejectedFiles
    } = useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'image/*': ['.jpg', '.jpeg', '.png', '.gif']
      },
      maxSize: 50 * 1024 * 1024, // 50MB
      multiple: true
    })

    return (
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <FileText className="h-8 w-8 mb-2 text-gray-400" />
            {isDragActive ? (
              isDragReject ? (
                <p className="text-sm text-red-600">不支持的文件类型</p>
              ) : (
                <p className="text-sm text-blue-600">松开鼠标上传文件</p>
              )
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-xs text-gray-500">
                  支持 PDF, Word, Excel, PowerPoint, 图片格式，最大50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 显示被拒绝的文件 */}
        {rejectedFiles && rejectedFiles.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
            {rejectedFiles.map(({ file, errors }) => (
              <div key={file.name}>
                {file.name} - {errors.map(e => e.message).join(', ')}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
            <FileDropzone agendaId={agenda.id} />

            {/* 已上传文件列表 */}
            {agenda.materials.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">已上传文件 ({agenda.materials.length})：</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agenda.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(material.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={material.name}>
                            {material.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(material.size)} • {material.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <select
                          value={material.securityLevel}
                          onChange={(e) => onUpdateMaterialSecurity(agenda.id, material.id, e.target.value as MeetingSecurityLevel)}
                          className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AgendaForm
