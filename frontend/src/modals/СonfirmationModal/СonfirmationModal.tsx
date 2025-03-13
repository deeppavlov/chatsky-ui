import { Button } from '@nextui-org/react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import { ModalType } from '../../types/ModalTypes'
import { FlowType } from '../../types/FlowTypes'
import { LinkNodeDataType } from '../../types/NodeTypes'
import { flowContext } from '../../contexts/flowContext'
import { useContext } from 'react'
interface ConfirmationModalProps extends ModalType {
 flow: FlowType
 onDelete: (e: React.MouseEvent) => void
}

interface Link {
 target_flow: string
 target_node: string
 id: string
 name: string
}

interface ArrLink {
 lincks: Link[]
}

const getContent = (arrLink: Link[]): string => {
 if (arrLink.length >= 2) {
  return 'This flow is linked to other flows.'
 }
 if (arrLink.length === 1) {
  return `This flow is linked to ${arrLink[0].name}.`
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
 const { flows } = useContext(flowContext)

 const myFlows = flows.filter((el) => el.name !== 'Global')

 const arrLinks = myFlows.map((el: FlowType) => {
  const name = el.name
  const links = el.data.nodes
   .filter((el) => el.type === 'link_node')
   .map((link) => {
    const { target_flow, target_node } = (link.data as LinkNodeDataType)
     .transition
    const id = el.id

    return { target_flow, target_node, id, name }
   })

  return { links }
 })

 const result = arrLinks
  .map((el) => {
   const res = el.links.filter((link) => link.target_flow === flow.name)
   return res
  })
  .flat()

 console.log(result)

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
    <div>{getContent(result)}</div>
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
