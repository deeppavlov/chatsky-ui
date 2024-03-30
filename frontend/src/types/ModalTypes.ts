import { ModalProps } from "@nextui-org/react"

export type ModalType = {
  isOpen: boolean
  onClose: () => void
  size?: ModalProps["size"]
}