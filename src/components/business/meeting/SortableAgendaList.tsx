import React, { useState, useRef, useEffect } from 'react'
import { GripVertical, Trash2, User, Vote } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import SimpleSortableMaterialList from './SimpleSortableMaterialList'
import type { MeetingAgenda, MeetingMaterial, MeetingSecurityLevel, MeetingVote } from '@/types'
import type { SecurityLevelOption } from '@/hooks/useSecurityLevels'

interface SortableAgendaItemProps {
  agenda: MeetingAgenda
  votes: MeetingVote[]
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
  onAddVote: (agendaId: string) => void
  onRemoveVote: (agendaId: string, voteId: string) => void
  onEditVote: (agendaId: string, vote: MeetingVote) => void
  getFileIcon: (fileName: string) => React.ReactNode
  FileDropzone: React.ComponentType<{ agendaId: string }>
  securityLevelOptions: SecurityLevelOption[]
  isDragging: boolean
  dragOverIndex: number | null
  canRemove: boolean
  readOnly?: boolean
  systemSecurityLevel?: 'confidential' | 'secret'
}

const SortableAgendaItem: React.FC<SortableAgendaItemProps> = ({
  agenda,
  votes,
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
  onAddVote,
  onRemoveVote,
  onEditVote,
  getFileIcon,
  FileDropzone,
  securityLevelOptions,
  isDragging,
  dragOverIndex,
  canRemove,
  readOnly = false,
  systemSecurityLevel
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
      draggable={!readOnly}
      onDragStart={!readOnly ? () => onDragStart(index) : undefined}
      onDragOver={!readOnly ? (e) => {
        e.preventDefault()
        onDragOver(index)
      } : undefined}
      onDragEnd={!readOnly ? onDragEnd : undefined}
      className={`border border-border rounded-lg overflow-hidden transition-all ${
        isCurrentDragging 
          ? 'opacity-50 scale-95' 
          : isDropTarget 
          ? 'border-primary/30 border-dashed bg-primary/5' 
          : ''
      }`}
    >
      {/* 议题标题栏 */}
      <div className="bg-primary/5 border-b border-border p-3">
        <div className="flex items-center gap-3">
          {/* 拖拽手柄 */}
          {!readOnly && (
            <div className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-primary text-text-inverse rounded-full flex items-center justify-center text-sm font-medium">
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
                className={`flex-1 ${!readOnly ? 'cursor-pointer hover:bg-primary/10' : ''} rounded px-2 py-1 transition-colors`}
                onClick={!readOnly ? () => onStartEdit(agenda.id) : undefined}
              >
                <span className="text-sm font-medium text-text-primary">
                  {agenda.title || `议题 ${index + 1}`}
                </span>
                {!agenda.title && !readOnly && (
                  <span className="text-xs text-text-regular ml-2">点击编辑</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* 🎯 问题3修复：编辑主讲人按钮 */}
            {!readOnly && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowPresenterModal(true)}
                className="h-8 w-8 p-0 text-text-regular hover:text-primary"
                title="编辑主讲人"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
            {/* 🎯 问题1修复：主讲人显示在按钮后面，不显示图标避免重复 */}
            {agenda.presenter && (
              <span className="text-xs text-text-secondary bg-primary/5 px-2 py-0.5 rounded">
                {agenda.presenter}
              </span>
            )}
            {!readOnly && canRemove && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRemove(agenda.id)}
                className="h-8 w-8 p-0 text-text-regular hover:text-error"
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
        {!readOnly && (
          <div>
            <FileDropzone agendaId={agenda.id} />
          </div>
        )}

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
            securityLevelOptions={securityLevelOptions}
            readOnly={readOnly}
            systemSecurityLevel={systemSecurityLevel}
          />
        )}
        
        {/* 投票列表 */}
        {votes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-text-secondary">投票</h4>
            </div>
            {votes.map((vote) => (
              <div
                key={vote.id}
                className="border border-border rounded-lg p-3 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Vote className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-text-primary">{vote.title}</span>
                    <Badge variant={vote.voteType === 'simple' ? 'default' : 'secondary'} size="sm">
                      {vote.voteType === 'simple' ? '简单表决' : '自定义'}
                    </Badge>
                    {vote.isAnonymous && (
                      <Badge variant="outline" size="sm">匿名</Badge>
                    )}
                    {vote.voteType === 'custom' && vote.allowMultiple && (
                      <Badge variant="outline" size="sm">多选</Badge>
                    )}
                    {vote.securityLevel && (
                      <Badge variant="warning" size="sm">
                        {securityLevelOptions.find(opt => opt.value === vote.securityLevel)?.label || vote.securityLevel}
                      </Badge>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVote(agenda.id, vote)}
                        className="h-7 text-xs"
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveVote(agenda.id, vote.id)}
                        className="h-7 text-xs text-text-regular hover:text-error"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-text-tertiary">
                  选项: {vote.options.map(opt => opt.label).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 添加投票按钮 */}
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddVote(agenda.id)}
            className="w-full"
          >
            <Vote className="h-4 w-4 mr-2" />
            添加投票
          </Button>
        )}
      </div>
      
      {/* 🎯 问题3修复：主讲人编辑弹窗 */}
      {showPresenterModal && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="bg-bg-card rounded-lg p-6 w-96">
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
              <p className="text-xs text-text-regular mt-1">
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
  votes: MeetingVote[]
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
  onAddVote: (agendaId: string) => void
  onRemoveVote: (agendaId: string, voteId: string) => void
  onEditVote: (agendaId: string, vote: MeetingVote) => void
  getFileIcon: (fileName: string) => React.ReactNode
  FileDropzone: React.ComponentType<{ agendaId: string }>
  securityLevelOptions: SecurityLevelOption[]
  readOnly?: boolean
  systemSecurityLevel?: 'confidential' | 'secret'
}

const SortableAgendaList: React.FC<SortableAgendaListProps> = ({
  agendas,
  votes: votesProps,
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
  onAddVote,
  onRemoveVote,
  onEditVote,
  getFileIcon,
  FileDropzone,
  securityLevelOptions,
  readOnly = false,
  systemSecurityLevel
}) => {
  // 🛡️ 防御性编程：确保 votes 是数组
  const votes = Array.isArray(votesProps) ? votesProps : []
  
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
      {agendas.map((agenda, index) => {
        const agendaVotes = votes.filter(v => v.agendaId === agenda.id)
        return (
          <SortableAgendaItem
            key={agenda.id}
            agenda={agenda}
            votes={agendaVotes}
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
            onAddVote={onAddVote}
            onRemoveVote={onRemoveVote}
            onEditVote={onEditVote}
            getFileIcon={getFileIcon}
            FileDropzone={FileDropzone}
            securityLevelOptions={securityLevelOptions}
            isDragging={dragIndex === index}
            dragOverIndex={dragOverIndex}
            canRemove={agendas.length > 1}
            readOnly={readOnly}
            systemSecurityLevel={systemSecurityLevel}
          />
        )
      })}
    </div>
  )
}

export default SortableAgendaList
