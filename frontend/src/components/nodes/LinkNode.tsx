import { memo } from "react"
import { Handle, Position } from "reactflow"
import "reactflow/dist/style.css"
import "../../index.css"
import { NodeDataType } from "../../types/NodeTypes"

const LinkNode = memo(({ data }: { data: NodeDataType }) => {
  // const { onOpen, onClose, isOpen } = useDisclosure()
  // const { openPopUp } = useContext(PopUpContext)

  return (
    <>
      <div className='default_node'>
        <div className=' w-full flex justify-start items-center bg-node border-b border-border rounded-node px-6 py-4'>
          <Handle
            isConnectableEnd
            position={Position.Left}
            type='target'
            style={{
              background: "var(--background)",
              borderWidth: "2px",
              borderColor: "var(--condition-link-input)",
              borderStyle: "solid",
              width: "0.7rem",
              height: "0.7rem",
              top: "1.875rem",
              left: "-0.335rem",
              zIndex: 10,
            }}
          />
          <p className='font-medium text-medium'> {data.name} </p>
        </div>
      </div>
    </>
  )
})

export default LinkNode
