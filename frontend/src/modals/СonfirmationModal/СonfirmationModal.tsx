import { Button } from '@nextui-org/react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import { ModalType } from '../../types/ModalTypes'
import { FlowType } from '../../types/FlowTypes'

interface ConfirmationModalProps extends ModalType {
 flow: FlowType
 onDelete: (e: React.MouseEvent) => void
}

const islinkNode = (flow: FlowType) => {
 return flow.data.nodes.some((node) => node.type === 'link_node')
}

const СonfirmationModal = ({
 flow,
 isOpen,
 onClose,
 onDelete,
 size = '3xl',
}: ConfirmationModalProps) => {
 console.log(flow, 'СonfirmationModal ')

 const genContent = () => {
  const result = []
  const linkNode = flow.data.nodes.filter((node) => node.type === 'link_node')

  if (linkNode.length !== 0) {
   const linkNode = flow.data.nodes.filter((node) => node.type === 'link_node')
   const transitions = linkNode.map(({ data }) => data.transition.target_flow)
   const targetFlow = [...new Set(transitions)]
   result.push(...targetFlow)
  }

  if (islinkNode(flow)) {
   result.push(`This flow contains part of <Project name> dialog.`)
  }

  return result
 }

 //  console.log(targetFlow, 'targetFlow')

 console.log(genContent())

 return (
  <Modal
   className="bg-background w-[368px] p-[24px] pt-[16px]"
   isOpen={isOpen}
   onClose={onClose}
   size={size}
  >
   <ModalHeader
    className={'!justify-center pb-[0px] pt-[8px]'}
    showCloseButton={false}
   >
    {`Do you want to delete ${flow.name}?`}
   </ModalHeader>
   <ModalBody className={'flex flex-1 flex-col gap-3 py-2'}>
    <div>{123}</div>
   </ModalBody>
   <ModalFooter className="flex-row flex justify-between items-center">
    <div className="flex justify-between w-full">
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
