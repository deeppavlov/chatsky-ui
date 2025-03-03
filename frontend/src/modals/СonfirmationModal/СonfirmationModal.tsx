import { Button } from '@nextui-org/react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import { ModalType } from '../../types/ModalTypes'
import { FlowType } from '../../types/FlowTypes'

interface ConfirmationModalProps extends ModalType {
 flow: FlowType
 onDelete: (e: React.MouseEvent) => void
 content: string
}

const СonfirmationModal = ({
 content,
 flow,
 isOpen,
 onClose,
 onDelete,
 size = '3xl',
}: ConfirmationModalProps) => {
 console.log(flow)

 return (
  <Modal
   className="bg-background"
   isOpen={isOpen}
   onClose={onClose}
   size={size}
  >
   <ModalHeader className={'!justify-center'} showCloseButton={false}>
    {`Do you want to delete ${flow.name}?`}
   </ModalHeader>
   <ModalBody className={'flex flex-1 flex-col gap-3 py-2'}>
    <div>{content}</div>
   </ModalBody>
   <ModalFooter className="flex-row flex justify-between items-center">
    <div className="flex gap-[16px] w-full">
     <Button className="h-[40px] w-[152px] rounded-[10px]" onClick={onClose}>
      Cancel
     </Button>
     <Button
      className="h-[40px] w-[152px] rounded-[10px] text-white bg-black"
      onClick={onDelete}
     >
      Delete
     </Button>
    </div>
   </ModalFooter>
  </Modal>
 )
}

export default СonfirmationModal
