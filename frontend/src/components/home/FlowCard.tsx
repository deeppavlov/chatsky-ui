import { useDisclosure } from '@nextui-org/react'
import classNames from 'classnames'
import { Edit } from 'lucide-react'
import React, { useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import TrashIcon from '../../icons/TrashIcon'
import СonfirmationModal from '../../modals/СonfirmationModal/СonfirmationModal'
import { FlowType } from '../../types/FlowTypes'

const FlowCard = ({ flow }: { flow: FlowType }) => {
  const [hover, setHover] = useState(false)
  const { deleteFlow } = useContext(flowContext)
  const navigate = useNavigate()
  const { isOpen, onClose, onOpen } = useDisclosure()

  const deleteFlowHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (flow.name !== 'Global') deleteFlow(flow)
    },
    [deleteFlow, flow],
  )
  // flex w-full flex-col overflow-hidden whitespace-pre-wrap break-words
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className='flow-card'
      data-testid={'flow-card'}
      key={flow.name}
    >
      <div className='flex w-full flex-col overflow-hidden whitespace-pre-wrap break-words'>
        <div className='flex min-h-9 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span
              style={{
                backgroundColor: flow.color ?? '#999',
              }}
              className='block h-5 w-5 rounded-full'
            ></span>
            <p className='text-lg font-medium truncate'>{flow.name}</p>
          </div>
          <button
            data-testid={`${flow.name}-delete-btn`}
            onClick={onOpen}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent transition hover:border-border hover:bg-f-card-trash ${
              !hover && 'opacity-0'
            } absolute right-4 top-4 z-10`}
          >
            <TrashIcon className='h-5 w-5 stroke-foreground' />
          </button>
        </div>
        <p className='break-words whitespace-pre-wrap overflow-hidden text-ellipsis line-clamp-2'>{flow.description}</p>
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
      {isOpen && (
        <СonfirmationModal
          flow={flow}
          size={'sm'}
          isOpen={isOpen}
          onClose={onClose}
          onDelete={(e) => deleteFlowHandler(e)}
        />
      )}
    </div>
  )
}

export default FlowCard
