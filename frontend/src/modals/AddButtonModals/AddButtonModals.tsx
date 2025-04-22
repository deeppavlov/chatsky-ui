import ButtonConditionIcon from '@/icons/nodes/conditions/ButtonConditionIcon'
import { Button, cn, Input, Radio, RadioGroup } from '@nextui-org/react'
import { Edge, useReactFlow } from '@xyflow/react'
import { ArrowUp, Paperclip, Plus, Smile } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import AttentionIcon from '../../icons/AttentionIcon'
import BackIcon from '../../icons/BackIcon'
import { conditionType, IButtonType } from '../../types/ConditionTypes'
import { FlowType } from '../../types/FlowTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import { generateNewConditionBase } from '../../utils'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'

const genNewCondition = (
  buttons: IButtonType[] | conditionType[] = [],
  flows: FlowType[],
  flowId: string,
  rows: number,
  columns: number,
  selected: string,
) => {
  const allNameCondidionFlows = flows
    .filter((flow) => flow.name !== 'Global')
    .map((flow) => {
      return {
        name: flow.name,
        collection: flow.data.nodes
          .filter((node) => node.type === 'default_node')
          .map((node) =>
            (node.data as DefaultNodeDataType).conditions.map((condition) => {
              console.log(condition, 'condition 123')
              return condition.name
            }),
          ),
      }
    })
    .flatMap((flow) => {
      return flow.collection
    })
    .flat()

  const initButtons =
    buttons.length === 0
      ? Array.from({ length: rows * columns }, () => {
          const data =
            selected === 'exactMatch'
              ? { text: '', type: 'exactMatch' }
              : { text: '', callback: '', type: 'hasCallback' }

          return data
        })
      : buttons

  const cache: string[] = []

  const newConditions = initButtons.map((button) => {
    const iterGenName = (count: number = 1): string => {
      const nameFlow =
        (flowId?.length ?? 0 >= 15) ? flowId?.slice(0, 15) : flowId

      const newName = `${nameFlow}_button_${count}`

      console.log(newName, 'new name')

      const isNotUnique = allNameCondidionFlows.includes(newName)

      if (isNotUnique || cache.includes(newName)) {
        console.log(newName, 'is not unique')
        return iterGenName((count += 1))
      }
      cache.push(newName)
      console.log(newName, 'cache')
      return newName
    }

    const initConditionName = iterGenName()

    const condition = generateNewConditionBase(initConditionName, 'button')

    return {
      ...condition,
      data: {
        ...condition.data,
        button: { ...button, id: condition.id },
      },
    }
  })

  console.log(cache, 'cache')
  return newConditions
}

const chunk = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const RenderPrivateButtons = ({
  buttons,
  selected,
  columns,
}: {
  buttons: conditionType[]
  selected: string
  columns: number
}) => {
  return (
    <>
      <div className='w-full rounded-lg border-1 border-border bg-chat'>
        <div className='mb-[2px] ml-[12px] mr-[12px] mt-[16px] rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] bg-background p-[8px]'>
          What do you like?
        </div>
        {selected === 'hasCallback' && (
          <RenderButtons
            buttons={buttons}
            type='hasCallback'
            selected={selected}
            columns={columns}
          />
        )}
        <div className='ml-[12px] mr-[12px] mt-[50px] flex items-center justify-between rounded-lg border-1 border-b border-border bg-background p-1'>
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
        {selected === 'exactMatch' && (
          <RenderButtons
            buttons={buttons}
            type='exactMatch'
            selected={selected}
            columns={columns}
          />
        )}
      </div>
    </>
  )
}

const validateButtons = (buttons: conditionType[], selected: string) => {
  if (selected === 'exactMatch') {
    return buttons.some((button) => button.data.button?.text !== '')
  }

  if (selected === 'hasCallback') {
    return buttons.some(
      (button) =>
        button.data.button?.callback !== '' && button.data.button?.text !== '',
    )
  }
}

const RenderButtons = ({
  buttons,
  selected,
  columns,
}: {
  type: 'exactMatch' | 'hasCallback'
  buttons: conditionType[]
  selected: string
  columns: number
}) => {
  const newArr = chunk(buttons, columns)

  return newArr.map((row, index) => {
    const curentColumns = row
      .map((condition) => {
        if (selected === 'exactMatch') {
          if (condition.data.button?.text === '') {
            return 0
          }
          return 1
        }

        if (selected === 'hasCallback') {
          if (condition.data.button?.text === '') {
            return 0
          }
          return 1
        }
      })
      .filter((item) => item === 1).length

    return (
      <div
        className={`grid grid-cols-${curentColumns} gap-2 p-[2px] pl-[12px] pr-[12px]`}
        key={index}
      >
        {row.map((condition, index) => {
          if (condition.data.button?.text === '') {
            return null
          }

          return (
            <button
              key={index}
              className={`flex h-[23px] items-center justify-center rounded-lg bg-background px-4 text-sm`}
            >
              {condition.data.button?.text}
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
  buttons: conditionType[]
  setButtons: (buttons: conditionType[]) => void
  type: 'exactMatch' | 'hasCallback'
  columns: number
  selected: string

  error: {
    invalid: boolean
    id: string
  }[]
  setError: (error: { invalid: boolean; id: string }[]) => void
}) => {
  const key = type === 'hasCallback' ? 'callback' : 'text'

  const getInputValue = (condition: conditionType) =>
    condition.data?.button?.[key]

  return (
    <div className={`grid grid-cols-${columns > 5 ? 5 : columns} gap-2`}>
      {buttons.map((value: conditionType, buttonIndex) => {
        const errorData = error.filter((item) => item.id === value.id)[0]

        const getError = () => {
          if (selected === 'exactMatch' && type === 'exactMatch') {
            return errorData?.invalid
          }

          if (selected === 'hasCallback' && type === 'hasCallback') {
            return errorData?.invalid
          }

          if (selected === 'hasCallback' && type === 'exactMatch') {
            return false
          }
        }

        return (
          <div key={buttonIndex}>
            <Input
              isInvalid={getError()}
              variant='bordered'
              placeholder={`Please fill in the field in button ${buttonIndex + 1}`}
              value={getInputValue(value as conditionType)}
              size='sm'
              onChange={(e) => {
                const newButtons = buttons.map(
                  (button: conditionType, newButtonIndex) => {
                    if (buttonIndex === newButtonIndex) {
                      return {
                        ...button,
                        data: {
                          ...button.data,
                          button: {
                            ...button.data?.button,
                            [key]: e.target.value,
                          },
                        },
                      }
                    }
                    return button
                  },
                )

                const newError = error.map((item) => {
                  if (item.id === value.id) {
                    return { invalid: false, id: item.id }
                  }
                  return item
                })

                setButtons(newButtons as conditionType[])
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
  buttons: conditionType[]
  setButtons: (buttons: conditionType[]) => void
  type: 'exactMatch' | 'hasCallback'
  columns: number
  error: {
    invalid: boolean
    id: string
  }[]
  setError: (error: { invalid: boolean; id: string }[]) => void
  selected: string
}) => {
  if (type === 'exactMatch') {
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
          type={'exactMatch'}
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
          type={'hasCallback'}
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
  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()

  const { updateNodeData, getNode } = useReactFlow<AppNode, Edge>()
  const node = getNode(data.id)

  const dataButtons = (node?.data as DefaultNodeDataType)?.buttonsData ?? {
    rows: 2,
    columns: 2,
    buttons: [],
  }

  const initRows = dataButtons.rows
  const initColumns = dataButtons.columns

  const [rows, setRows] = useState(initRows || 2)
  const [columns, setColumns] = useState(initColumns || 2)

  const initSelected: string =
    dataButtons?.buttons.length === 0
      ? 'exactMatch'
      : (dataButtons?.buttons[0].data.button?.type ?? 'exactMatch')

  const [selected, setSelected] = useState<string>(initSelected)

  const initButtons: conditionType[] =
    dataButtons.buttons.length === 0
      ? (genNewCondition(
          [],
          flows,
          flowId ?? '',
          rows,
          columns,
          selected,
        ) as conditionType[])
      : dataButtons.buttons

  const [buttons, setButtons] = useState<conditionType[]>(initButtons)

  const [error, setError] = useState<
    {
      invalid: boolean
      id: string
    }[]
  >([])

  useEffect(() => {
    const newButtons = buttons.map((condition, index) => {
      const data =
        selected === 'exactMatch'
          ? {
              text: ``,
              type: selected,
            }
          : {
              text: `button ${index + 1}`,
              callback: '',
              type: selected,
            }

      return {
        ...condition,
        data: {
          ...condition.data,
          button: { ...condition.data?.button, ...data },
        },
      }
    })
    setButtons(newButtons as conditionType[])
  }, [selected])

  useEffect(() => {
    const data =
      selected === 'hasCallback'
        ? {
            text: '',
            callback: '',
            type: selected,
          }
        : {
            text: '',
            type: selected,
          }

    const newButtons = Array.from({ length: rows * columns }, (_, index) => ({
      ...data,
      id: index.toString(),
    }))

    const newConditionsButtons = genNewCondition(
      newButtons,
      flows,
      flowId ?? '',
      rows,
      columns,
      selected,
    ) as conditionType[]

    const currentButtonsLength = buttons.length

    if (newConditionsButtons.length > 25) {
      setButtons(
        newConditionsButtons.slice(0, 25).map((button) => ({ ...button })),
      )
      return
    }

    if (currentButtonsLength > rows * columns) {
      setButtons(
        buttons.slice(0, rows * columns).map((button) => ({ ...button })),
      )
      return
    }

    setButtons([
      ...buttons,
      ...newConditionsButtons.slice(currentButtonsLength).map((button) => ({
        ...button,
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
                if (value === 'hasCallback') {
                  setButtons(buttons.map((button) => ({ ...button, text: '' })))
                } else {
                  setButtons(
                    buttons.map((button) => ({ ...button, callback: '' })),
                  )
                }
                setSelected(value)
              }}
            >
              <div className='grid grid-cols-2 gap-4 pb-[8px]'>
                <div className='flex flex-col gap-4'>
                  <Radio value='exactMatch'>Reply keyboard</Radio>
                </div>
                <div className='flex flex-col gap-4'>
                  <Radio value='hasCallback'>Inline keyboard</Radio>
                </div>
              </div>
            </RadioGroup>
            <RenderPrivateButtons
              buttons={buttons}
              selected={selected}
              columns={columns}
            />
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
            type={selected as 'hasCallback' | 'exactMatch'}
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
              const isValidate = validateButtons(buttons, selected)

              if (!isValidate) {
                const validate = buttons.flatMap((button) => {
                  if (selected === 'exactMatch') {
                    if (button.data.button?.text === '') {
                      return {
                        invalid: true,
                        id: button.id,
                      }
                    }
                  }

                  if (selected === 'hasCallback') {
                    if (button.data.button?.callback === '') {
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
              }

              const newConditions = buttons.filter((condition) => {
                const value =
                  selected === 'exactMatch'
                    ? condition.data.button?.text
                    : condition.data.button?.callback

                return value !== ''
              })

              const allConditions = [
                ...(node?.data as DefaultNodeDataType).conditions.filter(
                  (condition) => condition.type !== 'button',
                ),
                ...newConditions,
              ]

              const response = chunk(buttons, columns).map((row) => {
                return row
                  .filter((item) => {
                    const value =
                      selected === 'exactMatch'
                        ? item.data.button?.text
                        : item.data.button?.callback
                    return value !== ''
                  })
                  .map((item) => {
                    return selected === 'exactMatch'
                      ? {
                          text: item.data.button?.text ?? '',
                          id: item.id,
                        }
                      : {
                          callback: item.data.button?.callback ?? '',
                          id: item.id,
                          text: item.data.button?.text ?? '',
                        }
                  })
              })

              const newData = {
                ...node?.data,
                buttonsData: {
                  buttons: buttons,
                  rows,
                  columns,
                },
                conditions: allConditions,
                response: {
                  ...(node?.data as DefaultNodeDataType).response,
                  buttons: response,
                },
              }

              updateNodeData(data.id, newData)
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
