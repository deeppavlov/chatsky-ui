import { PopUpContext } from '@/contexts/popUpContext'
import ConfirmationModal from '@/modals/ConfirmationModal/ConfirmationModal'
import { LinkNodeDataType } from '@/types/NodeTypes'
import classNames from 'classnames'
import { Edit } from 'lucide-react'
import React, { useCallback, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import TrashIcon from '../../icons/TrashIcon'
import { FlowType } from '../../types/FlowTypes'

interface Link {
  target_flow: string
  target_node: string
  id: string
  name: string
}

const getContent = (arrLink: Link[]): string => {
  if (arrLink.length >= 2) {
    return 'This flow is linked to other flows.'
  }
  if (arrLink.length === 1) {
    return `This flow is linked to ${arrLink[0].name}.`
  }

  return 'This flow contains part of <Project name> dialog.'
}

const FlowCard = ({ flow }: { flow: FlowType }) => {
  const [hover, setHover] = useState(false)
  const { deleteFlow, flows } = useContext(flowContext)
  const navigate = useNavigate()
  const { openPopUp } = useContext(PopUpContext)

  const deleteFlowHandler = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (flow.name !== 'Global') deleteFlow(flow)
    },
    [deleteFlow, flow],
  )

  const myFlows = flows.filter((el) => el.name !== 'Global')

  const arrLinks = myFlows.map((el: FlowType) => {
    const name = el.name
    const links = el.data.nodes
      .filter((el) => el.type === 'link_node')
      .map((link) => {
        const { target_flow, target_node } = (link.data as LinkNodeDataType)
          .transition
        const id = el.id

        return { target_flow, target_node, id, name }
      })

    return { links }
  })

  const result = arrLinks
    .map((el) => {
      const res = el.links.filter((link) => link.target_flow === flow.name)
      return res
    })
    .flat()

  const handleDeleteConfirmation = () =>
    openPopUp(
      <ConfirmationModal
        id='delete-flow'
        title={`Do you want to delete ${flow.name}?`}
        bodyText={getContent(result)}
        onAction={(e) => deleteFlowHandler(e)}
      />,
      'delete-flow',
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
            <p className='truncate text-lg font-medium'>{flow.name}</p>
          </div>
          <button
            data-testid={`${flow.name}-delete-btn`}
            onClick={handleDeleteConfirmation}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent transition hover:border-border hover:bg-f-card-trash ${
              !hover && 'opacity-0'
            } absolute right-4 top-4 z-10`}
          >
            <TrashIcon className='h-5 w-5 stroke-foreground' />
          </button>
        </div>
        <p className='line-clamp-2 overflow-hidden text-ellipsis whitespace-pre-wrap break-words'>
          {flow.description}
        </p>
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
