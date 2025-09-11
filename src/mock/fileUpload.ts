// Mock 文件上传服务
export interface MockUploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url: string
}

// 生成随机 ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 模拟文件上传延迟
const simulateDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock 文件上传
export const mockFileUpload = async (
  meetingId: string, 
  file: File, 
  agendaId: string
): Promise<MockUploadedFile> => {
  // 模拟上传延迟
  await simulateDelay(200 + Math.random() * 500) // 200-700ms 随机延迟
  
  // 降低失败率到 3%
  if (Math.random() < 0.03) {
    throw new Error('文件上传失败，请重试')
  }
  
  // 生成模拟上传结果
  const uploadedFile: MockUploadedFile = {
    id: generateId(),
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    url: URL.createObjectURL(file) // 创建临时 URL 用于预览
  }
  
  console.log(`[Mock] 文件上传成功: ${file.name} -> 会议: ${meetingId}, 议题: ${agendaId}`)
  
  return uploadedFile
}

// Mock 文件删除
export const mockFileDelete = async (meetingId: string, fileId: string): Promise<void> => {
  await simulateDelay(200)
  
  // 降低删除失败率到 2%
  if (Math.random() < 0.02) {
    throw new Error('文件删除失败，请重试')
  }
  
  console.log(`[Mock] 文件删除成功: ${fileId} from 会议: ${meetingId}`)
}

// 批量上传文件
export const mockBatchFileUpload = async (
  meetingId: string,
  files: File[],
  agendaId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<MockUploadedFile[]> => {
  const results: MockUploadedFile[] = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await mockFileUpload(meetingId, files[i], agendaId)
      results.push(result)
      onProgress?.(i + 1, files.length)
    } catch (error) {
      console.error(`文件 ${files[i].name} 上传失败:`, error)
      // 继续上传其他文件
    }
  }
  
  return results
}

// Mock 材料排序 API
export const mockUpdateMaterialOrder = async (
  meetingId: string,
  agendaId: string,
  materialIds: string[]
): Promise<void> => {
  await simulateDelay(300)
  
  if (Math.random() < 0.05) {
    throw new Error('更新材料排序失败，请重试')
  }
  
  console.log(`[Mock] 材料排序更新成功: 会议: ${meetingId}, 议题: ${agendaId}, 顺序: ${materialIds.join(', ')}`)
}

// Mock 议题排序 API
export const mockUpdateAgendaOrder = async (
  meetingId: string,
  agendaIds: string[]
): Promise<void> => {
  await simulateDelay(300)
  
  if (Math.random() < 0.05) {
    throw new Error('更新议题排序失败，请重试')
  }
  
  console.log(`[Mock] 议题排序更新成功: 会议: ${meetingId}, 顺序: ${agendaIds.join(', ')}`)
}

// 获取文件信息（用于恢复上传状态）
export const mockGetFileInfo = async (_fileId: string): Promise<MockUploadedFile | null> => {
  await simulateDelay(200)
  
  // 这里实际应用中会从服务器获取文件信息
  // Mock 返回 null 表示文件不存在
  return null
}

// Mock 文件大小限制检查
export const validateFileSize = (file: File, maxSize: number = 50 * 1024 * 1024): boolean => {
  return file.size <= maxSize
}

// Mock 文件名安全检查
export const validateFileName = (fileName: string): boolean => {
  // 检查文件名是否包含危险字符
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  return !dangerousChars.test(fileName) && fileName.length <= 255
}
