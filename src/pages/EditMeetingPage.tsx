import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Allotment } from "allotment"
import { Plus } from 'lucide-react'
import { getFormattedExtensions } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'
import { meetingApi } from '@/services/meeting'
import type { MeetingFormData } from '@/types'

// 导入组件
import BasicInfoForm from '@/components/business/meeting/BasicInfoForm'
import AgendaForm from '@/components/business/meeting/AgendaForm'
import OrganizationSelector from '@/components/business/meeting/OrganizationSelector'

// 导入业务 Hooks
import { useMeetingAgenda } from '@/hooks/useMeetingAgenda'
import { useMeetingMaterial } from '@/hooks/useMeetingMaterial'

const EditMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const dialog = useDialog()
  const { confirm } = dialog
  const { showWarning, showSuccess, showError } = useNotifications()
  
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // 🎯 使用议题管理 Hook
  const { 
    agendas, 
    setAgendas,
    loadAgendas,
    addAgenda, 
    removeAgenda, 
    updateAgendaName, 
    reorderAgendas 
  } = useMeetingAgenda(id || null)
  
  // 🎯 使用文件管理 Hook
  const { 
    uploadFiles, 
    removeMaterial, 
    updateMaterialSecurity, 
    reorderMaterials 
  } = useMeetingMaterial(id || null, agendas, setAgendas)
  
  // 表单数据状态
  const [formData, setFormData] = useState<MeetingFormData>(() => {
    const now = new Date()
    const startTime = new Date(now.getTime() + 60 * 60 * 1000)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
    
    return {
      name: '',
      securityLevel: 'internal',
      category: '部门例会',
      startTime: startTime.toISOString().slice(0, 16),
      endTime: endTime.toISOString().slice(0, 16),
      type: 'standard',
      description: '',
      participants: [],
      agendas: [],
      password: '',
      expiryType: 'none',
      expiryDate: '',
      signInType: 'none',
      location: '',
      organizer: '',
      host: ''
    }
  })

  // 加载会议数据
  useEffect(() => {
    const loadMeeting = async () => {
      if (!id) {
        showError('错误', '缺少会议ID')
        navigate('/meetings')
        return
      }

      try {
        // 加载会议基本信息
        const meeting = await meetingApi.getMeetingById(id)
        
        // ✅ 转换后端字段到前端格式
        const convertedData: Partial<MeetingFormData> = {
          name: meeting.name,
          description: meeting.description || '',
          securityLevel: meeting.securityLevel || 'internal',  // ✅ 驼峰式
          type: meeting.type || 'standard',
          category: meeting.category || '部门例会',
          location: meeting.location || '',
          // ✅ 时间格式转换
          startTime: meeting.startTime ? meeting.startTime.slice(0, 16) : formData.startTime,
          endTime: meeting.endTime ? meeting.endTime.slice(0, 16) : formData.endTime,
          // TODO: 加载参会人员
          participants: []
        }
        
        setFormData(prev => ({
          ...prev,
          ...convertedData
        }))

        // 加载议题
        await loadAgendas()
        
        setIsInitialized(true)
      } catch (error) {
        console.error('加载会议失败:', error)
        showError('加载失败', '无法加载会议信息')
        navigate('/meetings')
      }
    }
    
    loadMeeting()
  }, [id])

  // 同步 agendas 到 formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, agendas }))
  }, [agendas])

  // 表单数据更新
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 参会人员管理
  const handleParticipantsChange = (participants: any[]) => {
    setFormData(prev => ({ ...prev, participants }))
  }

  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }

  // 文件上传处理
  const handleFileUpload = async (agendaId: string, files: File[]) => {
    await uploadFiles(agendaId, files, formData.securityLevel)
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showWarning('请填写会议名称', '会议名称不能为空')
      return false
    }
    if (formData.type === 'standard' && formData.participants.length === 0) {
      showWarning('请添加参会人员', '标准会议需要添加参会人员')
      return false
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      showWarning('时间设置有误', '结束时间必须晚于开始时间')
      return false
    }
    return true
  }

  // 保存更新
  const handleSave = async () => {
    if (!validateForm() || !id) return

    setLoading(true)
    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        security_level: formData.securityLevel,
        type: formData.type,
        start_time: `${formData.startTime}:00+08:00`,
        end_time: `${formData.endTime}:00+08:00`,
        location: formData.location,
        category: formData.category
      }

      await meetingApi.updateMeeting(id, updateData)
      showSuccess('保存成功', '会议信息已更新')
      navigate('/meetings')
    } catch (error) {
      console.error('保存失败:', error)
      // httpClient 会自动显示错误通知
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: '确定要取消吗？',
      message: '未保存的修改将丢失。',
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
          <div className="text-lg text-gray-500 mb-2">正在加载...</div>
          <div className="text-sm text-gray-400">加载会议信息中，请稍候</div>
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
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button 
              onClick={handleSave}
              loading={loading}
            >
              保存修改
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

export default EditMeetingPage
