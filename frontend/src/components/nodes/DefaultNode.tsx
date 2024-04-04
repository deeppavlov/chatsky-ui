import React, { memo, useContext, useMemo } from "react"
import { NodeDataType, NodeType } from "../../types/NodeTypes"
import { Handle, Position } from "reactflow"
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

const DefaultNode = memo(({ data }: { data: NodeDataType }) => {
  const {
    onOpen: onConditionOpen,
    onClose: onConditionClose,
    isOpen: isConditionOpen,
  } = useDisclosure()
  const { onOpen: onNodeOpen, onClose: onNodeClose, isOpen: isNodeOpen } = useDisclosure()

  const new_condition = useMemo<conditionType>(
    () => ({
      id: data.name + "_" + v4(),
      name: "New Condition",
      type: "llm",
      data: {
        priority: 1,
        prompt: "",
        api_key: "",
        action: "",
        model_name: "",
      },
    }),
    [data.name, isConditionOpen]
  )

  return (
    <>
      <div className='default_node'>
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
        condition={new_condition}
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
