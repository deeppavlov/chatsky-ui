import ButtonConditionIcon from '@/icons/nodes/conditions/ButtonConditionIcon'
import { Button, Input, Radio, RadioGroup } from '@nextui-org/react'
import { Edge, useReactFlow } from '@xyflow/react'
import {
  ArrowUp,
  Trash2 as DeleteIcon,
  Paperclip,
  Plus,
  Smile,
} from 'lucide-react'
import { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 } from 'uuid'
import { flowContext } from '../../contexts/flowContext'
import AttentionIcon from '../../icons/AttentionIcon'
import BackIcon from '../../icons/BackIcon'
import { FlowType } from '../../types/FlowTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import { generateNewConditionBase } from '../../utils'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'

export interface IButton {
  text: string
  id: string
  callback?: string
  type: string
}

const getAllNameConditions = (flows: FlowType[]) => {
  const allNameCondidionFlows = flows
    .filter((flow) => flow.name !== 'Global')
    .map((flow) => {
      return {
        name: flow.name,
        collection: flow.data.nodes
          .filter((node) => node.type === 'default_node')
          .map((node) =>
            (node.data as DefaultNodeDataType).conditions
              .filter((condition) => {
                return condition.type !== 'button'
              })
              .map((condition) => {
                return condition.name
              }),
          ),
      }
    })
    .flatMap((flow) => {
      return flow.collection
    })
    .flat()
  return allNameCondidionFlows
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
}: {
  buttons: IButton[][]
  selected: string
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
          />
        )}
      </div>
    </>
  )
}

const validateButtons = (buttons: IButton[][], selected: string): string[] => {
  const key = selected === 'exactMatch' ? 'text' : 'callback'
  const validate = buttons.map((row) => {
    return row.map((button) => {
      if (button[key] === '') {
        return button.id
      }
      return null
    })
  })
  return validate.flat().filter((item): item is string => item !== null)
}

const RenderButtons = ({
  buttons,
  type,
}: {
  type: 'exactMatch' | 'hasCallback'
  buttons: IButton[][]
  selected: string
}) => {
  return buttons.map((row, rowIndex) => {
    const key = type === 'exactMatch' ? 'text' : 'callback'
    const curentColumns = row.filter((iter) => iter[key] !== '').length

    return (
      <div
        className={`grid grid-cols-${curentColumns} gap-2 p-[2px] pl-[12px] pr-[12px]`}
        key={rowIndex}
      >
        {row.map((iter, buttonIndex) => {
          if (iter[key] === '') {
            return null
          }

          return (
            <button
              data-testid={`button-preview-${rowIndex}-${buttonIndex}`}
              key={buttonIndex}
              className={`flex h-[23px] items-center justify-center rounded-lg bg-background px-4 text-sm`}
            >
              {iter.text}
            </button>
          )
        })}
      </div>
    )
  })
}

const RenderCell = ({
  buttons,
  setButtons,
  type,
  columns,
  error,
  setError,
}: {
  buttons: IButton[][]
  setButtons: (buttons: IButton[][]) => void
  type: 'exactMatch' | 'hasCallback'
  columns: number
  error: string[]
  setError: (error: string[]) => void
}) => {
  const key = type === 'hasCallback' ? 'callback' : 'text'

  return (
    <div className={`grid grid-cols-${columns > 5 ? 5 : columns} gap-2`}>
      {buttons.map((row: IButton[], rowIndex) => {
        return row.map((value, buttonIndex) => {
          return (
            <div key={buttonIndex}>
              <Input
                data-testid={`button-${type}-row-${rowIndex}-${buttonIndex}`}
                isInvalid={error.includes(value.id) && value[key] === ''}
                variant='bordered'
                placeholder={`Please fill in the field in button ${buttonIndex + 1}`}
                value={value[key]}
                size='sm'
                onChange={(e) => {
                  const newButtons = buttons.map((row) => {
                    return row.map((item) => {
                      if (item.id === value.id) {
                        return { ...item, [key]: e.target.value }
                      }
                      return item
                    })
                  })
                  setButtons(newButtons)
                  setError(error.filter((item) => item !== value.id))
                }}
              />
            </div>
          )
        })
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
}: {
  buttons: IButton[][]
  setButtons: (buttons: IButton[][]) => void
  type: 'exactMatch' | 'hasCallback'
  columns: number
  error: string[]
  setError: (error: string[]) => void
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
          error={error}
          setError={setError}
        />
      </div>
    </>
  )
}

const genInitButtons = (
  columns: number = 2,
  rows: number = 2,
  buttons: IButton[] = [],
  selected: string = 'exactMatch',
) => {
  const arr = Array.from({ length: columns * rows }, (_, index) =>
    selected === 'exactMatch'
      ? {
          text: buttons[index]?.text ?? '',
          id: 'condition_' + v4(),
          type: selected,
        }
      : {
          text: buttons[index]?.text ?? '',
          callback: buttons[index]?.callback ?? '',
          id: 'condition_' + v4(),
          type: selected,
        },
  )

  return chunk(arr, columns)
}

const mappingButtons = {
  addColumns: (buttons: IButton[][], selected: string) => {
    const newButtons = buttons.map((row) => {
      const data =
        selected === 'exactMatch'
          ? { text: '', id: 'condition_' + v4(), type: selected }
          : {
              text: '',
              callback: '',
              id: 'condition_' + v4(),
              type: selected,
            }
      const newRow = [...row, data]

      return newRow
    })
    let idCount = 1
    return newButtons.map((row) => {
      return row.map((item) => {
        const text = selected === 'exactMatch' ? item.text : `button ${idCount}`
        idCount += 1
        return { ...item, text }
      })
    })
  },
  removeColumns: (buttons: IButton[][]) => {
    const newButtons = buttons.map((row) => {
      return row.slice(0, -1)
    })
    return newButtons
  },
  addRows: (buttons: IButton[][], selected: string) => {
    const newButtons = [
      ...buttons,
      ...genInitButtons(buttons[0].length, 1, [], selected),
    ]
    let idCount = 1
    return newButtons.map((row) => {
      return row.map((item) => {
        const buttonName = item.text === '' ? `button ${idCount}` : item.text
        const text = selected === 'exactMatch' ? item.text : buttonName
        idCount += 1
        return { ...item, text }
      })
    })
  },
  removeRows: (buttons: IButton[][]) => {
    const newButtons = buttons.slice(0, -1)
    return newButtons
  },
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

  const dataButtons = (node?.data as DefaultNodeDataType).buttonsData ?? {
    rows: 0,
    columns: 0,
    buttons: [],
  }

  const initButtons =
    dataButtons.buttons.length === 0 ? genInitButtons() : dataButtons.buttons

  const dataButtonsInit = {
    rows: initButtons[0].length,
    columns: initButtons.length,
    buttons: initButtons,
  }

  const [buttons, setButtons] = useState<IButton[][]>(dataButtonsInit.buttons)

  const initSelected: string = buttons?.[0]?.[0]?.type ?? 'exactMatch'
  const [selected, setSelected] = useState<string>(initSelected)

  const [columns, setColumns] = useState<number>(dataButtonsInit.columns)
  const [rows, setRows] = useState<number>(dataButtonsInit.rows)

  const [error, setError] = useState<string[]>([])

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
                let countId = 0
                const newButtons = buttons.map((row) => {
                  return row.map((item) => {
                    const curentValue =
                      selected === 'exactMatch' ? item.text : item.callback

                    const object =
                      value === 'exactMatch'
                        ? { type: value, text: curentValue ?? '' }
                        : {
                            callback: curentValue ?? '',
                            type: value,
                            text: `button ${(countId += 1)}`,
                          }
                    return { ...item, ...object }
                  })
                })

                setButtons(newButtons)
                setSelected(value)
                setError([])
              }}
            >
              <div className='grid grid-cols-2 gap-4 pb-[8px]'>
                <div className='flex flex-col gap-4'>
                  <Radio data-testid='exactMatch' value='exactMatch'>
                    Reply keyboard
                  </Radio>
                </div>
                <div className='flex flex-col gap-4'>
                  <Radio data-testid='hasCallback' value='hasCallback'>
                    Inline keyboard
                  </Radio>
                </div>
              </div>
            </RadioGroup>
            <RenderPrivateButtons buttons={buttons} selected={selected} />
          </div>

          <div>
            <h3 className='mb-4 text-[12px] font-medium'>
              Enter numbers of columns and rows
            </h3>
            <div className='flex items-center gap-2'>
              <Input
                data-testid='columns'
                variant='bordered'
                min={1}
                type='number'
                value={String(columns)}
                className='w-16'
                size='sm'
                onChange={(e) => {
                  if (Number(e.target.value) > 5) {
                    setColumns(Number(e.target.value))
                    return
                  }
                  if (Number(e.target.value) < 1) {
                    setColumns(1)
                    return
                  }
                  setColumns(Number(e.target.value))
                  const key =
                    Number(e.target.value) > columns
                      ? 'addColumns'
                      : 'removeColumns'
                  const newButtons = mappingButtons[key](buttons, selected)
                  setButtons(newButtons)
                }}
                isInvalid={columns > 5}
              />
              <span>x</span>
              <Input
                data-testid='rows'
                variant='bordered'
                min={1}
                type='number'
                value={String(rows)}
                onChange={(e) => {
                  if (Number(e.target.value) > 5) {
                    setRows(Number(e.target.value))
                    return
                  }
                  if (Number(e.target.value) < 1) {
                    setRows(1)
                    return
                  }
                  setRows(Number(e.target.value))
                  const key =
                    Number(e.target.value) > rows ? 'addRows' : 'removeRows'
                  const newButtons = mappingButtons[key](buttons, selected)
                  setButtons(newButtons)
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
          />
        </ModalBody>

        <ModalFooter className='flex justify-between'>
          <div className='flex gap-2'>
            <Button isIconOnly className='rounded-full text-[18px]'>
              ?
            </Button>
            <Button
              isIconOnly
              className='rounded-full text-[18px]'
              onClick={() => {
                const newConditions = (
                  node?.data as DefaultNodeDataType
                ).conditions.filter((condition) => {
                  return condition.type !== 'button'
                })

                updateNodeData(data.id, {
                  conditions: newConditions,
                  buttonsData: { buttons: [], rows: 0, columns: 0 },

                  response: {
                    ...(node?.data as DefaultNodeDataType).response,
                    buttons: [],
                  },
                })
                setButtons([])
                quietSaveFlows()
                onClose()
              }}
            >
              <DeleteIcon />
            </Button>
          </div>
          <Button
            data-testid='addConditions'
            isDisabled={rows > 5 || columns > 5 || buttons.length === 0}
            className='ml-auto'
            onClick={() => {
              const isValidate = validateButtons(buttons, selected)

              if (isValidate.length === buttons.flat().length) {
                setError(isValidate)
                return
              }

              const filteredConditionsButtons = buttons.map((row) => {
                return row.filter((item) => {
                  if (selected === 'exactMatch') {
                    return item.text !== ''
                  }
                  return item.callback !== ''
                })
              })

              const cache: string[] = []
              const allNameCondidionFlows = getAllNameConditions(flows)

              const newConditionsButtons = filteredConditionsButtons
                .flat()
                .map((button) => {
                  const iterGenName = (count: number = 1): string => {
                    const nameFlow =
                      (flowId?.length ?? 0 >= 15)
                        ? flowId?.slice(0, 15)
                        : flowId
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
                    id: button.id,
                    data: {
                      ...condition.data,
                      button: { ...button, id: button.id },
                    },
                  }
                })

              const newConditions = [
                ...(node?.data as DefaultNodeDataType).conditions.filter(
                  (el) => el.type !== 'button',
                ),
                ...newConditionsButtons,
              ]

              const responseButtons = filteredConditionsButtons.map((row) => {
                return row.map((item) => {
                  const data =
                    selected === 'exactMatch'
                      ? { text: item.text, id: item.id }
                      : {
                          text: item.text,
                          callback: item.callback,
                          id: item.id,
                        }
                  return data
                })
              })
              const buttonsData = {
                buttons: buttons,
                rows: rows,
                columns: columns,
              }

              updateNodeData(data.id, {
                ...(data as DefaultNodeDataType),
                conditions: newConditions,
                buttonsData: buttonsData,
                response: {
                  ...(data as DefaultNodeDataType).response,
                  buttons: responseButtons,
                },
              })
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
