import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode' // ✅ 改用静态导入

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export const SimpleQRCode: React.FC<QRCodeProps> = ({ value, size = 150, className = '' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // ✅ 直接使用已导入的 QRCode
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M' // 添加容错级别
        })
        setQrCodeUrl(url)
        setError(false)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
        setError(true)
      }
    }

    if (value) {
      generateQRCode()
    }
  }, [value, size])

  if (error) {
    // 错误备用方案
    return (
      <div 
        className={`flex items-center justify-center border-2 border-dashed border-border rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center p-2">
          <div className="text-sm text-text-tertiary mb-2">二维码生成失败</div>
          <div className="text-xs font-mono break-all max-w-full overflow-hidden">{value.substring(0, 20)}...</div>
        </div>
      </div>
    )
  }

  if (!qrCodeUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-bg-container rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-sm text-text-tertiary">生成中...</div>
      </div>
    )
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt="QR Code"
      className={`border rounded ${className}`}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }} // ✅ 确保二维码清晰不模糊
    />
  )
}
