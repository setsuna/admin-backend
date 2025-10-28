import React, { useState } from 'react'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MeetingMaterial, MeetingSecurityLevel } from '@/types'

interface SimpleSortableItemProps {
  material: MeetingMaterial
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
  onUpdateSecurity: (id: string, level: MeetingSecurityLevel) => void
  getFileIcon: (fileName: string) => React.ReactNode
  isDragging: boolean
  dragOverIndex: number | null
}

const SimpleSortableItem: React.FC<SimpleSortableItemProps> = ({
  material,
  index,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
  onUpdateSecurity,
  getFileIcon,
  isDragging,
  dragOverIndex
}) => {
  // ✅ 密级配置：颜色圆点 + 标签
  const securityLevelConfig: Record<MeetingSecurityLevel, { color: string; label: string; textColor: string }> = {
    public: {
      color: 'bg-muted-foreground hover:bg-muted-foreground/80',  // ⚪ 灰色 = 公开
      label: '[公开]',
      textColor: 'text-text-secondary'
    },
    internal: { 
      color: 'bg-success hover:bg-success/80',  // 🟢 绿色 = 内部
      label: '[内部]',
      textColor: 'text-success'
    },
    confidential: { 
      color: 'bg-warning hover:bg-warning/80',  // 🟡 黄色 = 秘密
      label: '[秘密]',
      textColor: 'text-warning'
    },
    secret: { 
      color: 'bg-error hover:bg-error/80',  // 🔴 红色 = 机密
      label: '[机密]',
      textColor: 'text-error'
    },
    top_secret: {
      color: 'bg-purple-500 hover:bg-purple-600',  // 🟣 紫色 = 绝密
      label: '[绝密]',
      textColor: 'text-purple-600'
    }
  }

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
      className={`flex items-center gap-3 p-2 rounded-md group transition-all ${
        isCurrentDragging 
          ? 'opacity-50 scale-95' 
          : isDropTarget 
          ? 'bg-primary/5 border-2 border-primary/30 border-dashed' 
          : 'hover:bg-muted border-2 border-transparent'
      }`}
    >
      {/* 拖拽手柄 */}
      <div className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 文件信息 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(material.name || material.originalName || 'unknown')}
        <span className="text-sm text-text-primary truncate" title={material.name || material.originalName}>
          {material.name || material.originalName || '未命名文件'}
        </span>
        {/* ✅ 显示密级标签 */}
        {material.securityLevel && (
          <span className={`text-xs font-medium ${securityLevelConfig[material.securityLevel].textColor}`}>
            {securityLevelConfig[material.securityLevel].label}
          </span>
        )}
      </div>

      {/* ✅ 密级选择：3个颜色圆点（绿黄红顺序） */}
      <div className="flex items-center gap-1.5">
        {['internal', 'secret', 'confidential'].map((level) => {
          const config = securityLevelConfig[level as keyof typeof securityLevelConfig]
          const isSelected = material.securityLevel === level
          return (
            <button
              key={level}
              onClick={() => onUpdateSecurity(material.id, level as MeetingSecurityLevel)}
              className={`w-3 h-3 rounded-full transition-all ${
                isSelected 
                  ? `${config.color} ring-2 ring-offset-1 ring-border` 
                  : `${config.color} opacity-40 hover:opacity-70`
              }`}
              title={config.label}
            />
          )
        })}
      </div>

      {/* 删除按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(material.id)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-error"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface SimpleSortableMaterialListProps {
  materials: MeetingMaterial[]
  onReorder: (newOrder: MeetingMaterial[]) => void
  onRemoveMaterial: (materialId: string) => void
  onUpdateMaterialSecurity: (materialId: string, securityLevel: MeetingSecurityLevel) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

const SimpleSortableMaterialList: React.FC<SimpleSortableMaterialListProps> = ({
  materials,
  onReorder,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  getFileIcon
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
      const newMaterials = [...materials]
      const draggedItem = newMaterials[dragIndex]
      
      // 移除拖拽的项目
      newMaterials.splice(dragIndex, 1)
      // 在新位置插入
      newMaterials.splice(dragOverIndex, 0, draggedItem)
      
      onReorder(newMaterials)
    }
    
    setDragIndex(null)
    setDragOverIndex(null)
  }

  if (materials.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">排序材料（拖拽调整顺序）</span>
      </div>
      
      <div className="space-y-1">
        {materials.map((material, index) => (
          <SimpleSortableItem
            key={material.id}
            material={material}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onRemove={onRemoveMaterial}
            onUpdateSecurity={onUpdateMaterialSecurity}
            getFileIcon={getFileIcon}
            isDragging={dragIndex === index}
            dragOverIndex={dragOverIndex}
          />
        ))}
      </div>
    </div>
  )
}

export default SimpleSortableMaterialList
