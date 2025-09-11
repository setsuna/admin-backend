// Mock API 服务
export interface MeetingCategory {
  id: string
  name: string
  description?: string
}

export interface SecurityLevel {
  value: string
  label: string
  color: string
}

export interface OrgUser {
  id: string
  name: string
  type: 'user'
  position?: string
  department?: string
}

export interface OrgGroup {
  id: string
  name: string
  type: 'group'
  children: (OrgUser | OrgGroup)[]
}

export interface OrgDepartment {
  id: string
  name: string
  type: 'department'
  children: (OrgGroup | OrgUser)[]
}

// Mock数据
const mockCategories: MeetingCategory[] = [
  { id: '1', name: '部门例会', description: '定期部门工作汇报会议' },
  { id: '2', name: '项目评审', description: '项目阶段性评审会议' },
  { id: '3', name: '工作汇报', description: '个人或团队工作汇报' },
  { id: '4', name: '专题研讨', description: '特定主题的深度讨论' },
  { id: '5', name: '决策会议', description: '重要事项决策讨论' },
  { id: '6', name: '培训会议', description: '内部培训或学习交流' },
  { id: '7', name: '客户会议', description: '与客户的沟通会议' }
]

const mockSecurityLevels: SecurityLevel[] = [
  { value: 'internal', label: '内部', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'confidential', label: '秘密', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 'secret', label: '机密', color: 'bg-red-500 hover:bg-red-600' }
]

const mockOrgData: OrgDepartment[] = [
  {
    id: '1',
    name: '研发部',
    type: 'department',
    children: [
      {
        id: '1-1',
        name: '前端组',
        type: 'group',
        children: [
          { id: '1-1-1', name: '张三', type: 'user', position: '高级前端工程师' },
          { id: '1-1-2', name: '李四', type: 'user', position: '前端工程师' },
          { id: '1-1-3', name: '王小明', type: 'user', position: '前端实习生' }
        ]
      },
      {
        id: '1-2',
        name: '后端组',
        type: 'group',
        children: [
          { id: '1-2-1', name: '王五', type: 'user', position: '架构师' },
          { id: '1-2-2', name: '赵六', type: 'user', position: '后端工程师' },
          { id: '1-2-3', name: '钱七', type: 'user', position: '数据库工程师' }
        ]
      },
      {
        id: '1-3',
        name: '测试组',
        type: 'group',
        children: [
          { id: '1-3-1', name: '孙八', type: 'user', position: '测试经理' },
          { id: '1-3-2', name: '周九', type: 'user', position: '测试工程师' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '产品部',
    type: 'department',
    children: [
      { id: '2-1', name: '刘产品', type: 'user', position: '产品总监' },
      { id: '2-2', name: '陈经理', type: 'user', position: '产品经理' },
      { id: '2-3', name: '吴设计', type: 'user', position: 'UI设计师' }
    ]
  },
  {
    id: '3',
    name: '运营部',
    type: 'department',
    children: [
      {
        id: '3-1',
        name: '市场组',
        type: 'group',
        children: [
          { id: '3-1-1', name: '马市场', type: 'user', position: '市场经理' },
          { id: '3-1-2', name: '朱推广', type: 'user', position: '推广专员' }
        ]
      },
      { id: '3-2', name: '黄运营', type: 'user', position: '运营总监' }
    ]
  }
]

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  // 获取会议类别
  async getMeetingCategories(): Promise<MeetingCategory[]> {
    await delay(300)
    return [...mockCategories]
  },

  // 获取密级选项
  async getSecurityLevels(): Promise<SecurityLevel[]> {
    await delay(200)
    return [...mockSecurityLevels]
  },

  // 获取组织架构
  async getOrganization(): Promise<OrgDepartment[]> {
    await delay(500)
    return [...mockOrgData]
  },

  // 搜索用户
  async searchUsers(keyword: string): Promise<OrgUser[]> {
    await delay(300)
    const allUsers: OrgUser[] = []
    
    const extractUsers = (items: (OrgDepartment | OrgGroup | OrgUser)[]): void => {
      items.forEach(item => {
        if (item.type === 'user') {
          allUsers.push(item as OrgUser)
        } else if ('children' in item) {
          extractUsers(item.children)
        }
      })
    }
    
    extractUsers(mockOrgData)
    
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (user.position && user.position.toLowerCase().includes(keyword.toLowerCase()))
    )
  }
}
