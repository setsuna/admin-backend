/**
 * UI相关的通用类型定义
 * 包含界面组件、表单、表格等UI相关类型
 */

import type { ReactNode } from 'react'
import type { BaseFilters, PaginationParams, SelectOption, FileInfo } from './base.types'

// 通知相关
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  timestamp: number
  actions?: NotificationAction[]
  persistent?: boolean  // 🆕 是否持久显示(不自动消失)
  category?: 'api' | 'validation' | 'network' | 'system' | 'business'  // 🆕 通知分类
}

export interface NotificationAction {
  label: string
  action: () => void
  type?: 'primary' | 'secondary'
}

// 表格相关
export interface TableColumn<T = any> {
  key: keyof T | string
  title: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  filterable?: boolean
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  render?: (value: any, record: T, index: number) => ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationParams & {
    total?: number
    showSizeChanger?: boolean
    showQuickJumper?: boolean
  }
  onPaginationChange?: (pagination: PaginationParams) => void
  rowKey?: keyof T | ((record: T) => string)
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[], selectedRows: T[]) => void
  onRowClick?: (record: T, index: number) => void
  className?: string
  size?: 'small' | 'middle' | 'large'
  bordered?: boolean
  showHeader?: boolean
}

// 表单相关
export interface FormField {
  name: string
  label: string
  type: 'text' | 'password' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'daterange' | 'upload' | 'cascader'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
  options?: SelectOption[]
  rules?: ValidationRule[]
  dependencies?: string[]
  extra?: Record<string, any>
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp | string
  validator?: (value: any, values: Record<string, any>) => Promise<void> | void
  message: string
  type?: 'string' | 'number' | 'email' | 'url' | 'date'
}

export interface FormProps<T = Record<string, any>> {
  fields: FormField[]
  initialValues?: Partial<T>
  onSubmit?: (values: T) => void | Promise<void>
  onValuesChange?: (changedValues: Partial<T>, allValues: T) => void
  loading?: boolean
  disabled?: boolean
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelCol?: { span?: number; offset?: number }
  wrapperCol?: { span?: number; offset?: number }
  className?: string
}

// 搜索相关
export interface SearchConfig {
  placeholder?: string
  allowClear?: boolean
  enterButton?: boolean | string
  size?: 'small' | 'middle' | 'large'
  onSearch?: (value: string) => void
  onClear?: () => void
}

export interface FilterConfig<T = BaseFilters> {
  fields: FilterField[]
  initialValues?: Partial<T>
  onFilter?: (values: T) => void
  onReset?: () => void
  collapsed?: boolean
  expandable?: boolean
}

export interface FilterField extends Omit<FormField, 'required'> {
  span?: number
  order?: number
}

// 模态框相关
export interface ModalProps {
  title?: string
  visible?: boolean
  width?: number | string
  centered?: boolean
  destroyOnClose?: boolean
  maskClosable?: boolean
  footer?: ReactNode | null
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  confirmLoading?: boolean
  className?: string
  bodyStyle?: React.CSSProperties
}

// 抽屉相关
export interface DrawerProps {
  title?: string
  visible?: boolean
  width?: number | string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  destroyOnClose?: boolean
  maskClosable?: boolean
  footer?: ReactNode | null
  onClose?: () => void
  className?: string
  bodyStyle?: React.CSSProperties
}

// 步骤条相关
export interface Step {
  key: string
  title: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
  status?: 'wait' | 'process' | 'finish' | 'error'
}

export interface StepsProps {
  steps: Step[]
  current?: number
  direction?: 'horizontal' | 'vertical'
  size?: 'small' | 'default'
  status?: 'wait' | 'process' | 'finish' | 'error'
  onChange?: (current: number) => void
}

// 标签页相关
export interface TabPane {
  key: string
  title: string | ReactNode
  disabled?: boolean
  closable?: boolean
  content?: ReactNode
}

export interface TabsProps {
  tabs: TabPane[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  onTabClick?: (key: string, event: React.MouseEvent) => void
  onEdit?: (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => void
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'default' | 'large'
  position?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

// 上传相关
export interface UploadFile extends FileInfo {
  status?: 'uploading' | 'done' | 'error' | 'removed'
  percent?: number
  response?: any
  error?: Error
  uid?: string
  preview?: string
}

export interface UploadProps {
  accept?: string
  multiple?: boolean
  maxCount?: number
  maxSize?: number
  fileList?: UploadFile[]
  defaultFileList?: UploadFile[]
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<File>
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>
  onPreview?: (file: UploadFile) => void
  onDownload?: (file: UploadFile) => void
  disabled?: boolean
  directory?: boolean
  className?: string
}

// 树形组件相关
export interface TreeNodeData {
  key: string
  title: string | ReactNode
  children?: TreeNodeData[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  icon?: ReactNode
  data?: any
}

export interface TreeProps {
  treeData: TreeNodeData[]
  checkable?: boolean
  selectable?: boolean
  multiple?: boolean
  checkStrictly?: boolean
  showLine?: boolean
  showIcon?: boolean
  expandedKeys?: string[]
  selectedKeys?: string[]
  checkedKeys?: string[]
  onExpand?: (expandedKeys: string[], info: any) => void
  onSelect?: (selectedKeys: string[], info: any) => void
  onCheck?: (checkedKeys: string[] | { checked: string[]; halfChecked: string[] }, info: any) => void
  loadData?: (node: TreeNodeData) => Promise<void>
  className?: string
}

// 加载状态
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface AsyncState<T> extends LoadingState {
  data: T | null
}

// 操作按钮
export interface ActionButton {
  key: string
  label: string
  icon?: ReactNode
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  danger?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void | Promise<void>
  permission?: string
  visible?: boolean
}

// 批量操作
export interface BatchAction {
  key: string
  label: string
  icon?: ReactNode
  danger?: boolean
  disabled?: boolean
  onClick?: (selectedIds: string[]) => void | Promise<void>
  permission?: string
  confirmText?: string
}

// 工具栏
export interface ToolbarProps {
  title?: string
  actions?: ActionButton[]
  batchActions?: BatchAction[]
  selectedCount?: number
  extra?: ReactNode
  className?: string
}

// 空状态
export interface EmptyProps {
  image?: ReactNode | string
  imageStyle?: React.CSSProperties
  description?: ReactNode
  children?: ReactNode
  className?: string
}

// 结果页
export interface ResultProps {
  status?: 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500'
  title: string
  subTitle?: string
  extra?: ReactNode
  icon?: ReactNode
  className?: string
}

// 统计卡片
export interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down'
  trendValue?: string | number
  icon?: ReactNode
  color?: string
  loading?: boolean
  className?: string
}
