import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react"
import { AlertTriangle, Link2, Trash2 } from "lucide-react"
import { memo, useContext, useEffect, useMemo, useState } from "react"
import { Handle, Node, Position } from "reactflow"
import "reactflow/dist/style.css"
import { flowContext } from "../../contexts/flowContext"
import "../../index.css"
import { FlowType } from "../../types/FlowTypes"
import { NodeDataType } from "../../types/NodeTypes"

const LinkNode = memo(({ data }: { data: NodeDataType }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const { flows, deleteNode } = useContext(flowContext)
  const [toFlow, setToFlow] = useState<FlowType>()
  const [toNode, setToNode] = useState<Node<NodeDataType>>()
  // const { openPopUp } = useContext(PopUpContext)

  useEffect(() => {
    if (data.transition.target_node) {
      const to_flow = flows.find((flow) =>
        flow.data.nodes.some((node) => node.data.id === data.transition.target_node)
      )
      const to_node = to_flow?.data.nodes.find(
        (node) => node.data.id === data.transition.target_node
      )
      if (to_node && to_flow) {
        setToFlow(to_flow)
        setToNode(to_node)
      }
    }
    if (!data.transition.target_node) {
      onOpen()
    }
  }, [data.transition.target_node])

  const handleFlowSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToFlow(flows.find((flow) => flow.name === e.target.value))
  }

  const handleNodeSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToNode(toFlow?.data.nodes.find((node) => node.data.name === e.target.value))
  }

  const TO_FLOW = useMemo(
    () => flows.find((flow) => flow.name === data.transition.target_flow),
    [data.transition.target_flow, flows]
  )
  const TO_NODE = useMemo(
    () => TO_FLOW?.data.nodes.find((node) => node.data.id === data.transition.target_node),
    [TO_FLOW?.data.nodes, data.transition.target_node]
  )

  const onDismiss = () => {
    setToFlow(TO_FLOW)
    setToNode(TO_NODE)
    onClose()
    if (!data.transition.target_node) {
      setTimeout(() => {
        deleteNode(data.id)
      }, 100)
    }
  }

  const onSave = () => {
    if (toFlow && toNode) {
      data.transition.target_flow = toFlow.name
      data.transition.target_node = toNode.data.id
      onClose()
    }
  }

  return (
    <>
      <div
        onDoubleClick={onOpen}
        className='default_node px-6 py-4'>
        <div className=' w-full h-1/3 flex justify-between items-center bg-node rounded-node'>
          <Handle
            isConnectableEnd
            position={Position.Left}
            type='target'
            style={{
              background: "var(--background)",
              borderWidth: "2px",
              borderColor: "var(--condition-input-handle)",
              borderStyle: "solid",
              width: "0.7rem",
              height: "0.7rem",
              top: "3.2rem",
              left: "-0.335rem",
              zIndex: 10,
            }}
          />
          <Popover radius='sm'>
            <PopoverTrigger>
              <p className='font-medium text-medium text-neutral-500'>{data.name}</p>
            </PopoverTrigger>
            <PopoverContent>ID: {data.id}</PopoverContent>
          </Popover>
          {(!toFlow || !toNode) && (
            <Tooltip
              content='It looks like this node/flow is not defined. Please, re-create it!'
              radius='sm'>
              <Button
                size='sm'
                isIconOnly
                color='danger'
                onClick={() => deleteNode(data.id)}>
                <Trash2 className='stroke-white' />
              </Button>
            </Tooltip>
          )}
        </div>
        <div className='py-2.5 h-2/3 flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <Link2 strokeWidth={1.3} />
            {TO_FLOW ? TO_FLOW.name : "ERROR"} / {TO_NODE ? TO_NODE.data.name : "ERROR"}
          </div>
          <div></div>
        </div>
      </div>
      <Modal
        hideCloseButton
        isKeyboardDismissDisabled
        isDismissable={false}
        size='xl'
        isOpen={isOpen}
        onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <div>
              <div className='flex items-start justify-start'>
                <h1>{data.name} settings</h1>
                <Tooltip
                  className='text-white'
                  color='warning'
                  radius='sm'
                  content='Link options is required to add a link'>
                  <AlertTriangle
                    className='ml-1 fill-amber-400 cursor-pointer'
                    stroke='white'
                  />
                </Tooltip>
              </div>
              <p className='text-neutral-500 text-sm font-normal'>Target node info</p>
            </div>
          </ModalHeader>
          <ModalBody>
            <Table>
              <TableHeader>
                <TableColumn>
                  <p className='text-sm'>Parameter</p>
                </TableColumn>
                <TableColumn>
                  <p className='text-sm'>Value</p>
                </TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow
                  className='w-full'
                  key={1}>
                  <TableCell className='w-1/2'>
                    <p className='text-sm'>Flow</p>
                  </TableCell>
                  <TableCell className='w-1/2'>
                    <Select
                      classNames={{
                        trigger: "min-h-8 h-8 py-0",
                        value: "text-sm",
                      }}
                      isRequired
                      placeholder='Select a flow'
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      selectedKeys={toFlow ? [toFlow.name] : []}
                      onChange={handleFlowSelectionChange}
                      size='sm'
                      items={flows}>
                      {(flow) => <SelectItem key={flow.name}>{flow.name}</SelectItem>}
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow key={2}>
                  <TableCell className='w-1/2'>
                    <p className='text-sm'>Node</p>
                  </TableCell>
                  <TableCell className='w-1/2'>
                    <Select
                      classNames={{
                        trigger: "min-h-8 h-8 py-0",
                        value: "text-sm",
                      }}
                      isRequired
                      isDisabled={!toFlow}
                      size='sm'
                      placeholder='Select a node'
                      onChange={handleNodeSelectionChange}
                      selectedKeys={toNode ? [toNode.data.name] : []}
                      items={
                        toFlow?.data.nodes.filter((node) => {
                          console.log(node)
                          return (
                            !["link_node", "global", "local"].includes(node.type!) &&
                            !["LOCAL NODE", "GLOBAL NODE"].includes(node.data.name!)
                          )
                        }) ?? []
                      }>
                      {(node) => <SelectItem key={node.data.name}>{node.data.name}</SelectItem>}
                    </Select>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDismiss}>Cancel</Button>
            <Button
              isDisabled={!toFlow || !toNode}
              className='bg-foreground text-background'
              onClick={onSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})

export default LinkNode
