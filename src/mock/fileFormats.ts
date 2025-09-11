// Mock 文件格式支持数据
export interface FileFormat {
  extension: string
  mimeType: string
  category: 'document' | 'presentation' | 'spreadsheet' | 'image' | 'video' | 'audio' | 'archive' | 'text'
  maxSize?: number // 字节，可选的单独限制
}

export const mockSupportedFormats: FileFormat[] = [
  // 文档类
  { extension: '.doc', mimeType: 'application/msword', category: 'document' },
  { extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' },
  { extension: '.pdf', mimeType: 'application/pdf', category: 'document' },
  { extension: '.txt', mimeType: 'text/plain', category: 'text' },
  
  // 演示文稿
  { extension: '.ppt', mimeType: 'application/vnd.ms-powerpoint', category: 'presentation' },
  { extension: '.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'presentation' },
  
  // 表格
  { extension: '.xls', mimeType: 'application/vnd.ms-excel', category: 'spreadsheet' },
  { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'spreadsheet' },
  
  // 图片
  { extension: '.png', mimeType: 'image/png', category: 'image' },
  { extension: '.jpg', mimeType: 'image/jpeg', category: 'image' },
  { extension: '.jpeg', mimeType: 'image/jpeg', category: 'image' },
  { extension: '.bmp', mimeType: 'image/bmp', category: 'image' },
  { extension: '.svg', mimeType: 'image/svg+xml', category: 'image' },
  { extension: '.webp', mimeType: 'image/webp', category: 'image' },
  { extension: '.ico', mimeType: 'image/x-icon', category: 'image' },
  
  // 视频
  { extension: '.mp4', mimeType: 'video/mp4', category: 'video' },
  { extension: '.webm', mimeType: 'video/webm', category: 'video' },
  { extension: '.ogv', mimeType: 'video/ogg', category: 'video' },
  
  // 音频
  { extension: '.mp3', mimeType: 'audio/mpeg', category: 'audio' },
  { extension: '.wav', mimeType: 'audio/wav', category: 'audio' },
  { extension: '.ogg', mimeType: 'audio/ogg', category: 'audio' },
  
  // 压缩包
  { extension: '.rar', mimeType: 'application/vnd.rar', category: 'archive' },
  { extension: '.zip', mimeType: 'application/zip', category: 'archive' },
  
  // 其他
  { extension: '.xml', mimeType: 'application/xml', category: 'text' },
  { extension: '.json', mimeType: 'application/json', category: 'text' }
]

// 获取支持的文件格式
export const getSupportedFormats = (): FileFormat[] => {
  return mockSupportedFormats
}

// 获取格式化的扩展名字符串
export const getFormattedExtensions = (): string => {
  return mockSupportedFormats.map(format => format.extension).join(',')
}

// 生成 dropzone 的 accept 对象
export const getDropzoneAccept = () => {
  const accept: Record<string, string[]> = {}
  
  mockSupportedFormats.forEach(format => {
    if (accept[format.mimeType]) {
      accept[format.mimeType].push(format.extension)
    } else {
      accept[format.mimeType] = [format.extension]
    }
  })
  
  return accept
}

// 检查文件是否支持
export const isFileSupported = (file: File): boolean => {
  const fileName = file.name.toLowerCase()
  const fileExtension = '.' + fileName.split('.').pop()
  
  return mockSupportedFormats.some(format => 
    format.extension === fileExtension || file.type === format.mimeType
  )
}

// 按类别获取格式
export const getFormatsByCategory = (category: FileFormat['category']): FileFormat[] => {
  return mockSupportedFormats.filter(format => format.category === category)
}
