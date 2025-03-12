import { Button, useDisclosure } from '@nextui-org/react'
import { Handle, Position } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import classNames from 'classnames'
import { PlusIcon } from 'lucide-react'
import { memo, useContext, useMemo, useState } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import { workspaceContext } from '../../contexts/workspaceContext'
import EditNodeIcon from '../../icons/nodes/EditNodeIcon'
import FallbackNodeIcon from '../../icons/nodes/FallbackNodeIcon'
import GlobalNodeIcon from '../../icons/nodes/GlobalNodeIcon'
import LocalNodeIcon from '../../icons/nodes/LocalNodeIcon'
import StartNodeIcon from '../../icons/nodes/StartNodeIcon'
import '../../index.css'
import ConditionModal from '../../modals/ConditionModal/ConditionModal'
import NodeModal from '../../modals/NodeModal/NodeModal'
import ResponseModal from '../../modals/ResponseModal/ResponseModal'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import Condition from './conditions/Condition'
import Response from './responses/Response'

const DefaultNode = memo(({ data }: { data: DefaultNodeDataType }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedNode } = useContext(workspaceContext)
  const { openPopUp } = useContext(PopUpContext)

  const [nodeDataState, setNodeDataState] = useState<DefaultNodeDataType>(data)

  const {
    onOpen: onNodeOpen,
    onClose: onNodeClose,
    isOpen: isNodeOpen,
  } = useDisclosure()
  const {
    onOpen: onResponseOpen,
    onClose: onResponseClose,
    isOpen: isResponseOpen,
  } = useDisclosure()

  const onConditionModalOpen = () => {
    openPopUp(
      <ConditionModal id='condition-modal' data={data} is_create />,
      'condition-modal',
    )
  }

  const validate_node = useMemo(
    () => data.response?.data.length && data.conditions?.length,
    [data.conditions?.length, data.response?.data.length],
  )

  return (
    <>
      <div id={data.id} data-testid={data.id} className='default_node'>
        {data.flags?.includes('start') && (
          <span className='absolute -top-2 left-4 -z-20 cursor-auto rounded-small border border-[var(--node-start-label-bg)] bg-[var(--node-start-label-bg)] px-0.5 py-0.5 pb-4 text-xs font-medium text-white transition-transform hover:-z-10 hover:-translate-y-5'>
            <StartNodeIcon
              fill='var(--node-start-label-fg)'
              stroke='var(--node-start-label-fg)'
            />
          </span>
        )}
        {data.flags?.includes('fallback') && (
          <span className='absolute -top-2 left-14 -z-20 cursor-auto rounded-small border border-[var(--node-fallback-label-bg)] bg-[var(--node-fallback-label-bg)] px-0.5 py-0.5 pb-4 text-xs font-medium text-white transition-transform hover:-z-10 hover:-translate-y-5'>
            <FallbackNodeIcon
              fill='var(--node-fallback-label-fg)'
              stroke='var(--node-fallback-label-fg)'
            />
          </span>
        )}
        <div className='custom-drag-handle flex w-full items-center justify-between rounded-t-node border-b border-border bg-node-header py-2 pl-6 pr-4'>
          <div className='flex items-center'>
            {!data.id.includes('LOCAL_NODE') &&
              !data.id.includes('GLOBAL_NODE') && (
                <Handle
                  isConnectableEnd
                  position={Position.Left}
                  type='target'
                  style={{
                    background: 'var(--background)',
                    borderWidth: '2px',
                    borderColor: 'var(--condition-input-handle)',
                    borderStyle: 'solid',
                    width: '0.7rem',
                    height: '0.7rem',
                    top: '1.875rem',
                    left: '0rem',
                    zIndex: 10,
                  }}
                />
              )}
            <p className='flex items-center gap-1 text-medium font-medium'>
              {data.id.includes('LOCAL_NODE') && <LocalNodeIcon />}
              {data.id.includes('GLOBAL_NODE') && <GlobalNodeIcon />}
              {data.name}
            </p>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <Button
              className='h-10 min-h-0 w-10 min-w-0 p-0'
              variant='light'
              isIconOnly
              onClick={onNodeOpen}
            >
              <EditNodeIcon />
            </Button>
            <span
              className={classNames(
                'flex h-5 w-5 rounded-full',
                validate_node ? 'bg-success' : 'bg-warning',
              )}
            />
          </div>
        </div>
        <div className='flex w-full cursor-default flex-col items-center justify-center gap-2 p-2.5'>
          <div
            className='mb-1 flex w-full cursor-pointer items-center justify-start rounded-lg border border-border px-2 py-2 transition-colors hover:border-node-selected'
            onClick={onResponseOpen}
          >
            <Response data={data} />
          </div>
          <div className='flex w-full flex-col gap-2'>
            {data.conditions?.map((condition) => (
              <Condition key={condition.id} data={data} condition={condition} />
            ))}
          </div>
          <button
            data-testid={`${data.name.toLowerCase().replace(' ', '')}-add-condition-btn`}
            onClick={onConditionModalOpen}
            className='add-cnd-btn'
          >
            <PlusIcon color='var(--condition-default)' />
          </button>
        </div>
      </div>
      <NodeModal
        data={data}
        isOpen={isNodeOpen}
        onClose={onNodeClose}
        onResponseModalOpen={onResponseOpen}
        nodeDataState={nodeDataState}
        setNodeDataState={setNodeDataState}
      />
      <ResponseModal
        data={nodeDataState}
        setData={setNodeDataState}
        isOpen={isResponseOpen}
        onClose={onResponseClose}
        response={nodeDataState.response!}
      />
    </>
  )
})

export default DefaultNode
