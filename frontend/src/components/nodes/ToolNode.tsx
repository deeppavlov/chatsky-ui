import { Button, Tooltip, useDisclosure } from '@nextui-org/react'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import classNames from 'classnames'
import { PlusIcon, SquareArrowOutUpRight } from 'lucide-react'
import { memo, useContext, useMemo, useState } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import EditNodeIcon from '../../icons/nodes/EditNodeIcon'
import FallbackNodeIcon from '../../icons/nodes/FallbackNodeIcon'
import GlobalNodeIcon from '../../icons/nodes/GlobalNodeIcon'
import LocalNodeIcon from '../../icons/nodes/LocalNodeIcon'
import StartNodeIcon from '../../icons/nodes/StartNodeIcon'
import '../../index.css'
import { Input } from '@/UI/Input'
import * as ContextMenu from '@radix-ui/react-context-menu'
import ConditionModal from '../../modals/ConditionModal/ConditionModal'
import NodeModal from '../../modals/NodeModal/NodeModal'
import ResponseModal from '../../modals/ResponseModal/ResponseModal'
import { DefaultToolDataType } from '../../types/NodeTypes'
import Select from '../../UI/Select'
import { Textarea2 } from '../../UI/textarea'
// import { Button } from '../../UI/button'
import Condition from './conditions/Condition'
import Response from './responses/Response'

const ToolNode = memo(({ data }: { data: DefaultToolDataType }) => {
  const { openPopUp } = useContext(PopUpContext)

  const [nodeDataState, setNodeDataState] = useState<DefaultToolDataType>(data)

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

  // const onConditionModalOpen = () => {
  //   openPopUp(
  //     <ConditionModal id='condition-modal' data={data} is_create />,
  //     'condition-modal',
  //   )
  // }

  // const validate_node = useMemo(
  //   () => data.response?.data.length && data.conditions?.length,
  //   [data.conditions?.length, data.response?.data.length],
  // )

  return (
    <>
      <div id={data.id} data-testid={data.id} className='agent_node'>
        <div className='custom-drag-handle flex h-auto w-full items-center justify-between gap-[8px] rounded-t-node border-b border-border bg-node-header p-3'>
          <div className='flex items-center'>
            <Handle
              data-testid={`${data.id}-input-handle`}
              isConnectableStart
              position={Position.Right}
              type='source'
              style={{
                background: 'var(--background)',
                borderWidth: '2px',
                borderColor: 'var(--condition-input-handle)',
                borderStyle: 'solid',
                width: '0.7rem',
                height: '0.7rem',
                top: '1.6rem',
                zIndex: 10,
              }}
            />

            <p
              className='flex w-[218px] items-center gap-1 truncate text-[14px] font-medium'
              style={{ textAlign: 'left' }}
            >
              {data.name}
            </p>
          </div>
          <div className='flex items-center justify-end gap-1'>
            <Button
              className='h-4 min-h-0 w-4 min-w-0 p-0'
              variant='light'
              isIconOnly
              onClick={onNodeOpen}
              size='sm'
            >
              <EditNodeIcon />
            </Button>
          </div>
        </div>

        <div className='flex w-full flex-col gap-2 border-t border-border px-3 py-2 text-left'>
          <div className='text-xs font-medium'> Инструменты</div>
          <div className='text-xs text-gray-500'>
            Подключите необходимые инструменты с помощью стрелок.
          </div>
        </div>
      </div>

      {/* <NodeModal
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
      /> */}
    </>
  )
})

export default ToolNode
