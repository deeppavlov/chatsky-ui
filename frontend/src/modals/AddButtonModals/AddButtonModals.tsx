import { Button, Input, Radio, RadioGroup } from '@nextui-org/react';
import { ArrowUp, Paperclip, Plus, Smile } from 'lucide-react';
import { useEffect, useState } from 'react';
import AttentionIcon from '../../icons/AttentionIcon';
import BackIcon from '../../icons/BackIcon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents';


const RenderButtons = ({
  type,
  buttons,
}: {
  type: 'reply' | 'inline'
  buttons: { text: string; colback: string; defText: string; id: number }[]
}) => {
  const bg = type === 'reply' ? 'bg-background' : ''
  const bg2 = type === 'inline' ? 'bg-background' : 'bg-chat'

  return (
    <div className={`grid grid-cols-2 gap-2 p-[12px] ${bg}`}>
      {buttons.map((button, index) => {
        if (index === buttons.length - 1) {
          const bg3 = buttons.length % 2 === 0 ? '' : 'col-span-2'

          return (
            <button
              key={index}
              className={`flex h-[23px] items-center justify-center rounded-lg bg-background px-4 text-sm ${bg2} ${bg3}`}
            >
              {button.text === '' ? button.defText : button.text}
            </button>
          )
        }

        return (
          <button
            key={index}
            className={`flex h-[23px] items-center justify-center rounded-lg bg-background px-4 text-sm ${bg2} `}
          >
            {button.text === '' ? button.defText : button.text}
          </button>
        )
      })}
    </div>
  )
}

const RenderCell = ({
  state,
  setState,
  type,
  columns,
}: {
  state: {
    buttons: { id: number; text: string; colback: string; defText: string }[]
  }
  setState: (state: {
    buttons: { id: number; text: string; colback: string; defText: string }[]
  }) => void
  type: 'reply' | 'inline'
  columns: number
}) => {
  const key = type === 'inline' ? 'colback' : 'text'

  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {state.buttons.map((button, buttonIndex) => (
        <div key={buttonIndex}>
          <Input
            value={button[key] === '' ? button.defText : button[key]}
            size='sm'
            onChange={(e) => {
              const newButtons = state.buttons.map((button, newButtonIndex) => {
                if (buttonIndex === newButtonIndex) {
                  return { ...button, [key]: e.target.value }
                }
                return button
              })
              setState({ ...state, buttons: newButtons })
            }}
          />
        </div>
      ))}
    </div>
  )
}

const RenderTypeButtons = ({
  type,
  state,
  setState,
  columns,
}: {
  type: 'reply' | 'inline'
  state: {
    buttons: { id: number; text: string; colback: string; defText: string }[]
  }
  setState: (state: {
    buttons: { id: number; text: string; colback: string; defText: string }[]
  }) => void
  columns: number
}) => {
  return (
    <>
      <div className={`grid gap-2`}>
        <h3 className='mb-2 text-[12px] text-sm font-medium'>
          Enter display text for every button
        </h3>
        <RenderCell
          state={state}
          setState={setState}
          type='reply'
          columns={columns}
        />
      </div>
      {type === 'inline' && (
        <div className={`grid gap-2`}>
          <h3 className='mb-2 text-[12px] text-sm font-medium'>
            Enter display text for every button
          </h3>
          <div className='flex w-full items-center gap-2'>
            <AttentionIcon stroke='#3300FF' />
            <div className='text-[12px] text-sm font-medium'>
              Buttons are only available for Telegram interface. If you are
              planning to launch your bot on different platforms, please select
              another condition type.
            </div>
          </div>
          <RenderCell
            state={state}
            setState={setState}
            type='inline'
            columns={columns}
          />
        </div>
      )}
    </>
  )
}

const AddButtonModals = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [selected, setSelected] = useState('reply')

  const [rows, setRows] = useState(2)
  const [columns, setColumns] = useState(2)

  const [state, setState] = useState<{
    buttons: { id: number; text: string; colback: string; defText: string }[]
  }>({
    buttons: [
      { id: 1, text: '', colback: 'colbackText 1', defText: 'Button 1' },
      { id: 2, text: '', colback: 'colbackText 2', defText: 'Button 2' },
      { id: 3, text: '', colback: 'colbackText 3', defText: 'Button 3' },
      { id: 4, text: '', colback: 'colbackText 4', defText: 'Button 4' },
    ],
  })

  useEffect(() => {
    const newButtons = Array.from({ length: rows * columns }, (_, index) => ({
      id: index + 1,
      text: '',
      colback: `colbackText ${index + 1}`,
      defText: `Button ${index + 1}`,
    }))

    const currentButtons = state.buttons.length

    if (currentButtons > rows * columns) {
      setState({
        buttons: state.buttons.slice(0, rows * columns),
      })
      return
    }

    setState({
      buttons: [...state.buttons, ...newButtons.slice(currentButtons)],
    })
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
            Add buttons
          </div>
        </ModalHeader>

        <ModalBody className='flex flex-1 flex-col gap-[24px] py-2'>
          <div className='flex w-full items-center gap-2'>
            <AttentionIcon stroke='#3300FF' />
            <div className='text-[12px] text-sm font-medium'>
              Buttons are only available for Telegram interface. If you are
              planning to launch your bot on different platforms, please select
              another condition type.
            </div>
          </div>

          <div>
            <h3 className='mb-4 font-medium'>Select type</h3>
            <RadioGroup value={selected} onValueChange={setSelected}>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-4'>
                  <Radio value='reply'>Reply keyboard</Radio>
                  <div className='w-full rounded-lg border-1 border-border bg-chat'>
                    <div className='ml-[12px] mr-[36px] mt-[16px] rounded-lg bg-background p-[8px]'>
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
                    <RenderButtons buttons={state.buttons} type='reply' />
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <Radio value='inline'>Inline keyboard</Radio>
                  <div className='w-full rounded-lg border-1 border-border bg-chat'>
                    <div className='ml-[12px] mr-[36px] mt-[16px] rounded-lg bg-background p-[8px]'>
                      What do you like?
                    </div>
                    <RenderButtons buttons={state.buttons} type='inline' />
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
                </div>
              </div>
            </RadioGroup>
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
                  if (Number(e.target.value) > 5) {
                    setColumns(5)
                  } else {
                    setColumns(Number(e.target.value))
                  }
                }}
                isInvalid={columns > 5}
              />
              <span>x</span>
              <Input
                variant='bordered'
                max={5}
                min={1}
                type='number'
                value={String(rows)}
                onChange={(e) => {
                  if (Number(e.target.value) > 5) {
                    setRows(5)
                  } else {
                    setRows(Number(e.target.value))
                  }
                }}
                className='w-16'
                size='sm'
              />
              <span className='text-gray-500'>5 × 5 max</span>
            </div>
          </div>

          <RenderTypeButtons
            state={state}
            setState={setState}
            type={selected as 'inline' | 'reply'}
            columns={columns}
          />
        </ModalBody>

        <ModalFooter className='flex justify-between'>
          <div className='flex gap-2'>
            <Button isIconOnly className='rounded-full text-[18px]'>
              ?
            </Button>
          </div>
          <Button className='ml-auto'>
            <Plus /> Auto conditions
          </Button>
          <Button className='bg-foreground text-background'>
            Save buttons
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}

export default AddButtonModals