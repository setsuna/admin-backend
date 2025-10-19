import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Allotment } from "allotment"
import { Plus } from 'lucide-react'
import { meetingApi } from '@/services/meeting'
import { getFormattedExtensions } from '@/utils'
import { useDialog } from '@/hooks/useModal'
import { useNotifications } from '@/hooks/useNotifications'
import { DialogComponents } from '@/components/ui/DialogComponents'
import type { 
  MeetingSecurityLevel, 
  MeetingType, 
  MeetingParticipant, 
  MeetingAgenda, 
  MeetingMaterial 
} from '@/types'

// 导入组件
import BasicInfoForm from '@/components/business/meeting/BasicInfoForm'
import AgendaForm from '@/components/business/meeting/AgendaForm'
import OrganizationSelector from '@/components/business/meeting/OrganizationSelector'

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
  organizer: string  // 新增：组织单位
  host: string       // 新增：会议主持
}

const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const dialog = useDialog()
  const { alert, confirm } = dialog
  const { addNotification } = useNotifications()
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
      agendas: [{ 
        id: '1', 
        meetingId: '',
        title: '议题一',  // ✅ 默认标题
        description: '', 
        materials: [], 
        order: 1,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      password: '',
      expiryType: 'none',
      expiryDate: '',
      signInType: 'none',
      location: '',
      organizer: '',  // 新增字段
      host: ''        // 新增字段
    }
  })

  // 初始化草稿会议
  useEffect(() => {
    initializeDraftMeeting()
  }, [])

  const initializeDraftMeeting = async () => {
    try {
      console.log('初始化草稿会议...')
      // 后端幂等接口：有草稿返回现有，无则创建新的
      const draftMeeting = await meetingApi.createDraftMeeting()
      setDraftMeetingId(draftMeeting.id)
      
      // 如果有草稿数据，恢复到表单
      if (draftMeeting.data) {
        // 处理草稿数据，确保必要字段存在
        const draftData = draftMeeting.data as any
        setFormData(prev => ({
          ...prev,
          ...draftData,
          // 确保 agendas 有完整的字段
          agendas: draftData.agendas?.map((a: any) => ({
            ...a,
            meetingId: draftMeeting.id,
            status: a.status || 'pending',
            createdAt: a.createdAt || new Date().toISOString(),
            updatedAt: a.updatedAt || new Date().toISOString()
          })) || prev.agendas
        }))
        console.log('已恢复草稿数据:', draftMeeting.id)
      } else {
        // 新创建的草稿，先查询是否已有议题
        console.log('草稿会议创建成功，查询现有议题:', draftMeeting.id)
        const existingAgendas = await meetingApi.getAgendas(draftMeeting.id)
        
        if (existingAgendas && existingAgendas.length > 0) {
          // 已有议题，加载它们
          console.log(`发现 ${existingAgendas.length} 个现有议题`)
          setFormData(prev => ({
            ...prev,
            agendas: existingAgendas.map((a: any) => ({
              id: a.id,
              meetingId: draftMeeting.id,
              title: a.title || '',
              description: a.description || '',
              duration: a.duration,
              presenter: a.presenter,
              materials: [],
              order: a.order_num || a.order,
              status: 'pending',
              createdAt: a.created_at || a.createdAt || new Date().toISOString(),
              updatedAt: a.updated_at || a.updatedAt || new Date().toISOString()
            }))
          }))
        } else {
          // 没有议题，创建默认议题
          console.log('没有现有议题，创建默认议题')
          await createDefaultAgenda(draftMeeting.id)
        }
      }
    } catch (error) {
      console.error('初始化草稿失败:', error)
      await alert({
        type: 'error',
        title: '初始化失败',
        message: '请刷新页面重试'
      })
    } finally {
      setIsInitialized(true)
    }
  }

  // 为新创建的草稿会议创建默认议题
  const createDefaultAgenda = async (meetingId: string) => {
    try {
      // 直接调用创建议题接口
      const agendaData = {
        title: '议题一',  // ✅ 设置默认标题
        description: '',
        duration: 30,     // ✅ 默认30分钟
        order_num: 1      // 第一个议题
      }
      
      const createdAgenda = await meetingApi.createAgenda(meetingId, agendaData)
      console.log('默认议题创建成功:', createdAgenda.id)
      
      // 更新前端 state 中的议题 ID（后端返回的是下划线字段，需要转换）
      setFormData(prev => ({
        ...prev,
        agendas: [{
          id: createdAgenda.id,
          meetingId: meetingId,
          title: createdAgenda.title || '',
          description: createdAgenda.description || '',
          duration: createdAgenda.duration,
          presenter: createdAgenda.presenter,
          materials: [],
          order: (createdAgenda as any).order_num || createdAgenda.order || 1,  // ✅ 兼容下划线和驼峰
          status: 'pending',
          createdAt: (createdAgenda as any).created_at || createdAgenda.createdAt || new Date().toISOString(),
          updatedAt: (createdAgenda as any).updated_at || createdAgenda.updatedAt || new Date().toISOString()
        }]
      }))
    } catch (error) {
      console.error('创建默认议题失败:', error)
      // 不阻断流程，用户可以继续编辑
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
  const addAgenda = async () => {
    if (!draftMeetingId) {
      addNotification({
        type: 'error',
        title: '添加失败',
        message: '草稿会议未初始化'
      })
      return
    }

    try {
      // 调用后端接口创建议题
      const agendaData = {
        title: `议题${formData.agendas.length + 1}`,  // ✅ 默认标题：议题二、议题三...
        description: '',
        duration: 30,     // ✅ 默认30分钟
        order_num: formData.agendas.length + 1
      }
      
      const createdAgenda = await meetingApi.createAgenda(draftMeetingId, agendaData)
      
      // 转换为前端格式并添加到 state（后端返回的是下划线字段）
      const newAgenda: MeetingAgenda = {
        id: createdAgenda.id,
        meetingId: draftMeetingId,
        title: createdAgenda.title || '',
        description: createdAgenda.description || '',
        duration: createdAgenda.duration,
        presenter: createdAgenda.presenter,
        materials: [],
        order: (createdAgenda as any).order_num || createdAgenda.order || formData.agendas.length + 1,  // ✅ 兼容下划线和驼峰
        status: 'pending',
        createdAt: (createdAgenda as any).created_at || createdAgenda.createdAt || new Date().toISOString(),
        updatedAt: (createdAgenda as any).updated_at || createdAgenda.updatedAt || new Date().toISOString()
      }
      
      setFormData(prev => ({
        ...prev,
        agendas: [...prev.agendas, newAgenda]
      }))
      
      console.log('议题添加成功:', createdAgenda.id)
    } catch (error) {
      console.error('添加议题失败:', error)
      addNotification({
        type: 'error',
        title: '添加失败',
        message: '添加议题失败，请重试'
      })
    }
  }

  const removeAgenda = async (agendaId: string) => {
    if (!draftMeetingId) return

    try {
      // 调用后端接口删除议题
      await meetingApi.deleteAgenda(draftMeetingId, agendaId)
      
      // 更新前端 state
      setFormData(prev => ({
        ...prev,
        agendas: prev.agendas.filter(a => a.id !== agendaId)
      }))
      
      console.log('议题删除成功:', agendaId)
    } catch (error) {
      console.error('删除议题失败:', error)
      addNotification({
        type: 'error',
        title: '删除失败',
        message: '删除议题失败，请重试'
      })
    }
  }

  const updateAgendaName = async (agendaId: string, title: string) => {
    if (!draftMeetingId) return

    // 先更新前端 state（立即响应）
    setFormData(prev => ({
      ...prev,
      agendas: prev.agendas.map(agenda => 
        agenda.id === agendaId ? { ...agenda, title } : agenda
      )
    }))

    try {
      // 后台同步到后端
      await meetingApi.updateAgenda(draftMeetingId, agendaId, { title })
      console.log('议题名称已更新:', agendaId)
    } catch (error) {
      console.error('更新议题名称失败:', error)
      // 静默失败，不影响用户体验
    }
  }

  // 文件上传处理 - 更新为接收 File[] 而不是 FileList
  const handleFileUpload = async (agendaId: string, files: File[]) => {
    if (!files || files.length === 0 || !draftMeetingId) return

    try {
      const uploadPromises = files.map(async (file) => {
        console.log(`上传文件: ${file.name} 到会议: ${draftMeetingId}`)
        
        // 使用真实的 API 上传文件
        const uploadedFile = await meetingApi.uploadMeetingFile(draftMeetingId, file, agendaId)
        
        // 转换为 MeetingMaterial 格式
        const material: MeetingMaterial = {
          id: uploadedFile.id,
          meetingId: draftMeetingId,
          agendaId,
          name: (uploadedFile as any).original_name || file.name,  // ✅ 使用下划线字段
          originalName: (uploadedFile as any).original_name || file.name,
          size: (uploadedFile as any).file_size || file.size,  // ✅ 使用下划线字段
          type: (uploadedFile as any).mime_type || file.type,  // ✅ 使用下划线字段
          url: uploadedFile.url || '',
          securityLevel: formData.securityLevel,
          uploadedBy: (uploadedFile as any).uploaded_by || '',  // ✅ 使用下划线字段
          uploadedByName: '',
          downloadCount: 0,
          version: 1,
          isPublic: false,
          createdAt: (uploadedFile as any).created_at || new Date().toISOString(),  // ✅ 使用下划线字段
          updatedAt: (uploadedFile as any).updated_at || new Date().toISOString()   // ✅ 使用下划线字段
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
      addNotification({
        type: 'success',
        title: '上传成功',
        message: `成功上传 ${newMaterials.length} 个文件`
      })
    } catch (error) {
      console.error('文件上传失败:', error)
      addNotification({
        type: 'error',
        title: '上传失败',
        message: '文件上传失败，请重试'
      })
    }
  }

  const removeMaterial = async (agendaId: string, materialId: string) => {
    if (!draftMeetingId) return
    
    try {
      // 使用真实的 API 删除文件
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
      addNotification({
        type: 'success',
        title: '删除成功',
        message: '文件已删除'
      })
    } catch (error) {
      console.error('删除文件失败:', error)
      addNotification({
        type: 'error',
        title: '删除失败',
        message: '删除文件失败，请重试'
      })
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

  const reorderMaterials = async (agendaId: string, newMaterials: MeetingMaterial[]) => {
    if (!draftMeetingId) return
    
    try {
      // 先更新本地状态
      setFormData(prev => ({
        ...prev,
        agendas: prev.agendas.map(agenda => 
          agenda.id === agendaId 
            ? { ...agenda, materials: newMaterials }
            : agenda
        )
      }))
      
      // TODO: 调用后端 API 更新材料排序
      // const materialIds = newMaterials.map(m => m.id)
      // await meetingApi.updateMaterialOrder(draftMeetingId, agendaId, materialIds)
      
      console.log('材料排序更新成功')
    } catch (error) {
      console.error('材料排序更新失败:', error)
      addNotification({
        type: 'error',
        title: '排序失败',
        message: '材料排序更新失败'
      })
    }
  }

  const reorderAgendas = async (newAgendas: MeetingAgenda[]) => {
    if (!draftMeetingId) return
    
    try {
      // 先更新本地状态
      setFormData(prev => ({
        ...prev,
        agendas: newAgendas
      }))
      
      // TODO: 调用后端 API 更新议题排序
      // const agendaIds = newAgendas.map(a => a.id)
      // await meetingApi.updateAgendaOrder(draftMeetingId, agendaIds)
      
      console.log('议题排序更新成功')
    } catch (error) {
      console.error('议题排序更新失败:', error)
      addNotification({
        type: 'error',
        title: '排序失败',
        message: '议题排序更新失败'
      })
    }
  }

  // 表单验证
  const validateForm = async (): Promise<boolean> => {
    if (!formData.name.trim()) {
      await alert({
        type: 'warning',
        title: '请填写会议名称',
        message: '会议名称不能为空'
      })
      return false
    }
    if (formData.type === 'standard' && formData.participants.length === 0) {
      await alert({
        type: 'warning',
        title: '请添加参会人员',
        message: '标准会议需要添加参会人员'
      })
      return false
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      await alert({
        type: 'warning',
        title: '时间设置有误',
        message: '结束时间必须晚于开始时间'
      })
      return false
    }
    return true
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!draftMeetingId) {
      await alert({
        type: 'error',
        title: '保存失败',
        message: '草稿会议未初始化'
      })
      return
    }

    try {
      setLoading(true)
      
      const draftData: any = {
        name: formData.name,
        description: formData.description,
        security_level: formData.securityLevel,  // ✅ 下划线
        type: formData.type,
        start_time: formData.startTime,           // ✅ 下划线
        end_time: formData.endTime,               // ✅ 下划线
        location: formData.location,
        participants: formData.participants
          .filter(p => p.role !== 'host')
          .map(p => ({
            userId: p.userId,
            role: p.role as 'participant' | 'observer'
          }))
        // ✅ 议题通过独立接口管理，不在这里发送
      }

      await meetingApi.saveDraftMeeting(draftMeetingId, draftData)
      addNotification({
        type: 'success',
        title: '保存成功',
        message: '草稿已保存'
      })
      console.log('草稿保存成功')
    } catch (error) {
      console.error('保存草稿失败:', error)
      addNotification({
        type: 'error',
        title: '保存失败',
        message: '保存失败，请重试'
      })
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

    if (!(await validateForm()) || !draftMeetingId) return

    try {
      setLoading(true)
      
      const meetingRequest: any = {
        name: formData.name,
        security_level: formData.securityLevel,   // ✅ 下划线
        type: formData.type,
        status: 'preparation',                     // ✅ 必须添加！
        start_time: new Date(formData.startTime).toISOString(),  // ✅ 下划线
        end_time: new Date(formData.endTime).toISOString(),      // ✅ 下划线
        location: formData.location,
        description: formData.description,
        participants: formData.participants
          .filter(p => p.role !== 'host')
          .map(p => ({
            userId: p.userId,
            role: p.role as 'participant' | 'observer'
          }))
        // ✅ 议题已通过独立接口创建，不需要在这里发送
      }

      const meeting = await meetingApi.submitDraftMeeting(draftMeetingId, meetingRequest)
      addNotification({
        type: 'success',
        title: '创建成功',
        message: '会议创建成功'
      })
      console.log('会议创建成功:', meeting)
      navigate('/meetings')
    } catch (error) {
      console.error('提交失败:', error)
      addNotification({
        type: 'error',
        title: '提交失败',
        message: '提交失败，请重试'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: '确定要取消吗？',
      message: '当前的编辑内容将保存为草稿。',
      type: 'warning',
      confirmText: '确定取消',
      cancelText: '继续编辑'
    })
    
    if (confirmed) {
      // 草稿保留，下次进来自动恢复
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
          className="h-[calc(100vh-200px)]"
          separator={true}
        >
          {/* 左侧：基本信息 */}
          <Allotment.Pane minSize={350} maxSize={600} className="bg-white rounded-lg border flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex-shrink-0 h-[72px]">
              <div className="flex items-center justify-between h-full">
                <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
                <div></div>
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
              {/* 支持格式提示 */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  议题材料支持格式：{getFormattedExtensions()}
                </p>
              </div>
              
              <AgendaForm
                agendas={formData.agendas}
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

        {/* 操作按钮 - 固定在底部 */}
        <div className="mt-4 p-4 bg-white rounded-lg border">
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
