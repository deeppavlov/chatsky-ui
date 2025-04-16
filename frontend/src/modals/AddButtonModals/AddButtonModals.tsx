import ButtonConditionIcon from '@/icons/nodes/conditions/ButtonConditionIcon'
import { Button, Input, Radio, RadioGroup } from '@nextui-org/react'
import { Edge, useReactFlow } from '@xyflow/react'
import { ArrowUp, Paperclip, Plus, Smile } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import AttentionIcon from '../../icons/AttentionIcon'
import BackIcon from '../../icons/BackIcon'
import { IButtonType } from '../../types/ConditionTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import { generateNewConditionBase } from '../../utils'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'

const chunk = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const RenderButtons = ({
  buttons,
  selected,
  columns,
}: {
  type: 'reply' | 'inline'
  buttons: IButtonType[]
  selected: string
  columns: number
}) => {
  const newArr = chunk(buttons, columns)

  return newArr.map((row, index) => {
    const curentColumns = row
      .map((button) => {
        if (selected === 'reply') {
          if (button.text === '') {
            return 0
          }
          return 1
        }

        if (selected === 'inline') {
          if (button.text === '') {
            return 0
          }
          return 1
        }
      })
      .filter((item) => item === 1).length

    const isFirst =
      index === 0 ? 'pt-[12px]' : index === newArr.length - 1 ? 'pb-[12px]' : ''

    return (
      <div
        className={`grid grid-cols-${curentColumns} gap-2 pl-[10px] ${selected === 'reply' ? 'pr-[35px]' : 'pr-[10px]'} ${isFirst} m-[4px]`}
        key={index}
      >
        {row.map((button, index) => {
          if (button.text === '') {
            return null
          }

          return (
            <button
              key={index}
              className={`$ flex h-[23px] items-center justify-center rounded-lg bg-background px-4 text-sm`}
            >
              {button.text}
            </button>
          )
        })}
      </div>
    )
  })
}

const RenderCell = ({
  selected,
  buttons,
  setButtons,
  type,
  columns,
  error,
  setError,
}: {
  buttons: IButtonType[]
  setButtons: (buttons: IButtonType[]) => void
  type: 'reply' | 'inline'
  columns: number
  selected: string

  error: {
    invalid: boolean
    id: number
  }[]
  setError: (error: { invalid: boolean; id: number }[]) => void
}) => {
  const key = type === 'inline' ? 'colback' : 'text'

  const getInputValue = (button: IButtonType, index: number) => {
    if (type === 'reply') {
      return button[key]
    }

    if (type === 'inline') {
      return button.colback
    }
  }

  return (
    <div className={`grid grid-cols-${columns > 5 ? 5 : columns} gap-2`}>
      {buttons.map((button, buttonIndex) => {
        const errorData = error.filter((item) => item.id === button.id)[0]

        const getError = () => {
          if (selected === 'reply' && type === 'reply') {
            return errorData?.invalid
          }

          if (selected === 'inline' && type === 'inline') {
            return errorData?.invalid
          }

          if (selected === 'inline' && type === 'reply') {
            return false
          }
        }

        return (
          <div key={buttonIndex}>
            <Input
              isInvalid={getError()}
              variant='bordered'
              placeholder={`Please fill in the field in button ${buttonIndex + 1}`}
              value={getInputValue(button, buttonIndex)}
              size='sm'
              onChange={(e) => {
                const newButtons = buttons.map((button, newButtonIndex) => {
                  if (buttonIndex === newButtonIndex) {
                    return { ...button, [key]: e.target.value }
                  }
                  return button
                })

                const newError = error.map((item) => {
                  if (item.id === button.id) {
                    return { invalid: false, id: item.id }
                  }
                  return item
                })

                setButtons(newButtons)
                setError(newError)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

const RenderTypeButtons = ({
  buttons,
  setButtons,
  type,
  columns,
  error,
  setError,
  selected,
}: {
  buttons: IButtonType[]
  setButtons: (buttons: IButtonType[]) => void
  type: 'reply' | 'inline'
  columns: number
  error: {
    invalid: boolean
    id: number
  }[]
  setError: (error: { invalid: boolean; id: number }[]) => void
  selected: string
}) => {
  if (type === 'reply') {
    return (
      <div className={`grid gap-2`}>
        <h3 className='mb-2 text-[12px] text-sm font-medium'>
          Enter display text for every button
        </h3>
        <RenderCell
          buttons={buttons}
          setButtons={setButtons}
          type={type}
          columns={columns}
          selected={selected}
          error={error}
          setError={setError}
        />
      </div>
    )
  }

  return (
    <>
      <div className={`grid gap-2`}>
        <h3 className='mb-2 text-[12px] text-sm font-medium'>
          Enter display text for every button
        </h3>
        <RenderCell
          buttons={buttons}
          setButtons={setButtons}
          type={'reply'}
          columns={columns}
          error={error}
          setError={setError}
          selected={selected}
        />
      </div>

      <div className={`grid gap-2`}>
        <h3 className='mb-2 text-[12px] text-sm font-medium'>
          Enter callback data for every button
        </h3>
        <div className='flex w-full items-center gap-2'>
          <AttentionIcon width={34} stroke='#009973' />
          <div className='text-[12px] text-sm font-medium'>
            Buttons are only available for Telegram interface. If you are
            planning to launch your bot on different platforms, please select
            another condition type.
          </div>
        </div>
        <RenderCell
          buttons={buttons}
          setButtons={setButtons}
          type={'inline'}
          columns={columns}
          selected={selected}
          error={error}
          setError={setError}
        />
      </div>
    </>
  )
}

const AddButtonModals = ({
  data,
  isOpen,
  onClose,
}: {
  data: DefaultNodeDataType
  isOpen: boolean
  onClose: () => void
}) => {
  const { updateNodeData, getNode } = useReactFlow<AppNode, Edge>()
  const node = getNode(data.id)

  const initRows = (node?.data as DefaultNodeDataType)?.buttonsData?.rows ?? 2
  const initColumns =
    (node?.data as DefaultNodeDataType)?.buttonsData?.columns ?? 2

  const [rows, setRows] = useState(initRows || 2)
  const [columns, setColumns] = useState(initColumns || 2)

  const initButtons: IButtonType[] =
    (node?.data as DefaultNodeDataType)?.buttonsData?.buttons ??
    Array.from({ length: rows * columns }, (_, index) => ({
      text: '',
      colback: '',
      type: selected,
      id: index,
    }))

  const initSelected: string = initButtons?.[0]?.type ?? 'reply'
  const [selected, setSelected] = useState<string>(initSelected)

  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()

  const [buttons, setButtons] = useState<IButtonType[]>(initButtons)

  const [error, setError] = useState<
    {
      invalid: boolean
      id: number
    }[]
  >([])

  useEffect(() => {
    const newButtons = buttons.map((button, index) => {
      if (selected === 'reply') {
        return { ...button, text: `` }
      }
      return { ...button, text: `button ${index + 1}`, colback: '' }
    })
    setButtons(newButtons)
  }, [selected])

  useEffect(() => {
    const newButtons = Array.from({ length: rows * columns }, (_, index) => ({
      text: '',
      colback: '',
      type: selected,
      id: index,
    }))

    const currentButtonsLength = buttons.length

    if (newButtons.length > 25) {
      setButtons(
        newButtons
          .slice(0, 25)
          .map((button) => ({ ...button, type: selected })),
      )
      return
    }

    if (currentButtonsLength > rows * columns) {
      setButtons(
        buttons
          .slice(0, rows * columns)
          .map((button) => ({ ...button, type: selected })),
      )
      return
    }

    setButtons([
      ...buttons,
      ...newButtons.slice(currentButtonsLength).map((button) => ({
        ...button,
        type: selected,
      })),
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns])

  return (
    <Modal
      className='flex min-h-[584px] flex-col'
      size='3xl'
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex flex-col gap-[24px]'>
        <ModalHeader className='flex items-center gap-4 pb-[0px]'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-background p-1'>
              <Button className='h-unit-10 min-w-unit-0 bg-transparent pl-[0px] pr-[0px]'>
                <BackIcon
                  className='cursor-pointer rounded-lg border-border bg-bg-secondary bg-foreground'
                  stroke='var(--background)'
                />
              </Button>
            </div>

            <ButtonConditionIcon className='size-6' />
            <div>Add buttons</div>
          </div>
        </ModalHeader>

        <ModalBody className='flex flex-1 flex-col gap-[24px] py-2'>
          <div className='flex w-full items-center gap-2'>
            <AttentionIcon width={34} stroke='#3300FF' />
            <div className='text-[12px] text-sm font-medium'>
              Buttons are only available for Telegram interface. If you are
              planning to launch your bot on different platforms, please select
              another condition type.
            </div>
          </div>

          <div>
            <h3 className='mb-4 font-medium'>Select type</h3>
            <RadioGroup
              value={selected}
              onValueChange={(value) => {
                if (value === 'inline') {
                  setButtons(buttons.map((button) => ({ ...button, text: '' })))
                } else {
                  setButtons(
                    buttons.map((button) => ({ ...button, colback: '' })),
                  )
                }
                setSelected(value)
              }}
            >
              <div className='grid grid-cols-2 gap-4 pb-[8px]'>
                <div className='flex flex-col gap-4'>
                  <Radio value='reply'>Reply keyboard</Radio>
                </div>
                <div className='flex flex-col gap-4'>
                  <Radio value='inline'>Inline keyboard</Radio>
                </div>
              </div>
            </RadioGroup>
            {selected === 'inline' && (
              <div className='w-full rounded-lg border-1 border-border bg-chat'>
                <div className='ml-[12px] mr-[36px] mt-[16px] rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] bg-background p-[8px]'>
                  What do you like?
                </div>
                <div className='mt-[50px] flex items-center justify-between rounded-lg border-1 border-b border-border bg-background p-1'>
                  <Paperclip />

                  <p className='mr-auto opacity-30'>Enter message...</p>
                  <div className='flex items-center gap-0.5'>
                    <div className='relative flex items-center justify-center'>
                      <Smile className='hover:bg-accent h-max w-max rounded-lg p-1.5 transition' />

                      <div className='absolute bottom-12 right-0 z-10 origin-top-right'></div>
                    </div>

                    <ArrowUp size={28} strokeWidth={1.2} />
                  </div>
                </div>
                <RenderButtons
                  buttons={buttons}
                  type='reply'
                  selected={selected}
                  columns={columns}
                />
              </div>
            )}
            {selected === 'reply' && (
              <div className='w-full rounded-lg border-1 border-border bg-chat'>
                <div className='ml-[12px] mr-[36px] mt-[16px] rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] bg-background p-[8px]'>
                  What do you like?
                </div>
                <RenderButtons
                  buttons={buttons}
                  type='inline'
                  selected={selected}
                  columns={columns}
                />
                <div className='mt-[50px] flex items-center justify-between rounded-lg border-1 border-b border-border bg-background p-1'>
                  <Paperclip />

                  <p className='mr-auto opacity-30'>Enter message...</p>
                  <div className='flex items-center gap-0.5'>
                    <div className='relative flex items-center justify-center'>
                      <Smile className='hover:bg-accent h-max w-max rounded-lg p-1.5 transition' />

                      <div className='absolute bottom-12 right-0 z-10 origin-top-right'></div>
                    </div>

                    <ArrowUp size={28} strokeWidth={1.2} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className='mb-4 text-[12px] font-medium'>
              Enter numbers of columns and rows
            </h3>
            <div className='flex items-center gap-2'>
              <Input
                variant='bordered'
                min={1}
                type='number'
                value={String(columns)}
                className='w-16'
                size='sm'
                onChange={(e) => {
                  setColumns(Number(e.target.value))
                }}
                isInvalid={columns > 5}
              />
              <span>x</span>
              <Input
                variant='bordered'
                min={1}
                type='number'
                value={String(rows)}
                onChange={(e) => {
                  setRows(Number(e.target.value))
                }}
                className='w-16'
                size='sm'
                isInvalid={rows > 5}
              />
              <span
                className={`${
                  rows > 5 || columns > 5 ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                5 x 5 max
              </span>
            </div>
          </div>

          <RenderTypeButtons
            buttons={buttons}
            setButtons={setButtons}
            type={selected as 'inline' | 'reply'}
            columns={columns}
            error={error}
            setError={setError}
            selected={selected}
          />
        </ModalBody>

        <ModalFooter className='flex justify-between'>
          <div className='flex gap-2'>
            <Button isIconOnly className='rounded-full text-[18px]'>
              ?
            </Button>
          </div>
          <Button
            isDisabled={rows > 5 || columns > 5 || buttons.length === 0}
            className='ml-auto'
            onClick={() => {
              const validate = buttons.flatMap((button) => {
                if (button.type === 'reply') {
                  if (button.text === '') {
                    return {
                      invalid: true,
                      id: button.id,
                    }
                  }
                }

                if (selected === 'inline') {
                  if (button.colback === '') {
                    return {
                      invalid: true,
                      id: button.id,
                    }
                  }
                }
                return []
              })

              const isValidate = validate.map((button) => button?.invalid)

              if (isValidate.includes(true)) {
                setError(validate)
                return
              }

              const arr = flows
                .filter((flow) => flow.name !== 'Global')
                .map((flow) => {
                  return {
                    name: flow.name,
                    collection: flow.data.nodes
                      .filter((node) => node.type === 'default_node')
                      .map((node) =>
                        (node.data as DefaultNodeDataType).conditions.map(
                          (condition) => condition.name,
                        ),
                      ),
                  }
                })

              const allNameCondidionFlows = arr
                .flatMap((flow) => {
                  return flow.collection
                })
                .flat()

              const cache: string[] = []

              const newConditions = buttons.map((button) => {
                const iterGenName = (count: number = 1): string => {
                  const nameFlow =
                    (flowId?.length ?? 0 >= 15) ? flowId?.slice(0, 15) : flowId

                  const newName = `${nameFlow}_button_${count}`

                  const isNotUnique = allNameCondidionFlows.includes(newName)

                  if (isNotUnique || cache.includes(newName)) {
                    return iterGenName((count += 1))
                  }
                  cache.push(newName)
                  return newName
                }

                const initConditionName = iterGenName()

                const condition = generateNewConditionBase(
                  initConditionName,
                  'button',
                )

                return {
                  ...condition,
                  type: 'button',
                  data: { ...condition.data, button },
                }
              })

              const newData = {
                ...node?.data,
                buttons: [],
                conditions: [
                  ...(node?.data as DefaultNodeDataType).conditions,
                  ...newConditions,
                ],
              }

              console.log(newData)
              updateNodeData(data.id, newData as DefaultNodeDataType)
              setButtons([])
              quietSaveFlows()
              onClose()
            }}
          >
            <Plus />
            Auto conditions
          </Button>
          <Button
            className='bg-foreground text-background'
            onClick={() => {
              updateNodeData(data.id, {
                ...node?.data,
                buttonsData: { buttons, rows, columns },
              })
              quietSaveFlows()
              onClose()
            }}
          >
            Save buttons
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}

export default AddButtonModals
