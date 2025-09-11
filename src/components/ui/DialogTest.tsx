import React from 'react'
import { useDialog } from '@/hooks'
import { DialogComponents } from '@/components/ui'

// 简单的测试组件，可以用来验证对话框是否正常工作
export const DialogTest: React.FC = () => {
  const dialog = useDialog()
  const { alert, confirm } = dialog

  const handleTestAlert = async () => {
    await alert({
      type: 'success',
      title: '测试成功',
      message: '对话框组件工作正常！'
    })
  }

  const handleTestConfirm = async () => {
    const confirmed = await confirm({
      title: '确认测试',
      message: '你确定要继续吗？',
      type: 'warning'
    })
    
    console.log('用户选择:', confirmed ? '确认' : '取消')
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">对话框测试</h2>
      <button
        onClick={handleTestAlert}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        测试 Alert
      </button>
      <button
        onClick={handleTestConfirm}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
      >
        测试 Confirm
      </button>
      
      <DialogComponents dialog={dialog} />
    </div>
  )
}
