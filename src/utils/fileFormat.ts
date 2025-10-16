/**
 * 文件格式工具函数
 * 用于文件上传和验证
 */

import { getConfig } from '@/config'

/**
 * 获取 react-dropzone 的 accept 配置
 * 将 MIME 类型转换为 dropzone 接受的格式
 */
export const getDropzoneAccept = (): Record<string, string[]> => {
  const config = getConfig()
  const accept: Record<string, string[]> = {}
  
  // MIME 类型到文件扩展名的映射
  const mimeToExtensions: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'video/mp4': ['.mp4'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'application/zip': ['.zip']
  }
  
  // 构建 accept 对象
  config.features.upload.allowedTypes.forEach(mimeType => {
    const extensions = mimeToExtensions[mimeType]
    if (extensions) {
      accept[mimeType] = extensions
    }
  })
  
  return accept
}

/**
 * 检查文件是否被支持
 * @param file 要检查的文件
 * @returns 是否支持该文件类型
 */
export const isFileSupported = (file: File): boolean => {
  const config = getConfig()
  const allowedTypes = config.features.upload.allowedTypes
  
  // 检查 MIME 类型
  if (allowedTypes.includes(file.type)) {
    return true
  }
  
  // 检查文件扩展名（作为后备）
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) return false
  
  const extensionToMime: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'zip': 'application/zip'
  }
  
  const mimeType = extensionToMime[extension]
  return mimeType ? allowedTypes.includes(mimeType) : false
}

/**
 * 获取格式化的文件扩展名列表（用于显示）
 * @returns 格式化的扩展名字符串，如 "PDF、DOCX、PPTX"
 */
export const getFormattedExtensions = (): string => {
  const config = getConfig()
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'text/plain': 'TXT',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'video/mp4': 'MP4',
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'application/zip': 'ZIP'
  }
  
  return config.features.upload.allowedTypes
    .map(type => mimeToExt[type] || type)
    .join('、')
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 验证文件大小
 * @param file 要验证的文件
 * @returns 是否符合大小限制
 */
export const isFileSizeValid = (file: File): boolean => {
  const config = getConfig()
  return file.size <= config.features.upload.maxSize
}
