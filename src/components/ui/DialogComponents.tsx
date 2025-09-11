import React from 'react'
import { AlertModal, ConfirmModal } from './Modal'
import { UseDialogReturn } from '@/hooks/useModal'

interface DialogComponentsProps {
  dialog: UseDialogReturn
}

export const DialogComponents: React.FC<DialogComponentsProps> = ({ dialog }) => {
  const { alertState, confirmState, closeAlert, closeConfirm } = dialog

  return (
    <>
      {alertState.isOpen && alertState.options && (
        <AlertModal
          isOpen={alertState.isOpen}
          onClose={closeAlert}
          {...alertState.options}
        />
      )}
      
      {confirmState.isOpen && confirmState.options && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => closeConfirm(false)}
          onConfirm={() => closeConfirm(true)}
          {...confirmState.options}
        />
      )}
    </>
  )
}
