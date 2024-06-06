import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps
} from "@nextui-org/react"
import { HelpCircle, TrashIcon } from "lucide-react"
import React, { useCallback, useState } from "react"
import { useReactFlow } from "reactflow"
import { NodeDataType } from "../../types/NodeTypes"
import ConditionRow from "./components/ConditionRow"

type NodeModalProps = {
  data: NodeDataType
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
}

const NodeModal = ({ data, isOpen, onClose, size = "3xl" }: NodeModalProps) => {
  const [nodeDataState, setNodeDataState] = useState<NodeDataType>(data)
  const { getNodes, setNodes } = useReactFlow()

  const setDataStateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNodeDataState({ ...nodeDataState, [e.target.name]: e.target.value })
    },
    [nodeDataState]
  )

  const onNodeSave = () => {
    const nodes = getNodes()
    const node = nodes.find((node) => node.data.id === data.id)
    if (node) {
      setNodes(
        nodes.map((node) => {
          if (node.data.id === data.id) {
            return { ...node, data: { ...node.data, ...nodeDataState } }
          }
          return node
        })
      )
    }
    onClose()
  }

  // console.log(data.conditions)

  return (
    <Modal
      className='bg-background min-h-[584px]'
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      <ModalContent>
        <ModalHeader>{"Edit node"}</ModalHeader>
        <ModalBody>
          <label></label>
          <div className='grid gap-4'>
            <Input
              label='Name'
              labelPlacement='outside'
              placeholder="Enter node's name here"
              name='name'
              value={nodeDataState.name}
              onChange={setDataStateValue}
            />
            <Input
              label='Response'
              labelPlacement='outside'
              placeholder="Enter node's response here"
              name='response'
              value={nodeDataState.response}
              onChange={setDataStateValue}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2 mt-2"> Conditions (x) </p>
            <div className="border border-border rounded-xl">
              <div className='grid grid-cols-3 gap-4 px-4 py-2'>
                <div>NAME</div>
                <div>PRIORITY</div>
                <div>ACTIONS</div>
              </div>
              <div className="grid">
                {data.conditions?.map((cnd) => (
                  <ConditionRow
                    key={cnd.id}
                    cnd={cnd}
                  />
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className='flex justify-between items-center'>
          <div className='flex items-center justify-start gap-2'>
            <Button
              isIconOnly
              className='rounded-full'>
              <HelpCircle />
            </Button>
            <Button
              className='hover:bg-red-500'
              isIconOnly>
              <TrashIcon />
            </Button>
          </div>
          <div>
            <Button
              onClick={onNodeSave}
              className='bg-foreground text-background'>
              Save node
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NodeModal
