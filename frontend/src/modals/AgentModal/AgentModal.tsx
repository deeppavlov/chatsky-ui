import { Input } from '@/UI/Input'
import { Select } from '@/UI/Select'
import { Textarea2 } from '@/UI/textarea'
import { CodeIcon } from '@radix-ui/react-icons'
import ReactCodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { Edge, useReactFlow } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Info, Settings, TrashIcon, X } from 'lucide-react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { flowContext } from '../../contexts/flowContext'
import { PopUpContext } from '../../contexts/popUpContext'
import AttentionIcon from '../../icons/AttentionIcon'
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
import { TextEditor } from './PromtEditor'

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
export interface IPromptBlock {
  value: string
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
  prompt,
  id = 'agent-modal',
}: ConditionModalProps) => {
  const { closePopUp } = useContext(PopUpContext)
  const { getNodes, updateNodeData } = useReactFlow<AppNode, Edge>()
  const { quietSaveFlows, flows } = useContext(flowContext)
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false)
  const [wordToInsert, setWordToInsert] = useState('')

  const codeEditorRef = useRef<ReactCodeMirrorRef>(null)

  const onCloseHandler = () => {
    closePopUp(id)
  }

  const arrVariables = [
    'ПЕРЕМЕННАЯ_1',
    'ПЕРЕМЕННАЯ_2',
    'ПЕРЕМЕННАЯ_3',
    'ПЕРЕМЕННАЯ_4',
  ]
  const arrTools = [
    'ИНСТРУМЕНТ_1',
    'ИНСТРУМЕНТ_2',
    'ИНСТРУМЕНТ_3',
    'ИНСТРУМЕНТ_4',
  ]

  const styleModal = 'rounded-l-none'

  const handlePromptBlockSelect = (block: IPromptBlock) => {
    const view = codeEditorRef.current?.view
    if (!view) return

    const formattedBlock = block.value.trim()

    const selection = view.state.selection.main
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: formattedBlock,
      },
      selection: { anchor: selection.from + formattedBlock.length },
    })
    view.focus()
  }

  const handleDragStart = (e: React.DragEvent, variable: string) => {
    setWordToInsert(variable)
    // e.dataTransfer.setData('text/plain', variable)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const view = codeEditorRef.current?.view
    if (!view) return

    console.log(wordToInsert)
    const selection = view.state.selection.main
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: wordToInsert,
      },
      selection: { anchor: selection.from + wordToInsert.length },
    })
    view.focus()
    setWordToInsert('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    //  const view = codeEditorRef.current?.view
    //  if (!view) return

    //  const text = wordToInsert
    //  const selection = view.state.selection.main
    //  view.dispatch({
    //    changes: {
    //      from: selection.from,
    //      to: selection.to,
    //      insert: text,
    //    },
    //    selection: { anchor: selection.from + text.length },
    //  })
    //  view.focus()
    //  setWordToInsert('')
  }

  return (
    <Modal
      data-tesid='condition-modal rounded-2xl'
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'
      data-testid='condition-modal'
      className={`flex ${isSlideMenuOpen ? 'rounded-r-none' : ''} `}
      isPadding={false}
    >
      <div className={`relative flex w-full bg-transparent p-6`}>
        <AnimatePresence mode='wait'>
          {isSlideMenuOpen && (
            <>
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: '100%' }}
                exit={{ x: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className='absolute right-0 top-0 z-[-1] h-full w-[17.5rem] overflow-y-auto rounded-r-2xl'
              >
                <div className='flex h-full'>
                  <div
                    className='flex-1 overflow-y-auto border-l-2 bg-background p-4'
                    style={{ borderColor: '#C9D2E4' }}
                  >
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>Входные переменные</h4>
                        <Button
                          variant='primary'
                          className='rounded-small'
                          onClick={() => setIsSlideMenuOpen(!isSlideMenuOpen)}
                        >
                          <X />
                        </Button>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <AttentionIcon stroke='green' />
                        </div>
                        <div className='text-xs'>
                          Для указания входных переменных используйте синтаксис:
                          название.
                        </div>
                      </div>

                      <div className='flex flex-col gap-[8px]'>
                        <div className='text-xs'>Переменные агента</div>

                        {arrVariables.map((variable) => (
                          <div
                            key={variable}
                            draggable
                            onDragStart={(e) => handleDragStart(e, variable)}
                            onClick={() =>
                              handlePromptBlockSelect({
                                value: ` ${variable} `,
                              })
                            }
                            className='w-fit bg-default px-1 py-0.5 text-xs hover:bg-default/80'
                          >
                            {variable}
                          </div>
                        ))}
                      </div>
                      <div className='flex flex-col gap-[8px]'>
                        <div className='text-xs'>Переменные инструментов</div>

                        {arrTools.map((tool) => (
                          <div
                            key={tool}
                            draggable
                            onDragStart={(e) => handleDragStart(e, tool)}
                            onClick={() =>
                              handlePromptBlockSelect({
                                value: ` ${tool} `,
                              })
                            }
                            className='w-fit bg-default px-1 py-0.5 text-xs hover:bg-default/80'
                          >
                            {tool}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className='relative z-10 flex-1'>
          <ModalHeader>
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
                  <button className='hover:bg-btn-accent-hover flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-btn-accent active:scale-95'>
                    <Settings width={18} height={18} />
                  </button>
                </div>
              </div>

              <div className='flex w-full flex-grow flex-col items-end gap-3'>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className='w-full'
                >
                  <TextEditor
                    codeEditorRef={codeEditorRef}
                    value={prompt || ''}
                    placeholder='Введите текст'
                    autocompletionWords={[...arrVariables, ...arrTools]}
                    symbolAutocompletion='@'
                    onChange={() => {}}
                  />
                </div>
                <Button
                  variant='primary'
                  className='rounded-small bg-default font-semibold'
                  onClick={() => setIsSlideMenuOpen(!isSlideMenuOpen)}
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
              <Button className='rounded-medium hover:bg-red-500' isIconOnly>
                <TrashIcon />
              </Button>
            </div>
            <div className='flex items-end gap-2'>
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
