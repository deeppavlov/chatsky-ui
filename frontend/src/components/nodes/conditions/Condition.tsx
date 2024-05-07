import { Handle, Position, useReactFlow } from "reactflow"
import { NodeComponentConditionType } from "../../../types/NodeTypes"
import { UserConditionIcon } from "../../../icons/nodes/conditions/UserConditionIcon"
import { useEffect, useState } from "react"
import { conditionLabelType } from "../../../types/ConditionTypes"
import * as ContextMenu from "@radix-ui/react-context-menu"
import { CONDITION_LABELS } from "../../../consts"
import ConditionModal from "../../../modals/ConditionModal/ConditionModal"
import { useDisclosure } from "@nextui-org/react"

const Condition = ({ data, condition }: NodeComponentConditionType) => {
  const [label, setLabel] = useState<conditionLabelType>(condition.data.transition_type ?? "manual")
  const {
    onOpen: onConditionOpen,
    onClose: onConditionClose,
    isOpen: isConditionOpen,
  } = useDisclosure()

  const edges = useReactFlow().getEdges()
  console.log(edges, condition)

  useEffect(() => {
    condition.data.transition_type = label
  }, [label])

  return (
    <ContextMenu.Root>
      <div className='w-full relative flex items-center justify-start text-start'>
        <div onClick={onConditionOpen} className='w-full bg-node-header py-2.5 px-4 rounded-lg border-[0.5px] border-border flex items-center justify-between gap-2 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <UserConditionIcon
              className='w-5 h-5'
              fill='var(--condition-default)'
            />
            {condition.name}
          </div>
          <p className='mr-4 text-xs'>{condition.data.priority}</p>
        </div>
        {label === "manual" && (
          <ContextMenu.Trigger>
            <Handle
              isConnectableStart
              isConnectable={
                edges.filter((edge) => edge.sourceHandle === condition.id).length === 0
              }
              position={Position.Right}
              type='source'
              id={`${condition.id}`}
              style={{
                background: "var(--background)",
                borderWidth: "2px",
                borderColor: "var(--condition-output-handle)",
                borderStyle: "solid",
                width: "0.7rem",
                height: "0.7rem",
                right: "-0.95rem",
                zIndex: 10,
              }}
            />
          </ContextMenu.Trigger>
        )}
        {label !== "manual" && (
          <ContextMenu.Trigger asChild>
            <div className='absolute left-[101%] font-medium bg-background border-2 text-sm border-condition-output-handle rounded-lg px-2 py-0'>
              {label}
            </div>
          </ContextMenu.Trigger>
        )}
      </div>
      <ContextMenu.Portal>
        <ContextMenu.Content className='bg-background p-1 w-36 rounded-xl border border-border'>
          {Object.values(CONDITION_LABELS).map((item) => (
            <ContextMenu.Item
              key={item}
              onClick={() => setLabel(item)}
              className='text-sm cursor-pointer py-1 px-2 hover:bg-border rounded-lg'>
              {item}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
      <ConditionModal
        data={data}
        isOpen={isConditionOpen}
        onClose={onConditionClose}
        condition={condition}
      />
    </ContextMenu.Root>
  )
}

export default Condition
