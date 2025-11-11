import type { WSMessage } from '../types'

/**
 * 会议消息处理器
 * 
 * 职责：
 * - 处理会议相关消息（创建、更新、删除）
 * - 同步会议状态
 */
export class MeetingMessageHandler {
  private onMeetingUpdate?: (action: 'create' | 'update' | 'delete', meetingId: string) => void

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks: {
    onMeetingUpdate?: (action: 'create' | 'update' | 'delete', meetingId: string) => void
  }) {
    this.onMeetingUpdate = callbacks.onMeetingUpdate
  }

  /**
   * 处理会议创建消息
   */
  handleMeetingCreate(message: WSMessage<any>): void {
    console.log('[Handler] Meeting created:', message.data)
    this.onMeetingUpdate?.('create', message.data.meetingId || message.data.id)
  }

  /**
   * 处理会议更新消息
   */
  handleMeetingUpdate(message: WSMessage<any>): void {
    console.log('[Handler] Meeting updated:', message.data)
    this.onMeetingUpdate?.('update', message.data.meetingId || message.data.id)
  }

  /**
   * 处理会议删除消息
   */
  handleMeetingDelete(message: WSMessage<any>): void {
    console.log('[Handler] Meeting deleted:', message.data)
    this.onMeetingUpdate?.('delete', message.data.meetingId || message.data.id)
  }
}

// 导出单例
export const meetingHandler = new MeetingMessageHandler()
