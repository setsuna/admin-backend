import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Allotment } from "allotment"
import { Plus } from 'lucide-react'
import { getFormattedExtensions } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { DialogComponents } from '@/components/ui/DialogComponents'

// 导入组件
import BasicInfoForm from '@/components/business/meeting/BasicInfoForm'
import AgendaForm from '@/components/business/meeting/AgendaForm'
import OrganizationSelector from '@/components/business/meeting/OrganizationSelector'

// 导入业务 Hook
import { useCreateMeetingForm } from '@/hooks/useCreateMeetingForm'

/**
 * 创建会议页面
 * 重构后：页面组件只负责渲染和组合，业务逻辑全部由 Hook 管理
 */
const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const dialog = useDialog()
  const { confirm } = dialog
  
  const [showOrgModal, setShowOrgModal] = useState(false)
  
  // 🎯 使用整合的表单管理 Hook
  const {
    // 状态
    formData,
    isInitialized,
    loading,
    
    // 议题相关
    agendas,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    updateAgendaPresenter,
    reorderAgendas,
    
    // 表单操作
    handleFormDataChange,
    handleParticipantsChange,
    removeParticipant,
    
    // 文件操作
    handleFileUpload,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials,
    
    // 提交操作
    handleSaveDraft,
    handleSubmit
  } = useCreateMeetingForm()

  // 提交处理（保存草稿或创建会议）
  const onSubmit = async (isDraft: boolean = false) => {
    if (isDraft) {
      await handleSaveDraft()
      return
    }

    const success = await handleSubmit()
    if (success) {
      navigate('/meetings')
    }
  }

  // 取消处理
  const onCancel = async () => {
    const confirmed = await confirm({
      title: '确定要取消吗？',
      message: '当前的编辑内容将保存为草稿。',
      type: 'warning',
      confirmText: '确定取消',
      cancelText: '继续编辑'
    })
    
    if (confirmed) {
      navigate('/meetings')
    }
  }

  // 显示加载状态
  if (!isInitialized) {
    return (
      <div className="p-2 flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-lg text-gray-500 mb-2">正在初始化...</div>
          <div className="text-sm text-gray-400">创建会议草稿中，请稍候</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <Allotment 
        defaultSizes={[45, 55]} 
        className="h-[calc(100vh-200px)]"
        separator={true}
      >
        {/* 左侧：基本信息 */}
        <Allotment.Pane minSize={350} maxSize={600} className="bg-white rounded-lg border flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex-shrink-0 h-[72px]">
            <div className="flex items-center justify-between h-full">
              <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <BasicInfoForm
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onOpenOrgSelector={() => setShowOrgModal(true)}
              onRemoveParticipant={removeParticipant}
            />
          </div>
        </Allotment.Pane>

        {/* 右侧：会议议题 */}
        <Allotment.Pane minSize={400} className="bg-white rounded-lg border flex flex-col">
          <div className="p-4 border-b bg-gray-50 flex-shrink-0 h-[72px]">
            <div className="flex items-center justify-between h-full">
              <h2 className="text-lg font-semibold text-gray-900">会议议题</h2>
              <Button variant="outline" size="sm" onClick={addAgenda}>
                <Plus className="h-4 w-4 mr-2" />
                添加议题
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                议题材料支持格式：{getFormattedExtensions()}
              </p>
            </div>
            
            <AgendaForm
              agendas={agendas}
              onRemoveAgenda={removeAgenda}
              onUpdateAgendaName={updateAgendaName}
              onUpdateAgendaPresenter={updateAgendaPresenter}
              onFileUpload={handleFileUpload}
              onRemoveMaterial={removeMaterial}
              onUpdateMaterialSecurity={updateMaterialSecurity}
              onReorderMaterials={reorderMaterials}
              onReorderAgendas={reorderAgendas}
            />
          </div>
        </Allotment.Pane>
      </Allotment>

      {/* 操作按钮 */}
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => onSubmit(true)}
            loading={loading}
          >
            保存草稿
          </Button>
          <Button 
            onClick={() => onSubmit(false)}
            loading={loading}
          >
            创建会议
          </Button>
        </div>
      </div>

      {/* 组织架构选择弹窗 */}
      <OrganizationSelector
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        selectedParticipants={formData.participants}
        onParticipantsChange={handleParticipantsChange}
      />
      
      {/* 对话框组件 */}
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default CreateMeetingPage
