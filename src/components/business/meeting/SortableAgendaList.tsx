import React, { useState, useRef, useCallback, useEffect } from 'react'
import { GripVertical, Edit2, Trash2, User } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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
  onUpdateName: (id: string, title: string) => void
  onUpdatePresenter: (id: string, presenter: string) => void
  onStartEdit: (id: string) => void
  onStopEdit: () => void
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
  onUpdatePresenter,
  onStartEdit,
  onStopEdit,
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
  
  // 🎯 问题2修复：添加防抖，避免频繁API调用
  const [localTitle, setLocalTitle] = useState(agenda.title)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // 🎯 问题3修复：主讲人编辑
  const [showPresenterModal, setShowPresenterModal] = useState(false)
  const [presenterInput, setPresenterInput] = useState(agenda.presenter || '')
  
  // 同步外部变化
  useEffect(() => {
    setLocalTitle(agenda.title)
  }, [agenda.title])
  
  useEffect(() => {
    setPresenterInput(agenda.presenter || '')
  }, [agenda.presenter])
  
  // 防抖更新标题
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle)
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 设置新的定时器，800ms后才调用API
    debounceTimerRef.current = setTimeout(() => {
      if (newTitle !== agenda.title) {
        onUpdateName(agenda.id, newTitle)
      }
    }, 800)
  }
  
  // 失焦时立即保存
  const handleTitleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    if (localTitle !== agenda.title) {
      onUpdateName(agenda.id, localTitle)
    }
    onStopEdit()
  }
  
  // 保存主讲人
  const handleSavePresenter = () => {
    onUpdatePresenter(agenda.id, presenterInput)
    setShowPresenterModal(false)
  }
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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
                value={localTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleBlur()
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
                  {agenda.title || `议题 ${index + 1}`}
                </span>
                {!agenda.title && (
                  <span className="text-xs text-gray-500 ml-2">点击编辑</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* 🎯 问题3修复：编辑主讲人按钮 */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPresenterModal(true)}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
              title="编辑主讲人"
            >
              <User className="h-4 w-4" />
            </Button>
            {/* 🎯 问题1修复：主讲人显示在按钮后面，不显示图标避免重复 */}
            {agenda.presenter && (
              <span className="text-xs text-gray-600 bg-blue-50 px-2 py-0.5 rounded">
                {agenda.presenter}
              </span>
            )}
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
      
      {/* 🎯 问题3修复：主讲人编辑弹窗 */}
      {showPresenterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置主讲人</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                主讲人姓名
              </label>
              <Input
                type="text"
                value={presenterInput}
                onChange={(e) => setPresenterInput(e.target.value)}
                placeholder="请输入主讲人姓名"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                留空表示不设置主讲人
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPresenterInput(agenda.presenter || '')
                  setShowPresenterModal(false)
                }}
              >
                取消
              </Button>
              <Button onClick={handleSavePresenter}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SortableAgendaListProps {
  agendas: MeetingAgenda[]
  editingAgenda: string | null
  onReorderAgendas: (newOrder: MeetingAgenda[]) => void
  onRemoveAgenda: (agendaId: string) => void
  onUpdateAgendaName: (agendaId: string, name: string) => void
  onUpdateAgendaPresenter?: (agendaId: string, presenter: string) => void
  onStartEditAgenda: (agendaId: string) => void
  onStopEditAgenda: () => void
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
  onUpdateAgendaPresenter,
  onStartEditAgenda,
  onStopEditAgenda,
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
  
  // 提供默认的主讲人更新函数
  const handleUpdatePresenter = onUpdateAgendaPresenter || (() => {
    console.warn('onUpdateAgendaPresenter not provided')
  })

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
          onUpdatePresenter={handleUpdatePresenter}
          onStartEdit={onStartEditAgenda}
          onStopEdit={onStopEditAgenda}
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
