import { Handle, Position } from "reactflow"
import { NodeComponentConditionType } from "../../../types/NodeTypes"
import { UserConditionIcon } from "../../../icons/nodes/conditions/UserConditionIcon"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Condition = ({ data, condition }: NodeComponentConditionType) => {
  return (
    <div className='w-full relative flex items-center justify-start text-start'>
      <p className='w-full bg-node-header py-2.5 px-4 rounded-lg border-[0.5px] border-border flex items-center justify-start gap-2'>
        <UserConditionIcon className="w-5 h-5" fill='var(--condition-default)' />
        {condition.name}
      </p>
      <Handle
        isConnectableStart
        position={Position.Right}
        type='source'
        id={`condition-${condition.id}`}
        style={{
          background: "var(--background)",
          borderWidth: "2px",
          borderColor: "var(--condition-output-handle)",
          borderStyle: 'solid',
          width: "0.7rem",
          height: "0.7rem",
          right: "-0.95rem",
          zIndex: 10,
        }}
      />
    </div>
  )
}

export default Condition
