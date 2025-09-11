import React, { useState } from 'react'
import { GripVertical, X, Edit2, Trash2 } from 'lucide-react'
import { Input, Button } from '@/components'
import SimpleSortableMaterialList from './SimpleSortableMaterialList'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel } from '@/types'

interface SortableAgendaItemProps {
  agenda: MeetingAgenda
  index: number
  editingAgenda: string | null
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
  onUpdateName: (id: string, name: string) => void
  onStartEdit: (id: string) => void
  onStopEdit: () => void
  onFileUpload: (agendaId: string, files: File[]) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
  onReorderMaterials: (agendaId: string, materials: MeetingMaterial[]) => void
  getFileIcon: (fileName: string) => React.ReactNode
  FileDropzone: React.ComponentType<{ agendaId: string }>
  isDragging: boolean
  dragOverIndex: number | null
  canRemove: boolean
}

const SortableAgendaItem: React.FC<SortableAgendaItemProps> = ({
  agenda,
  index,
  editingAgenda,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
  onUpdateName,
  onStartEdit,
  onStopEdit,
  onFileUpload,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  onReorderMaterials,
  getFileIcon,
  FileDropzone,
  isDragging,
  dragOverIndex,
  canRemove
}) => {
  const isCurrentDragging = isDragging
  const isDropTarget = dragOverIndex === index

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(index)
      }}
      onDragEnd={onDragEnd}
      className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${
        isCurrentDragging 
          ? 'opacity-50 scale-95' 
          : isDropTarget 
          ? 'border-blue-300 border-dashed bg-blue-50' 
          : ''
      }`}
    >
      {/* 议题标题栏 */}
      <div className="bg-blue-50 border-b border-gray-200 p-3">
        <div className="flex items-center gap-3">
          {/* 拖拽手柄 */}
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            {editingAgenda === agenda.id ? (
              <Input
                value={agenda.name}
                onChange={(e) => onUpdateName(agenda.id, e.target.value)}
                onBlur={onStopEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onStopEdit()
                  }
                }}
                autoFocus
                className="flex-1 h-8 text-sm"
                placeholder={`议题 ${index + 1}`}
              />
            ) : (
              <div 
                className="flex-1 cursor-pointer hover:bg-blue-100 rounded px-2 py-1 transition-colors"
                onClick={() => onStartEdit(agenda.id)}
              >
                <span className="text-sm font-medium text-gray-900">
                  {agenda.name || `议题 ${index + 1}`}
                </span>
                {!agenda.name && (
                  <span className="text-xs text-gray-500 ml-2">点击编辑</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onStartEdit(agenda.id)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {canRemove && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemove(agenda.id)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 议题内容 */}
      <div className="p-4 space-y-4">
        {/* 材料上传区域 */}
        <div>
          <FileDropzone agendaId={agenda.id} />
        </div>

        {/* 已上传材料列表 */}
        {agenda.materials.length > 0 && (
          <SimpleSortableMaterialList
            materials={agenda.materials}
            onReorder={(newOrder) => onReorderMaterials(agenda.id, newOrder)}
            onRemoveMaterial={(materialId) => onRemoveMaterial(agenda.id, materialId)}
            onUpdateMaterialSecurity={(materialId, securityLevel) => 
              onUpdateMaterialSecurity(agenda.id, materialId, securityLevel)
            }
            getFileIcon={getFileIcon}
          />
        )}
      </div>
    </div>
  )
}

interface SortableAgendaListProps {
  agendas: MeetingAgenda[]
  editingAgenda: string | null
  onReorderAgendas: (newOrder: MeetingAgenda[]) => void
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onStartEditAgenda: (agendaId: string) => void
  onStopEditAgenda: () => void
  onFileUpload: (agendaId: string, files: File[]) => void
  onRemoveMaterial: (agendaId: string, materialId: string) => void
  onUpdateMaterialSecurity: (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => void
  onReorderMaterials: (agendaId: string, materials: MeetingMaterial[]) => void
  getFileIcon: (fileName: string) => React.ReactNode
  FileDropzone: React.ComponentType<{ agendaId: string }>
}

const SortableAgendaList: React.FC<SortableAgendaListProps> = ({
  agendas,
  editingAgenda,
  onReorderAgendas,
  onRemoveAgenda,
  onUpdateAgendaName,
  onStartEditAgenda,
  onStopEditAgenda,
  onFileUpload,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  onReorderMaterials,
  getFileIcon,
  FileDropzone
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newAgendas = [...agendas]
      const draggedItem = newAgendas[dragIndex]
      
      // 移除拖拽的项目
      newAgendas.splice(dragIndex, 1)
      // 在新位置插入
      newAgendas.splice(dragOverIndex, 0, draggedItem)
      
      onReorderAgendas(newAgendas)
    }
    
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-3">
      {agendas.map((agenda, index) => (
        <SortableAgendaItem
          key={agenda.id}
          agenda={agenda}
          index={index}
          editingAgenda={editingAgenda}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onRemove={onRemoveAgenda}
          onUpdateName={onUpdateAgendaName}
          onStartEdit={onStartEditAgenda}
          onStopEdit={onStopEditAgenda}
          onFileUpload={onFileUpload}
          onRemoveMaterial={onRemoveMaterial}
          onUpdateMaterialSecurity={onUpdateMaterialSecurity}
          onReorderMaterials={onReorderMaterials}
          getFileIcon={getFileIcon}
          FileDropzone={FileDropzone}
          isDragging={dragIndex === index}
          dragOverIndex={dragOverIndex}
          canRemove={agendas.length > 1}
        />
      ))}
    </div>
  )
}

export default SortableAgendaList
