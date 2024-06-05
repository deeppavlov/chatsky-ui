import { Edit, Trash2 } from "lucide-react"
import React, { useCallback, useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { flowContext } from "../../contexts/flowContext"
import { FlowType } from "../../types/FlowTypes"

const FlowCard = ({ flow }: { flow: FlowType }) => {
  const [hover, setHover] = useState(false)
  const { deleteFlow } = useContext(flowContext)
  const navigate = useNavigate()

  const deleteFlowHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      deleteFlow(flow)
    },
    [deleteFlow, flow]
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className='flow-card'
      data-testid={'flow-card'}
      key={flow.name}>
      <div>
        <div className='flex items-center justify-between min-h-9'>
          <div className='flex items-center gap-2'>
            <span
              style={{
                backgroundColor: flow.color ?? "#999",
              }}
              className='block w-5 h-5 rounded-full'></span>
            <p className='font-medium text-lg'>{flow.name}</p>
          </div>
          <button
            data-testid={`${flow.name}-delete-btn`}
            onClick={deleteFlowHandler}
            className={`w-8 h-8 rounded-lg border border-transparent flex items-center justify-center bg-transparent hover:bg-f-card-trash hover:border-border transition ${
              !hover && "opacity-0"
            } absolute top-4 right-4 z-10`}>
            <Trash2 className='stroke-foreground w-5 h-5' />
          </button>
        </div>
        <p className=''>{flow.description}</p>
      </div>
      <div className='w-full flex items-center justify-end'>
        <Link
          data-testid={`${flow.name}-edit-btn`}
          className='bg-bg-secondary border border-border hover:border-node-selected hover:bg-node-header rounded-md py-1 px-2 flex items-center gap-2'
          to={`/app/flow/${flow.name}`}>
          <Edit className='w-5 h-5' />
          Edit flow
        </Link>
      </div>
    </div>
  )
}

export default FlowCard
