import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Allotment } from "allotment"
import { Plus } from 'lucide-react'
import { getFormattedExtensions } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { DialogComponents } from '@/components/ui/DialogComponents'
import { useMeetingForm } from '@/hooks/useMeetingForm'
import { useNotifications } from '@/hooks/useNotifications'
import { usePolicy } from '@/hooks/usePolicy'

import BasicInfoForm from '@/components/business/meeting/BasicInfoForm'
import AgendaForm from '@/components/business/meeting/AgendaForm'
import AddParticipantModal from '@/components/business/meeting/AddParticipantModal'

interface MeetingFormPageProps {
  mode: 'create' | 'edit' | 'view'
}

const MeetingFormPage: React.FC<MeetingFormPageProps> = ({ mode }) => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dialog = useDialog()
  const { confirm } = dialog
  const { showError } = useNotifications()
  const { policy } = usePolicy()
  
  const [showOrgModal, setShowOrgModal] = useState(false)
  
  const {
    formData,
    isInitialized,
    isLoading,
    isError,
    submitPending,
    currentMeetingId,
    
    agendas,
    addAgenda,
    removeAgenda,
    updateAgendaName,
    updateAgendaPresenter,
    reorderAgendas,
    
    handleFormDataChange,
    handleParticipantsChange,
    removeParticipant,
    
    handleFileUpload,
    removeMaterial,
    updateMaterialSecurity,
    reorderMaterials,
    
    handleSaveDraft,
    handleSubmit
  } = useMeetingForm(mode, id)
  
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && !id) {
      showError('错误', '缺少会议ID')
      navigate('/meetings')
      return
    }
    if ((mode === 'edit' || mode === 'view') && isError) {
      showError('加载失败', '无法加载会议信息')
      navigate('/meetings')
    }
  }, [mode, id, isError])
  
  const onSubmit = async (isDraft: boolean = false) => {
    if (mode === 'create' && isDraft) {
      await handleSaveDraft()
      return
    }
    
    const success = await handleSubmit()
    if (success) {
      navigate('/meetings')
    }
  }
  
  const onCancel = async () => {
    if (mode === 'view') {
      navigate('/meetings')
      return
    }
    
    const confirmed = await confirm({
      title: '确定要取消吗？',
      message: mode === 'create' ? '当前的编辑内容将保存为草稿。' : '未保存的修改将丢失。',
      type: 'warning',
      confirmText: '确定取消',
      cancelText: '继续编辑'
    })
    
    if (confirmed) {
      navigate('/meetings')
    }
  }
  
  if (isLoading) {
    return (
      <div className="p-2 flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-lg text-text-regular mb-2">正在加载...</div>
          <div className="text-sm text-text-tertiary">
            {mode === 'create' ? '创建会议草稿中，请稍候' : '加载会议信息中，请稍候'}
          </div>
        </div>
      </div>
    )
  }
  
  if (!isInitialized) {
    return (
      <div className="p-2 flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-lg text-text-regular mb-2">正在初始化...</div>
        </div>
      </div>
    )
  }
  
  if ((mode === 'edit' || mode === 'view') && isError) {
    return (
      <div className="p-2 flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="text-center">
          <div className="text-lg text-error mb-2">加载失败</div>
          <div className="text-sm text-text-tertiary">无法加载会议信息</div>
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
        <Allotment.Pane minSize={350}>
          <Card 
            animate="fadeIn" 
            className="h-full flex flex-col border-r-0 rounded-r-none shadow-none"
          >
            <CardHeader className="p-4 border-b bg-bg-container flex-shrink-0 h-[72px] rounded-tl-xl">
              <div className="flex items-center justify-between h-full">
                <h2 className="text-lg font-semibold text-text-primary">基本信息</h2>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <BasicInfoForm
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onOpenOrgSelector={() => setShowOrgModal(true)}
                onRemoveParticipant={removeParticipant}
                meetingId={currentMeetingId}
                mode={mode}
                readOnly={mode === 'view'}
                systemSecurityLevel={policy?.systemSecurityLevel}
              />
            </CardContent>
          </Card>
        </Allotment.Pane>

        <Allotment.Pane minSize={400}>
          <Card 
            animate="fadeIn" 
            className="h-full flex flex-col border-l-0 rounded-l-none shadow-none"
          >
            <CardHeader className="p-4 border-b bg-bg-container flex-shrink-0 h-[72px] rounded-tr-xl">
              <div className="flex items-center justify-between h-full">
                <h2 className="text-lg font-semibold text-text-primary">会议议题</h2>
                {mode !== 'view' && (
                  <Button variant="outline" size="sm" onClick={addAgenda}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加议题
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <Card className="mb-4 p-3 bg-warning/10 border-warning/30">
                <p className="text-sm text-warning">
                  议题材料支持格式：{getFormattedExtensions()}
                </p>
              </Card>
              
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
                readOnly={mode === 'view'}
                systemSecurityLevel={policy?.systemSecurityLevel}
              />
            </CardContent>
          </Card>
        </Allotment.Pane>
      </Allotment>

      <Card animate="slideUp" className="mt-4">
        <CardContent className="p-4">
          <div className="flex justify-end gap-3">
            {mode === 'view' ? (
              <Button onClick={() => navigate('/meetings')}>
                返回
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onCancel}>
                  取消
                </Button>
                {mode === 'create' && (
                  <Button 
                    variant="secondary" 
                    onClick={() => onSubmit(true)}
                    loading={submitPending}
                  >
                    保存草稿
                  </Button>
                )}
                <Button 
                  onClick={() => onSubmit(false)}
                  loading={submitPending}
                  disabled={submitPending}
                >
                  {submitPending ? (mode === 'create' ? '创建中...' : '保存中...') : (mode === 'create' ? '创建会议' : '保存修改')}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {mode !== 'view' && (
        <AddParticipantModal
          isOpen={showOrgModal}
          onClose={() => setShowOrgModal(false)}
          meetingId={currentMeetingId}
          selectedParticipants={formData.participants}
          onParticipantsChange={handleParticipantsChange}
          systemSecurityLevel={policy?.systemSecurityLevel}
        />
      )}
      
      <DialogComponents dialog={dialog} />
    </div>
  )
}

export default MeetingFormPage
