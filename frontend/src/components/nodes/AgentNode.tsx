import { Button, Tooltip, useDisclosure } from '@nextui-org/react'
import { Handle, Position } from '@xyflow/react'
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
import ConditionModal from '../../modals/ConditionModal/ConditionModal'
import NodeModal from '../../modals/NodeModal/NodeModal'
import ResponseModal from '../../modals/ResponseModal/ResponseModal'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import Select from '../../UI/Select'
import { Textarea2 } from '../../UI/textarea'
// import { Button } from '../../UI/button'
import Condition from './conditions/Condition'
import Response from './responses/Response'

const AgentNode = memo(({ data }: { data: DefaultNodeDataType }) => {
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
      <div id={data.id} data-testid={data.id} className='agent_node'>
        <div className='custom-drag-handle flex h-auto w-full items-center justify-between gap-[8px] rounded-t-node border-b border-border bg-node-header p-3'>
          <div className='flex items-center'>
            <Handle
              data-testid={`${data.id}-input-handle`}
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
                top: '1.6rem',
                left: '0rem',
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
        <div className='flex gap-2 px-3 py-2'>
          <div className='flex w-full flex-col gap-2'>
            <div className='flex h-[28px] items-center justify-between gap-2'>
              <div className='w-[82px] text-left'>
                <p className='whitespace-nowrap text-xs'>Модель</p>
              </div>

              <div className='flex w-[166px] items-center'>
                <Select
                  className='h-[28px] items-end text-xs'
                  defaultValue='GPT-4.1 mini'
                  items={[
                    { key: '1', value: 'GPT-4.1 mini' },
                    { key: '2', value: 'GPT-4.1' },
                    { key: '3', value: 'YandexGPT 5' },
                    { key: '4', value: 'YandexGPT 4' },
                    { key: '5', value: 'YandexGPT 3' },
                  ]}
                />
                <Button className='min-w-0 px-[6px]' variant='light' isIconOnly>
                  <SquareArrowOutUpRight width={16} height={16} />
                </Button>
              </div>
            </div>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='w-[82px] text-left'>
                <p className='text-top whitespace-nowrap text-xs'>Промпт</p>
              </div>
              <div className='flex items-center'>
                <div
                  className='font-inter w-[166px] h-[46px] overflow-hidden text-ellipsis rounded-xl border border-gray-300 px-2 py-1 text-left text-xs'
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    whiteSpace: 'normal',
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontWeight: '400',
                  }}
                >
                  Ты агент-специалист по расчету зарплаты сотрудников компании.
                  Пользователь загружает таблицу зарплат сотрудника и выполняет
                  запрос. ПРИМЕР ЗАПРОСА: "Сравни тренды зарплат сотрудников
                  компании N за последний квартал с зарплатами за
                  соответствующий квартал прошлого года. Оцени этот показатель
                  со средним значени
                </div>
              </div>
            </div>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='w-[82px] text-left'>
                <p className='text-top overflow-hidden text-ellipsis whitespace-nowrap text-xs'>
                  Индекс памяти
                </p>
              </div>
              <div className='flex items-center'>
                <input
                  className='h-[28px] w-[166px] overflow-hidden text-ellipsis rounded-xl border border-gray-300 px-2 py-1 text-left'
                  type='number'
                />
              </div>
            </div>
            <div className='flex w-auto items-center justify-between gap-2'>
              <div className='w-[82px] text-left'>
                <p className='text-top overflow-hidden text-ellipsis whitespace-nowrap text-xs'>
                  Тип политики выбора инструментов
                </p>
              </div>
              <div className='flex items-center'>
                <Select
                  className='h-[28px] w-[165px] items-end text-xs'
                  defaultValue='Оптимизированный'
                  items={[
                    { key: '1', value: 'Оптимизированный' },
                    { key: '2', value: 'Полный' },
                    { key: '3', value: 'Полный с памятью' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2 border-t border-border px-3 py-2 text-left'>
          <Handle
            data-testid={`${data.id}-input-handle`}
            isConnectableEnd
            position={Position.Right}
            type='target'
            style={{
              background: 'var(--background)',
              borderWidth: '2px',
              borderColor: 'var(--condition-input-handle)',
              borderStyle: 'solid',
              width: '0.7rem',
              height: '0.7rem',
              top: '15.6rem',
              left: '-0.6rem',
              zIndex: 10,
            }}
          />
          <div className='text-xs font-medium'> Инструменты</div>
          <div className='text-xs text-gray-500'>
            Подключите необходимые инструменты с помощью стрелок.
          </div>
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

export default AgentNode
