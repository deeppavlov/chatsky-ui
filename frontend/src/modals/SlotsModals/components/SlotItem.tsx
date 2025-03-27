import { Button } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import EditPenIcon from '../../../icons/EditPenIcon'
import TrashIcon from '../../../icons/TrashIcon'
import { SlotType } from '../../../types/FlowTypes'
import DefInput from '../../../UI/Input/DefInput'
import DefTextarea from '../../../UI/Input/DefTextarea'

export interface IError {
  isInvalid: boolean
  errorMessage: string
  id?: string
}

export interface IerrorSimple {
  name?: IError
  value?: IError
}

export interface IErrorDep {
  nameGroup: IError
  slots: {
    id: string
    name?: IError
    value?: IError
  }[]
}

type SlotItemType = {
  slot: SlotType
  setSlots: (updatedSlot: SlotType) => void
  onDelete: (slotId: string) => void
  is_create_modal?: boolean
  errors: IerrorSimple | IErrorDep
  setErrors: (errors: IerrorSimple | IErrorDep) => void
}

const SlotItem = ({
  slot,
  setSlots,
  onDelete,
  is_create_modal,
  errors,
  setErrors,
}: SlotItemType) => {
  const [name, setName] = useState<string>(slot.name ?? '')
  const [type] = useState<'RegexpSlot' | ''>(slot.type ?? '')
  const [method] = useState<string>(slot.method ?? '')
  const [value, setValue] = useState<string>(slot.value ?? '')
  const [index, setIndex] = useState<number>(slot.match_group_idx ?? 0)

  useEffect(() => {
    setSlots({
      ...slot,
      name,
      type,
      method,
      value,
      match_group_idx: index,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, type, method, value, index])

  const currenError =
    'name' in errors
      ? errors
      : (errors as IErrorDep).slots?.filter((e) => e.id === slot.id)[0]

  return (
    <div className='my-1'>
      <div className='mb-1 flex items-center justify-between'>
        <div className='mb-2 flex items-center gap-2'>
          <EditPenIcon />
          <DefInput
            value={name}
            onValueChange={(value) => {
              setName(value.replaceAll(' ', '_'))

              if ('name' in errors) {
                setErrors({
                  ...errors,
                  name: { isInvalid: false, errorMessage: '' },
                })
                return
              }

              setErrors({
                ...errors,
                slots: (errors as IErrorDep).slots.map((e) =>
                  e.id === slot.id
                    ? {
                        ...e,
                        name: { isInvalid: false, errorMessage: '' },
                      }
                    : e,
                ),
              })
            }}
            className='bg-transparent focus:outline-none focus:placeholder:text-transparent'
            type='text'
            placeholder='New slot'
            errorMessage={currenError?.name?.errorMessage}
            isInvalid={currenError?.name?.isInvalid}
          />
        </div>
        {!is_create_modal && (
          <Button
            onClick={() => onDelete(slot.id)}
            isIconOnly
            variant='ghost'
            className='h-8 min-h-8 w-8 min-w-8 cursor-pointer border-none'
            radius='sm'
            color='danger'
          >
            <TrashIcon className='stroke-foreground' />
          </Button>
        )}
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <DefTextarea
          value={value}
          onValueChange={(value) => {
            setValue(value)

            if ('value' in errors) {
              setErrors({
                ...errors,
                value: { isInvalid: false, errorMessage: '' },
              })
              return
            }

            setErrors({
              ...errors,
              slots: (errors as IErrorDep).slots.map((e) =>
                e.id === slot.id
                  ? { ...e, value: { isInvalid: false, errorMessage: '' } }
                  : e,
              ),
            })
          }}
          className='col-span-2'
          isMultiline
          label='Slot value'
          placeholder={`Enter slot regexp\ne.g. ([a-zA-Z]+)`}
          errorMessage={currenError?.value?.errorMessage}
          isInvalid={currenError?.value?.isInvalid}
        />
        {value.length !== 0 && (
          <div className='flex-col-2 group col-span-2 flex w-full items-center gap-2 pt-2'>
            <p style={{ flexShrink: 0 }}>Match group index =</p>
            <DefInput
              min={0}
              value={index.toString()}
              onValueChange={(value) => setIndex(Number(value))}
              type='number'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default SlotItem
