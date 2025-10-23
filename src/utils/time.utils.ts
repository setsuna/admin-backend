/**
 * 时间处理工具函数
 */

/**
 * 将时间向后取整到最近的30分钟
 * @param dateTimeStr - 格式：YYYY-MM-DDTHH:mm
 * @returns 取整后的时间字符串，格式：YYYY-MM-DDTHH:mm
 * 
 * @example
 * roundUpToNext30Minutes('2025-10-23T14:23') // '2025-10-23T14:30'
 * roundUpToNext30Minutes('2025-10-23T14:45') // '2025-10-23T15:00'
 * roundUpToNext30Minutes('2025-10-23T14:00') // '2025-10-23T14:00' (已经对齐，不变)
 * roundUpToNext30Minutes('2025-10-23T14:30') // '2025-10-23T14:30' (已经对齐，不变)
 */
export function roundUpToNext30Minutes(dateTimeStr: string): string {
  if (!dateTimeStr) return dateTimeStr
  
  const date = new Date(dateTimeStr)
  
  // 如果日期无效，返回原值
  if (isNaN(date.getTime())) return dateTimeStr
  
  const minutes = date.getMinutes()
  
  // 如果已经是 0 或 30 分钟，不需要调整
  if (minutes === 0 || minutes === 30) {
    return formatToDateTimeLocal(date)
  }
  
  // 计算需要添加的分钟数
  let minutesToAdd = 0
  if (minutes < 30) {
    minutesToAdd = 30 - minutes
  } else {
    minutesToAdd = 60 - minutes
  }
  
  // 添加分钟
  date.setMinutes(minutes + minutesToAdd)
  
  return formatToDateTimeLocal(date)
}

/**
 * 添加指定分钟数到时间
 * @param dateTimeStr - 格式：YYYY-MM-DDTHH:mm
 * @param minutesToAdd - 要添加的分钟数
 * @returns 新的时间字符串，格式：YYYY-MM-DDTHH:mm
 * 
 * @example
 * addMinutes('2025-10-23T14:30', 30) // '2025-10-23T15:00'
 * addMinutes('2025-10-23T23:45', 30) // '2025-10-24T00:15'
 */
export function addMinutes(dateTimeStr: string, minutesToAdd: number): string {
  if (!dateTimeStr) return dateTimeStr
  
  const date = new Date(dateTimeStr)
  
  // 如果日期无效，返回原值
  if (isNaN(date.getTime())) return dateTimeStr
  
  date.setMinutes(date.getMinutes() + minutesToAdd)
  
  return formatToDateTimeLocal(date)
}

/**
 * 格式化 Date 对象为 YYYY-MM-DDTHH:mm 格式
 * @param date - Date 对象
 * @returns 格式化后的字符串
 */
function formatToDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * 将前端的日期时间格式转换为后端需要的 ISO 8601 格式（带时区）
 * @param dateTimeStr - 格式：YYYY-MM-DDTHH:mm
 * @returns ISO 8601 格式，例如：2025-10-23T14:30:00+08:00
 * 
 * @example
 * formatToBackendDateTime('2025-10-23T14:30') // '2025-10-23T14:30:00+08:00'
 */
export function formatToBackendDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return ''
  
  // 如果已经包含时区信息，直接返回
  if (dateTimeStr.includes('+') || dateTimeStr.includes('Z')) {
    return dateTimeStr
  }
  
  // 添加秒和时区（中国时区 +08:00）
  return `${dateTimeStr}:00+08:00`
}

/**
 * 将后端的 ISO 8601 格式转换为前端的日期时间格式
 * @param isoDateTimeStr - ISO 8601 格式，例如：2025-10-23T14:30:00+08:00
 * @returns 格式：YYYY-MM-DDTHH:mm
 * 
 * @example
 * formatFromBackendDateTime('2025-10-23T14:30:00+08:00') // '2025-10-23T14:30'
 */
export function formatFromBackendDateTime(isoDateTimeStr: string): string {
  if (!isoDateTimeStr) return ''
  
  // 移除秒和时区信息
  // 支持格式：2025-10-23T14:30:00+08:00 或 2025-10-23T14:30:00Z
  return isoDateTimeStr.substring(0, 16)
}

/**
 * 自动处理会议时间：开始时间取整，结束时间自动设置
 * @param startTime - 开始时间，格式：YYYY-MM-DDTHH:mm
 * @returns { startTime, endTime } 处理后的开始和结束时间
 */
export function autoAdjustMeetingTimes(startTime: string): {
  startTime: string
  endTime: string
} {
  // 1. 开始时间向后取整到30分钟
  const roundedStartTime = roundUpToNext30Minutes(startTime)
  
  // 2. 结束时间 = 开始时间 + 30分钟
  const endTime = addMinutes(roundedStartTime, 30)
  
  return {
    startTime: roundedStartTime,
    endTime
  }
}
