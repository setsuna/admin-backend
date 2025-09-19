import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  showText = true, 
  size = 'md' 
}) => {
  const appTitle = import.meta.env.VITE_APP_TITLE || '管理系统'
  
  const sizeConfig = {
    sm: {
      leafSize: 32,
      fontSize: 18,
      totalHeight: 40
    },
    md: {
      leafSize: 48,
      fontSize: 28,
      totalHeight: 60
    },
    lg: {
      leafSize: 64,
      fontSize: 36,
      totalHeight: 80
    }
  }
  
  const config = sizeConfig[size]
  
  if (!showText) {
    return (
      <svg
        width={config.leafSize}
        height={config.leafSize}
        viewBox="0 0 600 750"
        className={className}
      >
        <path
          d="M140,713.7c-3.4-16.4-10.3-49.1-11.2-49.1c-145.7-87.1-128.4-238-80.2-324.2C59,449,251.2,524,139.1,656.8 c-0.9,1.7,5.2,22.4,10.3,41.4c22.4-37.9,56-83.6,54.3-87.9C65.9,273.9,496.9,248.1,586.6,39.4c40.5,201.8-20.7,513.9-367.2,593.2 c-1.7,0.9-62.9,108.6-65.5,109.5c0-1.7-25.9-0.9-22.4-9.5C133.1,727.4,136.6,720.6,140,713.7L140,713.7z M135.7,632.6 c44-50.9-7.8-137.9-38.8-166.4C149.5,556.7,146,609.3,135.7,632.6L135.7,632.6z"
          fill="#17541f"
        />
      </svg>
    )
  }
  
  // 计算文字尺寸和布局
  const charWidth = config.fontSize * 1.1 // 中文字符宽度估算
  const textWidth = appTitle.length * charWidth
  const overlapWidth = config.leafSize * 0.15 // 15%重叠
  const totalWidth = config.leafSize + textWidth - overlapWidth
  
  // 叶子在垂直方向的偏移调整
  const leafOffsetY = -config.totalHeight * 0.1 // 向上偏移10%
  
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ height: config.totalHeight }}>
      <svg
        width={totalWidth}
        height={config.totalHeight}
        viewBox={`0 0 ${totalWidth} ${config.totalHeight}`}
        className="overflow-visible"
      >
        {/* 文字SVG - 先渲染（在后面） */}
        <text
          x={config.leafSize - overlapWidth}
          y={config.totalHeight / 2}
          fontSize={config.fontSize}
          fill="#1a1a1a"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontWeight="700"
          dominantBaseline="central"
          textAnchor="start"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          {appTitle}
        </text>
        
        {/* 叶子SVG - 后渲染（在前面，遮挡文字） */}
        <g 
          transform={`translate(0, ${config.totalHeight / 2 - config.leafSize / 2 + leafOffsetY}) scale(${config.leafSize / 600})`}
        >
          <path
            d="M140,713.7c-3.4-16.4-10.3-49.1-11.2-49.1c-145.7-87.1-128.4-238-80.2-324.2C59,449,251.2,524,139.1,656.8 c-0.9,1.7,5.2,22.4,10.3,41.4c22.4-37.9,56-83.6,54.3-87.9C65.9,273.9,496.9,248.1,586.6,39.4c40.5,201.8-20.7,513.9-367.2,593.2 c-1.7,0.9-62.9,108.6-65.5,109.5c0-1.7-25.9-0.9-22.4-9.5C133.1,727.4,136.6,720.6,140,713.7L140,713.7z M135.7,632.6 c44-50.9-7.8-137.9-38.8-166.4C149.5,556.7,146,609.3,135.7,632.6L135.7,632.6z"
            fill="#17541f"
          />
        </g>
      </svg>
    </div>
  )
}
