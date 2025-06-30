import { Button } from '@/UI/button'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { Info } from 'lucide-react'
import { useRef, useState } from 'react'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import { setPreview } from './editorPlugins'
import { TextEditor } from './PromtEditor'

interface IProps {
  prompt?: string
  onClose: () => void
}
export interface IPromptBlock {
  value: string
}

const arrVariables = [
  {
    name: 'СОТРУДНИК',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'КЛИЕНТ',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'ДАТА',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'ПЕРИОД',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'ПЕРЕМЕННАЯ',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'ЕЩЕ ПЕРЕМЕННАЯ',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
  {
    name: 'НУ ВЫ ПОНЯЛИ',
    description:
      'Переменная — это именованная область памяти, используемая для хранения данных, которые могут изменяться в процессе выполнения программы.',
  },
]

const PromptModal = ({ prompt, onClose }: IProps) => {
  const [wordToInsert, setWordToInsert] = useState('')
  const codeEditorRef = useRef<ReactCodeMirrorRef>(null)

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

    // Создаём кастомный элемент для drag image
    const dragIcon = document.createElement('div')
    dragIcon.style.position = 'absolute'
    dragIcon.style.top = '-1000px' // чтобы не видно на странице
    dragIcon.style.left = '-1000px'
    dragIcon.style.padding = '4px 10px'
    dragIcon.style.background = '#fff'
    dragIcon.style.border = '1px solid #ccc'
    dragIcon.style.borderRadius = '6px'
    dragIcon.style.fontSize = '15px'
    dragIcon.style.color = '#333'
    dragIcon.style.fontWeight = 'bold'
    dragIcon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
    dragIcon.innerHTML = `🔑 ${variable}` // Любой текст/иконка

    document.body.appendChild(dragIcon)

    // Устанавливаем кастомный drag image
    e.dataTransfer.setDragImage(dragIcon, 10, 10)

    // Удаляем элемент после небольшой задержки
    setTimeout(() => {
      document.body.removeChild(dragIcon)
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const view = codeEditorRef.current?.view
    if (!view) return

    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY })
    if (pos === null) return

    view.dispatch({
      effects: setPreview.of({ pos, text: wordToInsert }),
    })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    const view = codeEditorRef.current?.view
    if (!view) return

    view.dispatch({
      effects: setPreview.of(null),
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer) {
      e.dataTransfer.clearData()
    }

    const view = codeEditorRef.current?.view
    if (!view) return

    e
    view.dispatch({
      effects: setPreview.of(null),
    })

    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY })
    if (pos === null) return

    view.dispatch({
      changes: { from: pos, to: pos, insert: wordToInsert },
      selection: { anchor: pos + wordToInsert.length },
    })
    view.focus()
    setWordToInsert('')
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size='7xl'
      data-testid='condition-modal'
    >
      <ModalHeader>
        <div className='flex items-center gap-2 font-semibold'>
          Промпт агента
        </div>
      </ModalHeader>
      <ModalBody className='flex min-h-[480px] flex-col'>
        <div className='grid h-full w-full flex-grow grid-cols-9 gap-4'>
          <div className='col-span-2'>
            <div className='flex h-full flex-col gap-3'>
              <div className='w-full text-sm font-semibold'>
                Входные переменные
              </div>

              <div className='w-full'>
                <div className='flex items-start gap-2'>
                  <Info
                    color='#009973'
                    width={16}
                    height={16}
                    className='flex-shrink-0'
                  />
                  <span className='text-xs leading-[1.5] text-text'>
                    Для указания входных переменных используйте синтаксис:
                    <span className='text-[#3300FF]'>{' {название}'}</span>.
                  </span>
                </div>
              </div>

              <div className='flex w-full flex-grow flex-col gap-2 overflow-hidden'>
                <div className='text-xs font-semibold'>Переменные агента</div>
                <ScrolledContainer
                  className='h-0 flex-grow'
                  scrollbarOffset='4px'
                  scrollbarPadding='4px'
                >
                  <div className='flex flex-col gap-2'>
                    {arrVariables.map((variable) => (
                      <div
                        key={variable.name}
                        draggable
                        onDragStart={(e) => handleDragStart(e, variable.name)}
                        onClick={() =>
                          handlePromptBlockSelect({
                            value: ` ${variable.name} `,
                          })
                        }
                        className='h-[76px] w-full rounded-lg border border-border bg-[#8E9FB21A] px-3 pb-2 pt-1 text-xs hover:border-[#019FF8]'
                      >
                        <span className='text-xs/7'>{variable.name}</span>
                        <span className='line-clamp-2 text-xs/4 text-[#717E8B]'>
                          {variable.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrolledContainer>
              </div>
            </div>
          </div>
          <div className='col-span-7'>
            <div className='flex h-full flex-col gap-3'>
              <div className='w-full text-sm font-semibold'>Промпт</div>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  handleDragOver(e)
                }}
                onDragLeave={handleDragLeave}
                className='h-full w-full'
              >
                <TextEditor
                  codeEditorRef={codeEditorRef}
                  value={prompt || ''}
                  placeholder='Введите текст'
                  autocompletionWords={arrVariables.map(({ name }) => name)}
                  symbolAutocompletion='@'
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className='flex items-center justify-end'>
        <Button
          data-testid='save-condition-button'
          onClick={() => {}}
          className='rounded-lg bg-foreground text-background'
        >
          Сохранить
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default PromptModal
