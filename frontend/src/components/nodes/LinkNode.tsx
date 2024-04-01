import React, { memo, useContext, useMemo } from "react"
import { NodeDataType } from "../../types/NodeTypes"
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

const LinkNode = memo(({ data }: { data: NodeDataType }) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const { openPopUp } = useContext(PopUpContext)

  const new_condition = useMemo<conditionType>(
    () => ({
      id: data.name + "_" + v4(),
      name: "New Condition",
      type: "custom",
      data: {
        prompt: "",
        api_key: "",
        action: "",
      },
    }),
    [data.name, isOpen]
  )

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
