import React, { memo, useContext, useEffect, useMemo } from "react"
import { NodeDataType, NodeType } from "../../types/NodeTypes"
import { Handle, Position, useReactFlow } from "reactflow"
import "reactflow/dist/style.css"
import "../../index.css"
import Condition from "./conditions/Condition"
import Response from "./responses/Response"
import { PlusIcon } from "lucide-react"
import { useDisclosure } from "@nextui-org/react"
import ConditionModal from "../../modals/ConditionModal/ConditionModal"
import { PopUpContext } from "../../contexts/popUpContext"
import { conditionType } from "../../types/ConditionTypes"
import { v4 } from "uuid"
import EditNodeIcon from "../../icons/nodes/EditNodeIcon"
import NodeModal from "../../modals/NodeModal/NodeModal"
import { workspaceContext } from "../../contexts/workspaceContext"
import { flowContext } from "../../contexts/flowContext"

const DefaultNode = memo(({ data }: { data: NodeDataType }) => {
  const {
    onOpen: onConditionOpen,
    onClose: onConditionClose,
    isOpen: isConditionOpen,
  } = useDisclosure()
  const { onOpen: onNodeOpen, onClose: onNodeClose, isOpen: isNodeOpen } = useDisclosure()
  const { handleNodeFlags } = useContext(workspaceContext)
  // console.log({ data, flows })
  // useEffect(() => {
  //   console.log("111")
  // }, [flows])

  return (
    <>
      <div className='default_node'>
        {data.flags?.includes("start") && (
          <span className='-top-2 left-4 bg-green-500 absolute text-white text-xs font-medium rounded-small px-1.5 py-1.5 -z-20 transition-transform cursor-auto hover:-z-10 hover:-translate-y-4'>
            S
          </span>
        )}
        {data.flags?.includes("fallback") && (
          <span className='-top-2 left-7 bg-red-500 absolute text-white text-xs font-medium rounded-small px-1.5 py-1.5 -z-20 transition-transform cursor-auto hover:-z-10 hover:-translate-y-4'>
            F
          </span>
        )}
        <div className=' w-full flex justify-between items-center bg-node-header border-b border-border rounded-t-node px-6 py-4'>
          <div className='flex items-center'>
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
            <p className='font-medium text-medium'>{data.name}</p>
          </div>
          <button onClick={onNodeOpen}>
            <EditNodeIcon />
          </button>
        </div>
        <div className=' w-full flex flex-col items-center justify-center gap-2 p-2.5 '>
          <Response data={data} />
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
            onClick={() => {
              onConditionOpen()
            }}
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
      />
    </>
  )
})

export default DefaultNode
