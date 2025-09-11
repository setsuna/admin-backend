import React, { useState, useEffect } from 'react'

interface ResizablePanelProps {
  children: [React.ReactNode, React.ReactNode]
  defaultLeftWidth?: number
  minWidth?: number
  maxWidth?: number
  className?: string
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultLeftWidth = 50,
  minWidth = 20,
  maxWidth = 80,
  className = ''
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const container = document.querySelector('.resizable-container') as HTMLElement
      if (container) {
        const rect = container.getBoundingClientRect()
        const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100
        if (newLeftWidth > minWidth && newLeftWidth < maxWidth) {
          setLeftWidth(newLeftWidth)
        }
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className={`resizable-container flex relative ${className}`}>
      {/* 左侧面板 */}
      <div 
        className="overflow-y-auto pr-3" 
        style={{ width: `${leftWidth}%` }}
      >
        {children[0]}
      </div>

      {/* 分割器 */}
      <div 
        className={`w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 ${
          isDragging ? 'bg-blue-400' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-0.5 h-8 bg-gray-400 rounded"></div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div 
        className="overflow-y-auto pl-3" 
        style={{ width: `${100 - leftWidth}%` }}
      >
        {children[1]}
      </div>
    </div>
  )
}

export default ResizablePanel
