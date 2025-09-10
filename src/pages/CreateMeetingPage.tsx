import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Upload, Calendar, Clock, Users, FileText } from 'lucide-react'
import { 
  Button, 
  Input, 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components'
import { meetingApi } from '@/services/meeting'
import type { MeetingSecurityLevel, MeetingType, CreateMeetingRequest, MeetingParticipant, MeetingAgenda, MeetingMaterial } from '@/types'

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

const securityLevelConfig = {
  internal: { label: '内部', color: 'bg-green-500 hover:bg-green-600' },
  confidential: { label: '秘密', color: 'bg-yellow-500 hover:bg-yellow-600' },
  secret: { label: '机密', color: 'bg-red-500 hover:bg-red-600' }
}

const typeConfig = {
  standard: { label: '标准会议', icon: Users },
  tablet: { label: '平板会议', icon: FileText }
}

const CreateMeetingPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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

  const [participantInput, setParticipantInput] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExpiryModal, setShowExpiryModal] = useState(false)

  const handleInputChange = (field: keyof MeetingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSecurityLevelChange = (level: MeetingSecurityLevel) => {
    setFormData(prev => ({ ...prev, securityLevel: level }))
  }

  const handleTypeChange = (type: MeetingType) => {
    setFormData(prev => ({ ...prev, type }))
  }

  // 参会人员管理
  const addParticipant = () => {
    if (participantInput.trim()) {
      const newParticipant: MeetingParticipant = {
        id: Date.now().toString(),
        name: participantInput.trim()
      }
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant]
      }))
      setParticipantInput('')
    }
  }

  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))
  }

  const handleParticipantKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addParticipant()
    }
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

  // 材料上传模拟
  const handleFileUpload = (agendaId: string, files: FileList | null) => {
    if (!files) return

    const now = new Date().toISOString()
    const newMaterials: MeetingMaterial[] = Array.from(files).map(file => ({
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 面包屑 */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <button 
            className="hover:text-gray-700"
            onClick={() => navigate('/')}
          >
            首页
          </button>
          <span className="mx-2">/</span>
          <button 
            className="hover:text-gray-700"
            onClick={() => navigate('/meetings')}
          >
            会议管理
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">新建会议</span>
        </div>
      </div>

      {/* 页面标题 */}
      <div className="bg-white px-6 py-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">新建会议</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：基本信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 会议名称 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    会议名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="请输入会议名称"
                  />
                </div>

                {/* 会议密级 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    会议密级 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {(Object.entries(securityLevelConfig) as [MeetingSecurityLevel, typeof securityLevelConfig.internal][]).map(([level, config]) => (
                      <button
                        key={level}
                        onClick={() => handleSecurityLevelChange(level)}
                        className={`px-4 py-2 rounded-md text-white transition-colors ${config.color} ${
                          formData.securityLevel === level ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 会议类别 */}
                <div>
                  <label className="block text-sm font-medium mb-2">会议类别</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="部门例会">部门例会</option>
                    <option value="项目评审">项目评审</option>
                    <option value="工作汇报">工作汇报</option>
                    <option value="专题研讨">专题研讨</option>
                    <option value="决策会议">决策会议</option>
                  </select>
                </div>

                {/* 会议时间 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">开始时间</label>
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">结束时间</label>
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* 会议类型 */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    会议类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {(Object.entries(typeConfig) as [MeetingType, typeof typeConfig.standard][]).map(([type, config]) => {
                      const IconComponent = config.icon
                      return (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                            formData.type === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.type === 'standard' 
                      ? '需要指定与会人员，材料按人员权限分发'
                      : '所有平板显示相同材料，无需指定与会人员'
                    }
                  </p>
                </div>

                {/* 会议介绍 */}
                <div>
                  <label className="block text-sm font-medium mb-2">会议介绍</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请输入会议介绍..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 会议设置 */}
                <div>
                  <label className="block text-sm font-medium mb-2">会议设置</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordModal(true)}
                      className={formData.password ? 'border-blue-500 text-blue-700' : ''}
                    >
                      🔐 {formData.password ? '密码: ***' : '会议密码'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExpiryModal(true)}
                      className={formData.expiryType !== 'none' ? 'border-blue-500 text-blue-700' : ''}
                    >
                      ⏰ {formData.expiryType === 'none' ? '有效期' : 
                           formData.expiryType === 'today' ? '当天过期' : formData.expiryDate}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 与会人员 - 仅标准会议显示 */}
            {formData.type === 'standard' && (
              <Card>
                <CardHeader>
                  <CardTitle>与会人员</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      参会人员 <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {/* 已添加的人员 */}
                      <div className="flex flex-wrap gap-2">
                        {formData.participants.map((participant) => (
                          <span
                            key={participant.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {participant.name}
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="hover:text-blue-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      
                      {/* 添加人员输入框 */}
                      <div className="flex gap-2">
                        <Input
                          value={participantInput}
                          onChange={(e) => setParticipantInput(e.target.value)}
                          onKeyPress={handleParticipantKeyPress}
                          placeholder="输入姓名添加参会人员"
                        />
                        <Button onClick={addParticipant} disabled={!participantInput.trim()}>
                          添加
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：会议议题 */}
          <div>
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>会议议题</CardTitle>
                  <Button variant="outline" size="sm" onClick={addAgenda}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加议题
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.agendas.map((agenda, index) => (
                    <div key={agenda.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <Input
                          value={agenda.name}
                          onChange={(e) => updateAgendaName(agenda.id, e.target.value)}
                          placeholder={`议题 ${index + 1} 名称`}
                          className="flex-1"
                        />
                        {formData.agendas.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeAgenda(agenda.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* 文件上传区域 */}
                      <div>
                        <label className="block text-sm font-medium mb-2">上传材料</label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.multiple = true
                            input.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files
                              handleFileUpload(agenda.id, files)
                            }
                            input.click()
                          }}
                        >
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            点击上传或拖拽文件到此处
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            支持 PDF, Word, Excel, PowerPoint 格式
                          </p>
                        </div>

                        {/* 已上传文件列表 */}
                        {agenda.materials.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">已上传文件：</p>
                            {agenda.materials.map((material) => (
                              <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="text-sm">
                                    <p className="font-medium">{material.name}</p>
                                    <p className="text-gray-500">{formatFileSize(material.size)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={material.securityLevel}
                                    onChange={(e) => updateMaterialSecurity(agenda.id, material.id, e.target.value as MeetingSecurityLevel)}
                                    className="text-xs px-2 py-1 border rounded"
                                  >
                                    <option value="internal">内部</option>
                                    <option value="confidential">秘密</option>
                                    <option value="secret">机密</option>
                                  </select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMaterial(agenda.id, material.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="bg-white border-t p-4 mt-8">
        <div className="max-w-7xl mx-auto flex justify-center gap-4">
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

      {/* 会议密码弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议密码</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">会议密码</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="请输入6位数字密码"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">设置后需要密码才能进入会议</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                取消
              </Button>
              <Button onClick={() => setShowPasswordModal(false)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 会议有效期弹窗 */}
      {showExpiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">设置会议有效期</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">有效期选择</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="none"
                    checked={formData.expiryType === 'none'}
                    onChange={(e) => handleInputChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  无限制
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="today"
                    checked={formData.expiryType === 'today'}
                    onChange={(e) => handleInputChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  当天
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="expiryType"
                    value="custom"
                    checked={formData.expiryType === 'custom'}
                    onChange={(e) => handleInputChange('expiryType', e.target.value)}
                    className="mr-2"
                  />
                  自定义
                </label>
              </div>
              {formData.expiryType === 'custom' && (
                <div className="mt-3">
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">设置后会议会在指定日期后自动销毁</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExpiryModal(false)}>
                取消
              </Button>
              <Button onClick={() => setShowExpiryModal(false)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateMeetingPage