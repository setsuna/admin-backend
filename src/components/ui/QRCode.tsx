import React, { useState, useEffect } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

// 简化的二维码组件，如果qrcode库不可用时使用
export const SimpleQRCode: React.FC<QRCodeProps> = ({ value, size = 150, className = '' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // 尝试动态导入qrcode库
        const QRCode = await import('qrcode')
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(url)
        setError(false)
      } catch (err) {
        console.warn('QRCode library not available, using fallback')
        setError(true)
      }
    }

    if (value) {
      generateQRCode()
    }
  }, [value, size])

  if (error) {
    // 如果qrcode库不可用，显示文本备用方案
    return (
      <div 
        className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center p-2">
          <div className="text-sm text-gray-500 mb-2">二维码</div>
          <div className="text-xs font-mono break-all">{value}</div>
        </div>
      </div>
    )
  }

  if (!qrCodeUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-sm text-gray-500">生成中...</div>
      </div>
    )
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt={`QR Code: ${value}`}
      className={`border rounded ${className}`}
      width={size}
      height={size}
    />
  )
}
