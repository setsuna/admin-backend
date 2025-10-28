// 拖拽排序组件,需要安装 @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
// npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MeetingMaterial, MeetingSecurityLevel } from '@/types'

interface SortableItemProps {
  id: string
  material: MeetingMaterial
  onRemove: (id: string) => void
  onUpdateSecurity: (id: string, level: MeetingSecurityLevel) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  material,
  onRemove,
  onUpdateSecurity,
  getFileIcon
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const securityLevelOptions = [
    { value: 'internal', label: '内部' },
    { value: 'confidential', label: '秘密' },
    { value: 'secret', label: '机密' }
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2 rounded-md group ${
        isDragging ? 'bg-primary/5 shadow-lg' : 'hover:bg-muted'
      }`}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* 文件信息 */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(material.name)}
        <span className="text-sm text-text-primary truncate" title={material.name}>
          {material.name}
        </span>
      </div>

      {/* 安全级别选择 */}
      <select
        value={material.securityLevel || 'internal'}
        onChange={(e) => onUpdateSecurity(material.id, e.target.value as MeetingSecurityLevel)}
        className="text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
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
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-error"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface SortableMaterialListProps {
  materials: MeetingMaterial[]
  onReorder: (newOrder: MeetingMaterial[]) => void
  onRemoveMaterial: (materialId: string) => void
  onUpdateMaterialSecurity: (materialId: string, securityLevel: MeetingSecurityLevel) => void
  getFileIcon: (fileName: string) => React.ReactNode
}

const SortableMaterialList: React.FC<SortableMaterialListProps> = ({
  materials,
  onReorder,
  onRemoveMaterial,
  onUpdateMaterialSecurity,
  getFileIcon
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = materials.findIndex(item => item.id === active.id)
      const newIndex = materials.findIndex(item => item.id === over.id)
      
      const newOrder = arrayMove(materials, oldIndex, newIndex)
      onReorder(newOrder)
    }
  }

  if (materials.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-text-tertiary" />
        <span className="text-sm font-medium text-text-secondary">排序材料</span>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={materials.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {materials.map((material) => (
              <SortableItem
                key={material.id}
                id={material.id}
                material={material}
                onRemove={onRemoveMaterial}
                onUpdateSecurity={onUpdateMaterialSecurity}
                getFileIcon={getFileIcon}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default SortableMaterialList
