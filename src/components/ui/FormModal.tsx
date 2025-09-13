import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface FormModalProps {
  isOpen?: boolean
  open?: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  title: string
  children?: React.ReactNode
  fields?: any[]
  initialData?: any
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onSubmit?: (data: any) => void
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  loading?: boolean
  disabled?: boolean
  showFooter?: boolean
  footerContent?: React.ReactNode
  className?: string
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  children,
  fields,
  initialData,
  size = 'md',
  onSubmit,
  submitText = '保存',
  cancelText = '取消',
  isLoading = false,
  loading = false,
  disabled = false,
  showFooter = true,
  footerContent,
  className
}) => {
  const [formData, setFormData] = React.useState(initialData || {})
  
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])
  
  const actualIsOpen = isOpen ?? open ?? false
  const actualOnClose = onClose || ((onOpenChange) ? () => onOpenChange(false) : () => {})
  const actualIsLoading = isLoading || loading
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && !actualIsLoading && !disabled) {
      onSubmit(formData)
    }
  }
  
  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }
  
  const renderField = (field: any) => {
    const { name, label, type, required, placeholder, options } = field
    
    switch (type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={placeholder}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      case 'textarea':
        return (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      case 'select':
        return (
          <div key={name} className="space-y-1">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={formData[name] || ''}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      default:
        return null
    }
  }

  const defaultFooter = (
    <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button 
        type="button" 
        variant="outline" 
        onClick={actualOnClose}
        disabled={actualIsLoading}
      >
        {cancelText}
      </Button>
      <Button 
        type="submit" 
        loading={actualIsLoading}
        disabled={disabled}
      >
        {submitText}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={actualIsOpen}
      onClose={actualOnClose}
      title={title}
      size={size}
      className={className}
      closeOnOverlay={!actualIsLoading}
      showCloseButton={!actualIsLoading}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <div className="space-y-4">
            {fields ? fields.map(renderField) : children}
          </div>
          {showFooter && (footerContent || defaultFooter)}
        </div>
      </form>
    </Modal>
  )
}

export default FormModal
