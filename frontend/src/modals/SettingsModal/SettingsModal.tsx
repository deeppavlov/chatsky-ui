import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react"
import React from "react"
import { ModalType } from "../../types/ModalTypes"

const SettingsModal = ({ isOpen, onClose, size = "3xl" }: ModalType) => {
  return (
    <Modal
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      <ModalContent>
        <ModalHeader> Settings </ModalHeader>
        <ModalBody></ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default SettingsModal
