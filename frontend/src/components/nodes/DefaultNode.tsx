import { Button, useDisclosure } from "@nextui-org/react"
import classNames from "classnames"
import { PlusIcon } from "lucide-react"
import { memo, useContext, useMemo, useState } from "react"
import { Handle, Position } from "reactflow"
import "reactflow/dist/style.css"
import { workspaceContext } from "../../contexts/workspaceContext"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import FallbackNodeIcon from "../../icons/nodes/FallbackNodeIcon"
import GlobalNodeIcon from "../../icons/nodes/GlobalNodeIcon"
import LocalNodeIcon from "../../icons/nodes/LocalNodeIcon"
import StartNodeIcon from "../../icons/nodes/StartNodeIcon"
import "../../index.css"
import ConditionModal from "../../modals/ConditionModal/ConditionModal"
import NodeModal from "../../modals/NodeModal/NodeModal"
import ResponseModal from "../../modals/ResponseModal/ResponseModal"
import { NodeDataType } from "../../types/NodeTypes"
import Condition from "./conditions/Condition"
import Response from "./responses/Response"

const DefaultNode = memo(({ data }: { data: NodeDataType }) => {
  const {
    onOpen: onConditionOpen,
    onClose: onConditionClose,
    isOpen: isConditionOpen,
  } = useDisclosure()

  const { selectedNode } = useContext(workspaceContext)

  const [nodeDataState, setNodeDataState] = useState<NodeDataType>(data)

  const { onOpen: onNodeOpen, onClose: onNodeClose, isOpen: isNodeOpen } = useDisclosure()
  const {
    onOpen: onResponseOpen,
    onClose: onResponseClose,
    isOpen: isResponseOpen,
  } = useDisclosure()

  const validate_node = useMemo(() => data.response?.data.length && data.conditions?.length, [])

  return (
    <>
      <div
        id={data.id}
        data-testid={data.id}
        className='default_node'>
        {data.flags?.includes("start") && (
          <span className='-top-2 left-4 bg-[var(--node-start-label-bg)] border border-[var(--node-start-label-bg)] absolute text-white text-xs font-medium rounded-small px-0.5 py-0.5 pb-4 -z-20 transition-transform cursor-auto hover:-z-10 hover:-translate-y-5'>
            <StartNodeIcon
              fill='var(--node-start-label-fg)'
              stroke='var(--node-start-label-fg)'
            />
          </span>
        )}
        {data.flags?.includes("fallback") && (
          <span className='-top-2 left-14 bg-[var(--node-fallback-label-bg)] border border-[var(--node-fallback-label-bg)] absolute text-white text-xs font-medium rounded-small px-0.5 py-0.5 pb-4 -z-20 transition-transform cursor-auto hover:-z-10 hover:-translate-y-5'>
            <FallbackNodeIcon
              fill='var(--node-fallback-label-fg)'
              stroke='var(--node-fallback-label-fg)'
            />
          </span>
        )}
        <div className='custom-drag-handle w-full flex justify-between items-center bg-node-header border-b border-border rounded-t-node pl-6 pr-4 py-2'>
          <div className='flex items-center'>
            {!data.id.includes("LOCAL_NODE") && !data.id.includes("GLOBAL_NODE") && (
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
                  top: "1.875rem",
                  left: "-0.335rem",
                  zIndex: 10,
                }}
              />
            )}
            <p className='font-medium text-medium flex items-center gap-1'>
              {data.id.includes("LOCAL_NODE") && <LocalNodeIcon />}
              {data.id.includes("GLOBAL_NODE") && <GlobalNodeIcon />}
              {data.name}
            </p>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <Button
              className='min-h-0 min-w-0 p-0 w-10 h-10'
              variant='light'
              isIconOnly
              onClick={onNodeOpen}>
              <EditNodeIcon />
            </Button>
            <span
              className={classNames(
                "flex w-5 h-5 rounded-full",
                validate_node ? "bg-success" : "bg-warning"
              )}
            />
          </div>
        </div>
        <div className=' w-full flex flex-col items-center justify-center gap-2 p-2.5 '>
          <div className="w-full flex items-center justify-start border border-border rounded-lg py-2 px-2 mb-1" onClick={onResponseOpen}>
            <Response data={data} />
          </div>
          <div className='w-full flex flex-col gap-2'>
            {data.conditions?.map((condition) => (
              <Condition
                key={condition.id}
                data={data}
                condition={condition}
              />
            ))}
          </div>
          <button
            data-testid={`${data.name.toLowerCase().replace(" ", "")}-add-condition-btn`}
            onClick={onConditionOpen}
            className='add-cnd-btn'>
            <PlusIcon color='var(--condition-default)' />
          </button>
        </div>
      </div>
      <ConditionModal
        data={data}
        isOpen={isConditionOpen}
        onClose={onConditionClose}
        is_create
      />
      <NodeModal
        data={data}
        isOpen={isNodeOpen}
        onClose={onNodeClose}
        onResponseModalOpen={onResponseOpen}
        nodeDataState={nodeDataState}
        setNodeDataState={setNodeDataState}
      />
      <ResponseModal
        data={nodeDataState}
        setData={setNodeDataState}
        isOpen={isResponseOpen}
        onClose={onResponseClose}
        response={nodeDataState.response!}
      />
    </>
  )
})

export default DefaultNode
