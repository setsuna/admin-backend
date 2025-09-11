import React, { useState } from 'react'
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
}

const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showOrgModal, setShowOrgModal] = useState(false)
  
  const [formData, setFormData] = useState<MeetingFormData>({
    name: '',
    securityLevel: 'internal',
    category: '部门例会',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    type: 'standard',
    description: '',
    participants: [],
    agendas: [{ id: '1', name: '', description: '', materials: [], order: 1 }],
    password: '',
    expiryType: 'none',
    expiryDate: ''
  })

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

  // 材料上传处理 - 更新为接收 File[] 而不是 FileList
  const handleFileUpload = (agendaId: string, files: File[]) => {
    if (!files || files.length === 0) return

    const now = new Date().toISOString()
    const newMaterials: MeetingMaterial[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'unknown',
      securityLevel: formData.securityLevel,
      uploadedAt: now
    }))

    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.map(agenda => 
        agenda.id === agendaId 
          ? { ...agenda, materials: [...agenda.materials, ...newMaterials] }
          : agenda
      )
    }))
  }

  const removeMaterial = (agendaId: string, materialId: string) => {
    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.map(agenda => 
        agenda.id === agendaId 
          ? { ...agenda, materials: agenda.materials.filter(m => m.id !== materialId) }
          : agenda
      )
    }))
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

  // 提交会议
  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const meetingRequest: CreateMeetingRequest = {
        name: formData.name,
        securityLevel: formData.securityLevel,
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        description: formData.description,
        participants: formData.participants,
        agendas: formData.agendas
      }

      await meetingApi.createMeetingFromRequest(meetingRequest)
      alert(isDraft ? '会议草稿已保存' : '会议创建成功')
      navigate('/meetings')
    } catch (error) {
      console.error('Submit failed:', error)
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('确定要取消吗？未保存的内容将丢失。')) {
      navigate('/meetings')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto p-6">
        {/* 使用 Allotment 创建可调节的左右布局 */}
        <Allotment 
          defaultSizes={[45, 55]} 
          className="h-[calc(100vh-220px)]"
          separator={true}
        >
          {/* 左侧：基本信息 */}
          <Allotment.Pane minSize={350} maxSize={600}>
            <div className="bg-white rounded-lg border h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
                <p className="text-sm text-gray-600">设置会议的基本配置信息</p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <BasicInfoForm
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                  onOpenOrgSelector={() => setShowOrgModal(true)}
                  onRemoveParticipant={removeParticipant}
                />
              </div>
            </div>
          </Allotment.Pane>

          {/* 右侧：会议议题 */}
          <Allotment.Pane minSize={400}>
            <div className="bg-white rounded-lg border h-full flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">会议议题</h2>
                <p className="text-sm text-gray-600">添加议题和相关材料</p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
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
              <div className="p-6 border-t bg-gray-50">
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
            </div>
          </Allotment.Pane>
        </Allotment>
      </div>

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
