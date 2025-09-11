import React, { useState } from 'react'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components'
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
  const securityLevelOptions = [
    { value: 'internal', label: '内部' },
    { value: 'confidential', label: '秘密' },
    { value: 'secret', label: '机密' }
  ]

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
          ? 'bg-blue-50 border-2 border-blue-300 border-dashed' 
          : 'hover:bg-gray-50 border-2 border-transparent'
      }`}
    >
      {/* 拖拽手柄 */}
      <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 文件信息 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(material.name)}
        <span className="text-sm text-gray-900 truncate" title={material.name}>
          {material.name}
        </span>
      </div>

      {/* 安全级别选择 */}
      <select
        value={material.securityLevel}
        onChange={(e) => onUpdateSecurity(material.id, e.target.value as MeetingSecurityLevel)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {securityLevelOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 删除按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(material.id)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
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
