import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components'
import { Allotment } from "allotment"
import { meetingApi } from '@/services/meeting'
import type { 
  MeetingSecurityLevel, 
  MeetingType, 
  CreateMeetingRequest, 
  MeetingParticipant, 
  MeetingAgenda, 
  MeetingMaterial 
} from '@/types'

// 导入组件
import BasicInfoForm from '@/components/meeting/BasicInfoForm'
import AgendaForm from '@/components/meeting/AgendaForm'
import OrganizationSelector from '@/components/meeting/OrganizationSelector'

// 表单数据类型
interface MeetingFormData {
  name: string
  securityLevel: MeetingSecurityLevel
  category: string
  startTime: string
  endTime: string
  type: MeetingType
  description: string
  participants: MeetingParticipant[]
  agendas: MeetingAgenda[]
  password: string
  expiryType: 'none' | 'today' | 'custom'
  expiryDate: string
  signInType: 'none' | 'manual' | 'password'
  location: string
}

const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [draftMeetingId, setDraftMeetingId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const [formData, setFormData] = useState<MeetingFormData>(() => {
    const now = new Date()
    // 开始时间设为当前时间后1小时
    const startTime = new Date(now.getTime() + 60 * 60 * 1000)
    // 结束时间设为开始时间后1小时
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
      agendas: [{ id: '1', name: '', description: '', materials: [], order: 1 }],
      password: '',
      expiryType: 'none',
      expiryDate: '',
      signInType: 'none',
      location: ''
    }
  })

  // 初始化草稿会议
  useEffect(() => {
    initializeDraftMeeting()
  }, [])

  const initializeDraftMeeting = async () => {
    try {
      console.log('创建草稿会议...')
      const draftMeeting = await meetingApi.createDraftMeeting()
      setDraftMeetingId(draftMeeting.id)
      console.log('草稿会议创建成功:', draftMeeting.id)
    } catch (error) {
      console.error('创建草稿会议失败:', error)
      alert('初始化失败，请刷新页面重试')
    } finally {
      setIsInitialized(true)
    }
  }

  // 表单数据更新
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 参会人员管理
  const handleParticipantsChange = (participants: MeetingParticipant[]) => {
    setFormData(prev => ({ ...prev, participants }))
  }

  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }

  // 议题管理
  const addAgenda = () => {
    const newAgenda: MeetingAgenda = {
      id: Date.now().toString(),
      name: '',
      description: '',
      materials: [],
      order: formData.agendas.length + 1
    }
    setFormData(prev => ({
      ...prev,
      agendas: [...prev.agendas, newAgenda]
    }))
  }

  const removeAgenda = (agendaId: string) => {
    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.filter(a => a.id !== agendaId)
    }))
  }

  const updateAgendaName = (agendaId: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.map(agenda => 
        agenda.id === agendaId ? { ...agenda, name } : agenda
      )
    }))
  }

  // 文件上传处理 - 更新为接收 File[] 而不是 FileList
  const handleFileUpload = async (agendaId: string, files: File[]) => {
    if (!files || files.length === 0 || !draftMeetingId) return

    try {
      const uploadPromises = files.map(async (file) => {
        console.log(`上传文件: ${file.name} 到会议: ${draftMeetingId}`)
        const uploadedFile = await meetingApi.uploadMeetingFile(draftMeetingId, file, agendaId)
        
        // 转换为 MeetingMaterial 格式
        const material: MeetingMaterial = {
          id: uploadedFile.id,
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          securityLevel: formData.securityLevel,
          uploadedAt: uploadedFile.uploadedAt
        }
        
        return material
      })

      const newMaterials = await Promise.all(uploadPromises)
      
      // 更新议题材料
      setFormData(prev => ({
        ...prev,
        agendas: prev.agendas.map(agenda => 
          agenda.id === agendaId 
            ? { ...agenda, materials: [...agenda.materials, ...newMaterials] }
            : agenda
        )
      }))
      
      console.log(`成功上传 ${newMaterials.length} 个文件`)
    } catch (error) {
      console.error('文件上传失败:', error)
      alert('文件上传失败，请重试')
    }
  }

  const removeMaterial = async (agendaId: string, materialId: string) => {
    if (!draftMeetingId) return
    
    try {
      // 删除服务器上的文件
      await meetingApi.deleteMeetingFile(draftMeetingId, materialId)
      
      // 更新本地状态
      setFormData(prev => ({
        ...prev,
        agendas: prev.agendas.map(agenda => 
          agenda.id === agendaId 
            ? { ...agenda, materials: agenda.materials.filter(m => m.id !== materialId) }
            : agenda
        )
      }))
      
      console.log(`删除文件: ${materialId}`)
    } catch (error) {
      console.error('删除文件失败:', error)
      alert('删除文件失败，请重试')
    }
  }

  const updateMaterialSecurity = (agendaId: string, materialId: string, securityLevel: MeetingSecurityLevel) => {
    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.map(agenda => 
        agenda.id === agendaId 
          ? {
              ...agenda,
              materials: agenda.materials.map(material =>
                material.id === materialId ? { ...material, securityLevel } : material
              )
            }
          : agenda
      )
    }))
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert('请输入会议名称')
      return false
    }
    if (formData.type === 'standard' && formData.participants.length === 0) {
      alert('标准会议需要添加参会人员')
      return false
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('结束时间必须晚于开始时间')
      return false
    }
    return true
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!draftMeetingId) {
      alert('草稿会议未初始化')
      return
    }

    try {
      setLoading(true)
      
      const draftData: Partial<CreateMeetingRequest> = {
        name: formData.name,
        description: formData.description,
        // 可以根据需要添加更多字段
      }

      await meetingApi.saveDraftMeeting(draftMeetingId, draftData)
      alert('草稿已保存')
      console.log('草稿保存成功')
    } catch (error) {
      console.error('保存草稿失败:', error)
      alert('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 提交会议
  const handleSubmit = async (isDraft: boolean = false) => {
    if (isDraft) {
      await handleSaveDraft()
      return
    }

    if (!validateForm() || !draftMeetingId) return

    try {
      setLoading(true)
      
      const meetingRequest: CreateMeetingRequest = {
        name: formData.name,
        securityLevel: formData.securityLevel,
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        location: formData.location,
        description: formData.description,
        participants: formData.participants,
        agendas: formData.agendas
      }

      const meeting = await meetingApi.submitDraftMeeting(draftMeetingId, meetingRequest)
      alert('会议创建成功')
      console.log('会议创建成功:', meeting)
      navigate('/meetings')
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('确定要取消吗？未保存的内容将丢失。')) {
      // 清理草稿数据（可选）
      if (draftMeetingId) {
        // 这里可以调用删除草稿的API
        console.log('取消创建，草稿会议ID:', draftMeetingId)
      }
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
        {/* 使用 Allotment 创建可调节的左右布局 */}
        <Allotment 
          defaultSizes={[45, 55]} 
          className="h-[calc(100vh-120px)]"
          separator={true}
        >
          {/* 左侧：基本信息 */}
          <Allotment.Pane minSize={350} maxSize={600} className="bg-white rounded-lg border flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
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
            <div className="p-4 border-b bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">会议议题</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <AgendaForm
                agendas={formData.agendas}
                onAddAgenda={addAgenda}
                onRemoveAgenda={removeAgenda}
                onUpdateAgendaName={updateAgendaName}
                onFileUpload={handleFileUpload}
                onRemoveMaterial={removeMaterial}
                onUpdateMaterialSecurity={updateMaterialSecurity}
              />
            </div>
            
            {/* 操作按钮 - 固定在底部 */}
            <div className="p-4 border-t bg-gray-50 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleSubmit(true)}
                  loading={loading}
                >
                  保存草稿
                </Button>
                <Button 
                  onClick={() => handleSubmit(false)}
                  loading={loading}
                >
                  创建会议
                </Button>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>

      {/* 组织架构选择弹窗 */}
      <OrganizationSelector
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        selectedParticipants={formData.participants}
        onParticipantsChange={handleParticipantsChange}
      />
    </div>
  )
}

export default CreateMeetingPage
