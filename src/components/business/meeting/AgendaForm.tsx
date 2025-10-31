import React, { useCallback, useState } from 'react'
import { FileText, File, Image, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { getDropzoneAccept, isFileSupported } from '@/utils'
import { useSecurityLevels } from '@/hooks/useSecurityLevels'
import SortableAgendaList from './SortableAgendaList'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel, MeetingVote } from '@/types'

interface AgendaFormProps {
  agendas: MeetingAgenda[]
  votes: MeetingVote[]
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onUpdateAgendaPresenter?: (agendaId: string, presenter: string) => void
  onFileUpload: (agendaId: string, files: File[]) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
  onReorderMaterials?: (agendaId: string, materials: MeetingMaterial[]) => void
  onReorderAgendas?: (agendas: MeetingAgenda[]) => void
  onAddVote: (agendaId: string) => void
  onRemoveVote: (agendaId: string, voteId: string) => void
  onEditVote: (agendaId: string, vote: MeetingVote) => void
  readOnly?: boolean
  systemSecurityLevel?: 'confidential' | 'secret'  // 系统密级
}

const AgendaForm: React.FC<AgendaFormProps> = ({
  agendas,
  votes,
  onRemoveAgenda,
  onUpdateAgendaName,
  onUpdateAgendaPresenter,
  onFileUpload,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  onReorderMaterials,
  onReorderAgendas,
  onAddVote,
  onRemoveVote,
  onEditVote,
  readOnly = false,
  systemSecurityLevel
}) => {
  const [editingAgenda, setEditingAgenda] = useState<string | null>(null)
  
  // ✅ 获取安全级别选项（按数据字典排序）
  const { securityLevels } = useSecurityLevels()
  
  const getFileIcon = (fileName: string) => {
    // ✅ 防御性编程：检查 fileName 是否存在
    if (!fileName) {
      return <File className="h-4 w-4 text-text-regular" />
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-error" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-primary" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-4 w-4 text-success" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-4 w-4 text-warning" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4 text-text-regular" />
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
                ? 'border-error/40 bg-error/5'
                : 'border-primary/40 bg-primary/5'
              : 'border-border hover:border-border'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Upload className="h-6 w-6 mb-2 text-text-tertiary" />
            {isDragActive ? (
              isDragReject ? (
                <p className="text-sm text-error">不支持的文件类型</p>
              ) : (
                <p className="text-sm text-primary">松开鼠标上传文件</p>
              )
            ) : (
              <div>
                <p className="text-sm text-text-secondary mb-1">点击上传</p>
              </div>
            )}
          </div>
        </div>

        {/* 显示被拒绝的文件 */}
        {fileRejections && fileRejections.length > 0 && (
          <div className="mt-2 p-2 bg-error/5 rounded text-sm text-error">
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
      votes={votes}
      editingAgenda={editingAgenda}
      onReorderAgendas={onReorderAgendas || (() => {})}
      onRemoveAgenda={onRemoveAgenda}
      onUpdateAgendaName={onUpdateAgendaName}
      onUpdateAgendaPresenter={onUpdateAgendaPresenter}
      onStartEditAgenda={setEditingAgenda}
      onStopEditAgenda={() => setEditingAgenda(null)}
      onRemoveMaterial={onRemoveMaterial}
      onUpdateMaterialSecurity={onUpdateMaterialSecurity}
      onReorderMaterials={onReorderMaterials || (() => {})}
      onAddVote={onAddVote}
      onRemoveVote={onRemoveVote}
      onEditVote={onEditVote}
      getFileIcon={getFileIcon}
      FileDropzone={FileDropzone}
      securityLevelOptions={securityLevels}
      readOnly={readOnly}
      systemSecurityLevel={systemSecurityLevel}
    />
  )
}

export default AgendaForm
