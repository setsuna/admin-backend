import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onSubmit?: (e: React.FormEvent) => void
  submitText?: string
  cancelText?: string
  isLoading?: boolean
  disabled?: boolean
  showFooter?: boolean
  footerContent?: React.ReactNode
  className?: string
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  onSubmit,
  submitText = '保存',
  cancelText = '取消',
  isLoading = false,
  disabled = false,
  showFooter = true,
  footerContent,
  className
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && !isLoading && !disabled) {
      onSubmit(e)
    }
  }

  const defaultFooter = (
    <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      <Button 
        type="submit" 
        loading={isLoading}
        disabled={disabled}
      >
        {submitText}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      closeOnOverlay={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {children}
          {showFooter && (footerContent || defaultFooter)}
        </div>
      </form>
    </Modal>
  )
}

export default FormModal
