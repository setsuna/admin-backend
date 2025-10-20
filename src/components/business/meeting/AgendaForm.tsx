import React, { useCallback, useState } from 'react'
import { FileText, File, Image, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { getDropzoneAccept, isFileSupported } from '@/utils'
import SortableAgendaList from './SortableAgendaList'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel } from '@/types'

interface AgendaFormProps {
  agendas: MeetingAgenda[]
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onFileUpload: (agendaId: string, files: File[]) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
  onReorderMaterials?: (agendaId: string, materials: MeetingMaterial[]) => void
  onReorderAgendas?: (agendas: MeetingAgenda[]) => void
}

const AgendaForm: React.FC<AgendaFormProps> = ({
  agendas,
  onRemoveAgenda,
  onUpdateAgendaName,
  onFileUpload,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  onReorderMaterials,
  onReorderAgendas
}) => {
  const [editingAgenda, setEditingAgenda] = useState<string | null>(null)
  
  const getFileIcon = (fileName: string) => {
    // ✅ 防御性编程：检查 fileName 是否存在
    if (!fileName) {
      return <File className="h-4 w-4 text-gray-500" />
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const FileDropzone: React.FC<{ agendaId: string }> = ({ agendaId }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      // 过滤支持的文件
      const supportedFiles = acceptedFiles.filter(file => isFileSupported(file))
      
      if (supportedFiles.length !== acceptedFiles.length) {
        const unsupportedFiles = acceptedFiles.filter(file => !isFileSupported(file))
        console.warn('不支持的文件类型:', unsupportedFiles.map(f => f.name))
      }
      
      if (supportedFiles.length > 0) {
        onFileUpload(agendaId, supportedFiles)
      }
    }, [agendaId])

    const {
      getRootProps,
      getInputProps,
      isDragActive,
      isDragReject,
      fileRejections
    } = useDropzone({
      onDrop,
      accept: getDropzoneAccept(),
      maxSize: 50 * 1024 * 1024, // 50MB
      multiple: true
    })

    return (
      <div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? isDragReject
                ? 'border-red-400 bg-red-50'
                : 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Upload className="h-6 w-6 mb-2 text-gray-400" />
            {isDragActive ? (
              isDragReject ? (
                <p className="text-sm text-red-600">不支持的文件类型</p>
              ) : (
                <p className="text-sm text-blue-600">松开鼠标上传文件</p>
              )
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">点击上传</p>
              </div>
            )}
          </div>
        </div>

        {/* 显示被拒绝的文件 */}
        {fileRejections && fileRejections.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name}>
                {file.name} - {errors.map((e: any) => e.message).join(', ')}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <SortableAgendaList
      agendas={agendas}
      editingAgenda={editingAgenda}
      onReorderAgendas={onReorderAgendas || (() => {})}
      onRemoveAgenda={onRemoveAgenda}
      onUpdateAgendaName={onUpdateAgendaName}
      onStartEditAgenda={setEditingAgenda}
      onStopEditAgenda={() => setEditingAgenda(null)}
      onRemoveMaterial={onRemoveMaterial}
      onUpdateMaterialSecurity={onUpdateMaterialSecurity}
      onReorderMaterials={onReorderMaterials || (() => {})}
      getFileIcon={getFileIcon}
      FileDropzone={FileDropzone}
    />
  )
}

export default AgendaForm
