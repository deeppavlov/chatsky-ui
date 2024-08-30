import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@nextui-org/react"
import { HelpCircle, TrashIcon } from "lucide-react"
import React, { useCallback, useContext, useEffect } from "react"
import { useReactFlow } from "reactflow"
import ModalComponent from "../../components/ModalComponent"
import { flowContext } from "../../contexts/flowContext"
import EditPenIcon from "../../icons/EditPenIcon"
import { NodeDataType } from "../../types/NodeTypes"
import ConditionRow from "./components/ConditionRow"

type NodeModalProps = {
  data: NodeDataType
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
  onResponseModalOpen: () => void
  nodeDataState: NodeDataType
  setNodeDataState: React.Dispatch<React.SetStateAction<NodeDataType>>
}

const NodeModal = ({
  data,
  isOpen,
  onClose,
  size = "3xl",
  onResponseModalOpen,
  nodeDataState,
  setNodeDataState,
}: NodeModalProps) => {
  const { getNodes, setNodes } = useReactFlow()
  const { quietSaveFlows } = useContext(flowContext)

  useEffect(() => {
    setNodeDataState(getNodes().find((node) => node.data.id === data.id)?.data ?? data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const setDataStateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNodeDataState({ ...nodeDataState, [e.target.name]: e.target.value })
    },
    [nodeDataState]
  )

  const setTextResponseValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeDataState({
      ...nodeDataState,
      response: {
        ...nodeDataState.response!,
        type: "text",
        data: [{ text: e.target.value, priority: 1 }],
      },
    })
  }

  const onNodeSave = () => {
    const nodes = getNodes()
    const node = nodes.find((node) => node.data.id === data.id)
    const new_nodes = nodes.map((node) => {
      if (node.data.id === data.id) {
        return { ...node, data: { ...node.data, ...nodeDataState } }
      }
      return node
    })
    if (node) {
      setNodes(() => new_nodes)
    }
    quietSaveFlows()
    onClose()
  }

  const onNodeDelete = () => {
    const nodes = getNodes()
    const new_nodes = nodes.filter((node) => node.data.id !== data.id)
    setNodes(new_nodes)
    quietSaveFlows()
    onClose()
  }

  const deleteCondition = (id: string) => {
    if (nodeDataState.conditions) {
      setNodeDataState({
        ...nodeDataState,
        conditions: nodeDataState.conditions.filter((c) => c.id !== id),
      })
    }
  }

  return (
    <>
      <ModalComponent
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
                variant='bordered'
                name='name'
                value={nodeDataState.name}
                onChange={setDataStateValue}
              />
              <span className='relative'>
                <Input
                  label='Response'
                  labelPlacement='outside'
                  placeholder="Enter node's response here"
                  name='response'
                  variant='bordered'
                  disabled
                  value={nodeDataState.response?.data[0].text ?? "No text response"}
                  onChange={setTextResponseValue}
                />
                <button
                  onClick={() => {
                    onResponseModalOpen()
                  }}
                  className='absolute right-3 top-9'>
                  <EditPenIcon />
                </button>
              </span>
            </div>
            <div>
              <p className='text-sm font-medium mb-2 mt-2'> Conditions (x) </p>
              <div className='border border-border rounded-xl'>
                <div className='grid grid-cols-3 gap-4 px-4 py-2'>
                  <div>NAME</div>
                  <div>PRIORITY</div>
                  <div>ACTIONS</div>
                </div>
                <div className='grid'>
                  {nodeDataState.conditions?.map((cnd) => (
                    <ConditionRow
                      deleteConditionFn={deleteCondition}
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
      </ModalComponent>
    </>
  )
}

export default NodeModal
