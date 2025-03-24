import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import { motion } from 'framer-motion' // Для анимации
import { X } from 'lucide-react'
import { forwardRef } from 'react'

export type CustomModalProps = {
  id?: string
  onClose?: () => void
}

// Базовая обертка для модального окна
export type ModalProps = React.HTMLAttributes<HTMLElement> & {
  id?: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?:
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | 'full'
  className?: string
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    { id, isOpen, onClose, children, size = '3xl', className, ...props },
    ref,
  ) => {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal container={document.getElementById('modal_root')}>
          <Dialog.Overlay id={id} asChild>
            <motion.div
              className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/20'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild {...props}>
            <motion.div
              key={id}
              ref={ref}
              className={classNames(
                `fixed z-50 w-full max-w-${size} rounded-2xl bg-background p-6 shadow-lg`,
                className,
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  },
)

Modal.displayName = 'Modal'

type ModalHeaderProps = {
  children: React.ReactNode
  className?: string
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <div
    className={classNames('flex items-center justify-between pb-4', className)}
  >
    <Dialog.Title>{children}</Dialog.Title>
    <Dialog.Close asChild>
      <button className='rounded-lg bg-background p-0.5 text-foreground transition-colors hover:bg-bg-secondary'>
        <X size={20} />
      </button>
    </Dialog.Close>
  </div>
)

type ModalBodyProps = {
  children: React.ReactNode
  className?: string
}

export const ModalBody = ({ children, className }: ModalBodyProps) => (
  <div
    className={classNames(
      'max-h-[70vh] overflow-y-scroll scrollbar-hide',
      className,
    )}
  >
    {children}
  </div>
)

type ModalFooterProps = {
  children: React.ReactNode
  className?: string
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={classNames('flex justify-end gap-2 pt-4', className)}>
    {children}
  </div>
)
