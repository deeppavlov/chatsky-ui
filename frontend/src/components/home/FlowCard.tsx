import classNames from 'classnames'
import { Edit } from 'lucide-react'
import React, { useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import TrashIcon from '../../icons/TrashIcon'
import { FlowType } from '../../types/FlowTypes'

const FlowCard = ({ flow }: { flow: FlowType }) => {
  const [hover, setHover] = useState(false)
  const { deleteFlow } = useContext(flowContext)
  const navigate = useNavigate()

  const deleteFlowHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (flow.name !== 'Global') deleteFlow(flow)
    },
    [deleteFlow, flow],
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className='flow-card'
      data-testid={'flow-card'}
      key={flow.name}
    >
      <div>
        <div className='flex min-h-9 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span
              style={{
                backgroundColor: flow.color ?? '#999',
              }}
              className='block h-5 w-5 rounded-full'
            ></span>
            <p className='text-lg font-medium'>{flow.name}</p>
          </div>
          <button
            data-testid={`${flow.name}-delete-btn`}
            onClick={deleteFlowHandler}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent transition hover:border-border hover:bg-f-card-trash ${
              !hover && 'opacity-0'
            } absolute right-4 top-4 z-10`}
          >
            <TrashIcon className='h-5 w-5 stroke-foreground' />
          </button>
        </div>
        <p className=''>{flow.description}</p>
      </div>
      <div className='flex w-full items-center justify-end'>
        <button
          data-testid={`${flow.name}-edit-btn`}
          className={classNames(
            'flex items-center gap-2 rounded-md border border-border bg-bg-secondary px-2 py-1 hover:border-node-selected hover:bg-node-header',
            flow.name === 'Global' && 'hidden',
          )}
          onClick={() => {
            if (flow.name !== 'Global') navigate(`/app/flow/${flow.name}`)
          }}
        >
          <Edit className='h-5 w-5' />
          Edit flow
        </button>
      </div>
    </div>
  )
}

export default FlowCard
