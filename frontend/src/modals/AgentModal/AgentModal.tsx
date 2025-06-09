import { Input } from '@/UI/Input'
import { Select } from '@/UI/Select'
import { Textarea2 } from '@/UI/textarea'
import { CodeIcon } from '@radix-ui/react-icons'
import { Edge, useReactFlow } from '@xyflow/react'
import { ChevronRight, Info, Settings, TrashIcon } from 'lucide-react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { flowContext } from '../../contexts/flowContext'
import { PopUpContext } from '../../contexts/popUpContext'
import EditPenIcon from '../../icons/EditPenIcon'
import { conditionType, conditionTypeType } from '../../types/ConditionTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import { Button } from '../../UI/button'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'

export type ConditionModalContentType = {
  condition: conditionType
  setData: React.Dispatch<React.SetStateAction<conditionType>>
  ref?: { state: conditionType; setState: (data: conditionType) => void }
  error?: {
    group: boolean
    slot: boolean
    values: {
      group: string
      slot: string
    }
  }
  setError?: React.Dispatch<
    React.SetStateAction<{
      group: boolean
      slot: boolean
      values: {
        group: string
        slot: string
      }
    }>
  >
}

type ConditionModalProps = CustomModalProps & {
  data: DefaultNodeDataType
  condition?: conditionType // agent
  is_create?: boolean
}

type LintStatusType = {
  status: 'ok' | 'error'
  message: string
}

export type ValidateErrorType = {
  status: boolean
  reason: string
}

const AgentModal = ({
  data,
  condition, // agent
  id = 'agent-modal',
}: ConditionModalProps) => {
  const { closePopUp } = useContext(PopUpContext)
  const { getNodes, updateNodeData } = useReactFlow<AppNode, Edge>()
  const { quietSaveFlows, flows } = useContext(flowContext)

  const onCloseHandler = () => {
    closePopUp(id)
  }

  return (
    <Modal
      data-tesid='condition-modal'
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'
      data-testid='condition-modal'
      className='flex'
    >
      <div>
        <ModalHeader
        // showCloseButton={false}
        >
          <div className='flex items-center gap-2'>
            <EditPenIcon />
            Параметры агента
          </div>
        </ModalHeader>
        <ModalBody className='flex min-h-[480px]'>
          <div className='flex w-full flex-grow flex-col items-center justify-start gap-4'>
            <div className='grid w-full grid-cols-2 gap-4'>
              <div className='col-span-1'>
                <Input label='Имя агента' placeholder='Агент' />
              </div>
              <div className='col-span-1 flex items-end justify-start gap-2'>
                <Select
                  data-testid='llmResponse-config'
                  label='Конфигурация LLM'
                  placeholder='Выберите LLM конфигурацию'
                  onChange={() => {}}
                  defaultValue=''
                  items={[
                    { key: 'yagpt', value: 'YaGPT для агента' },
                    { key: 'gpt40', value: 'GPT-4o для агента' },
                    { key: 'cfg', value: 'еще один конфиг' },
                  ]}
                />
                <button
                  onClick={() => {}}
                  className='hover:bg-btn-accent-hover flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-btn-accent active:scale-95'
                >
                  <Settings width={18} height={18} />
                </button>
              </div>
            </div>

            <div className='flex w-full flex-grow flex-col items-end gap-3'>
              <Textarea2
                labelPlacement='outside'
                label='Промпт'
                className='w-full !border-1'
              />
              <Button
                variant='primary'
                className='rounded-small bg-default font-semibold'
              >
                Показать переменные
                <ChevronRight className='!h-4' />
              </Button>
            </div>
            <div className='flex w-full gap-4'>
              <Input
                type='number'
                label='Индекс памяти контекста'
                placeholder='Введите целое число'
              />
              <Select
                label='Тип политики выбора инструментов'
                placeholder='Выберите тип политики'
                onChange={() => {}}
                defaultValue=''
                items={[
                  { key: 'p1', value: 'Оптимизированный' },
                  { key: 'p2', value: 'Полный' },
                  { key: 'p3', value: 'Полный с памятью' },
                ]}
              />
            </div>

            <div
              id='context_memory_index_help'
              className='flex items-start gap-1 px-1'
            >
              <Info
                color='#009973'
                width={16}
                height={16}
                className='flex-shrink-0'
              />
              <span className='text-xs leading-[1.5] text-text'>
                Индекс памяти контекста - это число сообщений, которые агент
                будет запоминать для контекста. Если вам нужно, чтобы LLM
                запоминал весь контекст диалога, введите -1.
              </span>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className='flex items-center justify-between'>
          <div className='flex items-center justify-start gap-2'>
            <Button
              // onClick={handleConfirmDeleteOpen}
              className='rounded-medium hover:bg-red-500'
              isIconOnly
            >
              <TrashIcon />
            </Button>
          </div>
          <div className='flex items-end gap-2'>
            {
              <div className='flex gap-2'>
                <Button
                  data-testid='test-condition-button'
                  variant='primary'
                  className='rounded-small bg-default'
                >
                  <CodeIcon className='!w-[20px]' />
                  Посмотреть код
                </Button>
              </div>
            }
            <Button
              data-testid='save-condition-button'
              variant='default'
              // onClick={saveCondition}
              className='rounded-small'
            >
              Сохранить
            </Button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  )
}

export default AgentModal
