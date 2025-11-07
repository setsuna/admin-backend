import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import type { Meeting, OnlineDevice } from '@/types'

interface SyncConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedMeetings: Meeting[]
  selectedDevices: OnlineDevice[]
  totalSize: number
}

export function SyncConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedMeetings,
  selectedDevices,
  totalSize,
}: SyncConfirmDialogProps) {
  const taskCount = selectedMeetings.length * selectedDevices.length

  const getSecurityLevelText = (level: string) => {
    const texts: Record<string, string> = {
      top_secret: '绝密',
      secret: '机密',
      confidential: '秘密',
      internal: '内部',
      public: '公开'
    }
    return texts[level] || '内部'
  }

  const getSecurityLevelVariant = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    const variantMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      internal: 'success',
      confidential: 'warning',
      secret: 'error',
      top_secret: 'error',
      public: 'default'
    }
    return variantMap[level] || 'default'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>确认同步</DialogTitle>
          <DialogDescription>
            即将创建 {taskCount} 个同步任务，预计需要 {totalSize.toFixed(1)} MB 存储空间
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 会议列表 */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              选中会议 ({selectedMeetings.length})
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
              {selectedMeetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="flex items-center justify-between text-sm py-1"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant={getSecurityLevelVariant((meeting as any).security_level)}>
                      {getSecurityLevelText((meeting as any).security_level)}
                    </Badge>
                    <span className="truncate">{meeting.name}</span>
                  </div>
                  <span className="text-muted-foreground ml-2 whitespace-nowrap">
                    {((meeting as any).package_info?.package_size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 设备列表 */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              目标设备 ({selectedDevices.length})
            </h3>
            <div className="space-y-2 max-h-[150px] overflow-y-auto border rounded-md p-3">
              {selectedDevices.map((device) => (
                <div 
                  key={device.serial_number}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="font-medium">{device.serial_number}</span>
                  <Badge variant={device.status === 1 ? 'success' : 'default'}>
                    {device.status_name}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* 汇总信息 */}
          <div className="bg-muted rounded-md p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">会议数量:</span>
              <span className="font-medium">{selectedMeetings.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">设备数量:</span>
              <span className="font-medium">{selectedDevices.length} 台</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">同步任务:</span>
              <span className="font-medium">{taskCount} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">预计大小:</span>
              <span className="font-medium">{totalSize.toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onConfirm}>
            确认同步
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
