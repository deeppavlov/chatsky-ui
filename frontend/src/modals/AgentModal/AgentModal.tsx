import { Input } from '@/UI/Input'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { Select } from '@/UI/Select'
import { Tooltip } from '@/UI/Tooltip'
import { CodeIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Info, Settings, TrashIcon } from 'lucide-react'
import { useContext } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import EditPenIcon from '../../icons/EditPenIcon'
import { conditionType } from '../../types/ConditionTypes'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import { Button } from '../../UI/button'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'
import PromptModal from './PromptModal'

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
  prompt?: string
  is_create?: boolean
}

export type ValidateErrorType = {
  status: boolean
  reason: string
}

const AgentModal = ({
  data,
  condition, // agent
  prompt,
  id = 'agent-modal',
}: ConditionModalProps) => {
  const { closePopUp, openPopUp } = useContext(PopUpContext)

  const onCloseHandler = () => {
    closePopUp(id)
  }

  const openPromptModal = () =>
    openPopUp(
      <PromptModal
        prompt={prompt ?? ''}
        onClose={() => {
          closePopUp('promptRedactor')
        }}
      />,
      'promptRedactor',
    )

  return (
    <Modal
      data-tesid='condition-modal rounded-2xl'
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'
      data-testid='condition-modal'
      className='flex'
      isPadding={false}
    >
      <div className={`relative flex w-full bg-transparent p-6`}>
        <div className='relative z-10 flex-1'>
          <ModalHeader>
            <div className='flex items-center gap-2 font-semibold'>
              <EditPenIcon />
              Параметры агента
            </div>
          </ModalHeader>
          <ModalBody className='flex !overflow-visible'>
            <ScrolledContainer scrollbarOffset='-18px' scrollbarPadding='6px'>
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
                    <button className='hover:bg-btn-accent-hover flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-btn-accent active:scale-95'>
                      <Settings width={18} height={18} />
                    </button>
                  </div>
                </div>

                <div className='flex w-full flex-grow flex-col gap-4'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center justify-between gap-3'>
                      <span
                        className='h-6 whitespace-nowrap text-[12px] font-semibold'
                        id='agent-prompt'
                      >
                        Промпт агента
                      </span>

                      {false && ( // IF ERROR
                        <Tooltip
                          side='bottom'
                          align='end'
                          content={'error'}
                          classNames={{
                            trigger: 'h-6 w-6',
                          }}
                        >
                          <ExclamationTriangleIcon
                            className='h-4 w-4'
                            color='var(--danger)'
                          />
                        </Tooltip>
                      )}
                    </div>
                    <button
                      aria-labelledby='agent-prompt'
                      onClick={openPromptModal}
                      className='flex-start flex h-16 w-full justify-start rounded-lg border border-input-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-addition'
                    >
                      text
                    </button>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center justify-between gap-3'>
                      <span
                        className='h-6 whitespace-nowrap text-[12px] font-semibold'
                        id='agent-prompt'
                      >
                        Промпт инструмента 1
                      </span>

                      {false && ( // IF ERROR
                        <Tooltip
                          side='bottom'
                          align='end'
                          content={'error'}
                          classNames={{
                            trigger: 'h-6 w-6',
                          }}
                        >
                          <ExclamationTriangleIcon
                            className='h-4 w-4'
                            color='var(--danger)'
                          />
                        </Tooltip>
                      )}
                    </div>
                    <button
                      aria-labelledby='agent-prompt'
                      onClick={openPromptModal}
                      className='flex-start flex h-16 w-full justify-start rounded-lg border border-input-border bg-bg-secondary px-3.5 py-2.5 text-sm text-text-addition'
                    >
                      text
                    </button>
                  </div>
                </div>

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
                <Input
                  type='number'
                  label='Индекс памяти контекста'
                  placeholder='Введите целое число'
                />

                <div className='flex items-start gap-1 px-1'>
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
            </ScrolledContainer>
          </ModalBody>

          <ModalFooter className='flex items-center justify-between'>
            <div className='flex items-center justify-start gap-2'>
              <Button
                variant='secondary'
                className='rounded-medium hover:bg-red-500'
                isIconOnly
              >
                <TrashIcon />
              </Button>
            </div>
            <div className='flex items-end gap-2'>
              <div className='flex gap-2'>
                <Button
                  data-testid='test-condition-button'
                  variant='primary'
                  className='rounded-small bg-btn-accent'
                >
                  <CodeIcon className='h-5 w-5' />
                  Посмотреть код
                </Button>
              </div>
              <Button
                data-testid='save-condition-button'
                variant='default'
                className='rounded-small'
              >
                Сохранить
              </Button>
            </div>
          </ModalFooter>
        </div>
      </div>
    </Modal>
  )
}

export default AgentModal
