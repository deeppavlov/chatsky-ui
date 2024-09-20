import * as Dialog from "@radix-ui/react-dialog"
import classNames from "classnames"
import { motion } from "framer-motion"; // Для анимации
import { X } from "lucide-react"
import { forwardRef } from "react"

export type CustomModalProps = {
  id?: string
  onClose?: () => void
}

// Базовая обертка для модального окна
export type ModalProps = {
  id?: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ id, isOpen, onClose, children, size = "3xl" }, ref) => {
    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={onClose}>
        <Dialog.Portal container={document.getElementById("modal_root")}>
          <Dialog.Overlay
            id={id}
            asChild>
            <motion.div
              className='w-screen h-screen flex items-center justify-center fixed inset-0 z-50 bg-black/20'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              key={id}
              ref={ref}
              className={`fixed z-50 w-full max-w-${size} p-6 bg-background rounded-2xl shadow-lg`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
  }
)

Modal.displayName = "Modal"

type ModalHeaderProps = {
  children: React.ReactNode
  className?: string
}

export const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <div className={classNames("flex items-center justify-between pb-4", className)}>
    {children}
    <Dialog.Close asChild>
      <button className='text-gray-400 hover:text-gray-600'>
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
  <div className={classNames("max-h-[70vh] overflow-y-scroll scrollbar-hide", className)}>
    {children}
  </div>
)

type ModalFooterProps = {
  children: React.ReactNode
  className?: string
}

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={classNames("flex justify-end gap-2 pt-4", className)}>{children}</div>
)
