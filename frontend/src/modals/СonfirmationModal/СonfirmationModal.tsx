import { Button } from '@nextui-org/react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import { ModalType } from '../../types/ModalTypes'
import { FlowType } from '../../types/FlowTypes'
import { LinkNodeDataType } from '../../types/NodeTypes'
interface ConfirmationModalProps extends ModalType {
 flow: FlowType
 onDelete: (e: React.MouseEvent) => void
}

const getContent = (arrLink: string[]) => {
 if (arrLink.length >= 2) {
  return 'This flow is linked to other flows.'
 }
 if (arrLink.length === 1) {
  return `This flow is linked to ${arrLink[0]}.`
 }

 return 'This flow contains part of <Project name> dialog.'
}

const СonfirmationModal = ({
 flow,
 isOpen,
 onClose,
 onDelete,
 size = '3xl',
}: ConfirmationModalProps) => {
 console.log(flow, 'СonfirmationModal ')

 const getLinckNodeOut = () => {
  const linkNodes = flow.data.nodes.filter((node) => node.type === 'link_node');

  if (linkNodes.length !== 0) {
    const transitions = linkNodes.map((node) =>
      (node.data as LinkNodeDataType).transition.target_flow
    );
    return [...new Set(transitions)];
  }
  return [];
 }

 const linckNodeIn = (flow?.toLink?.map((el) => el.flowName) ?? []).filter((name): name is string => !!name);
 const linckNodeOut = getLinckNodeOut()

 const arrLink = [...new Set([...linckNodeIn, ...linckNodeOut])]

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
    <div>{getContent(arrLink)}</div>
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
