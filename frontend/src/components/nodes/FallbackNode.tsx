import { memo } from "react"
import { NodeDataType } from "../../types/NodeTypes"
import { Handle, Position } from "reactflow"
import "reactflow/dist/style.css"
import "../../index.css"
import Response from "./responses/Response"

const FallbackNode = memo(({ data }: { data: NodeDataType }) => {
  return (
    <div className='default_node'>
      <div className=' w-full flex justify-start items-center bg-node-header border-b border-border rounded-t-node px-6 py-4'>
        <Handle
          isConnectableEnd
          position={Position.Left}
          type='target'
          style={{
            background: "var(--background)",
            borderWidth: "2px",
            borderColor: "var(--status-red)",
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
      <div className=' w-full flex flex-col items-center justify-center gap-2 p-2.5 '>
        <Response data={data} />
        {/* <div className='w-full flex flex-col gap-2'>
          {data.conditions.map((condition) => (
            <Condition
              key={condition}
              data={data}
              condition={condition}
            />
          ))}
        </div> */}
      </div>
    </div>
  )
})

export default FallbackNode
