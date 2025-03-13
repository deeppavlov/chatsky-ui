import { flowContext } from '@/contexts/flowContext'
import { Button } from '@nextui-org/react'
import { useReactFlow } from '@xyflow/react'
import { ChevronDown, PlusIcon, X } from 'lucide-react'
import { useContext, useState } from 'react'
import { PopUpContext } from '../../../contexts/popUpContext'
import NewWindowIcon from '../../../icons/NewWindowIcon'
import AlertModal from '../../../modals/AlertModal'
import SlotModal from '../../../modals/SlotsModals/SlotModal'
import SlotsGroupModal from '../../../modals/SlotsModals/SlotsGroupModal'
import { SlotsGroupType, SlotType } from '../../../types/FlowTypes'
import { SlotsNodeDataType } from '../../../types/NodeTypes'

type SlotsGroupProps = {
  data: SlotsNodeDataType
  setData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
  group: SlotsGroupType
}

const SlotsGroup = ({ data, setData, group }: SlotsGroupProps) => {
  const { quietSaveFlows } = useContext(flowContext)
  const { updateNodeData } = useReactFlow()
  const { openPopUp } = useContext(PopUpContext)
  const [isOpen, setIsOpen] = useState(false)

  const handleDeleteSlot = (slotId: string) => {
    // Удаление слота из группы
    const updatedGroups = data.groups.map((g) =>
      g.id === group.id
        ? { ...g, slots: g.slots.filter((slot) => slot.id !== slotId) }
        : g,
    )
    setData((prevData) => {
      const newData = { ...prevData, groups: updatedGroups }
      updateNodeData(data.id, newData)
      return newData
    })
  }

  const handleConfirmDeleteOpen = (slot: SlotType) => {
    // Открываем модал для подтверждения удаления слота
    openPopUp(
      <AlertModal
        id='delete-slot'
        onAction={() => {
          slot && handleDeleteSlot(slot.id)
          quietSaveFlows()
        }} // Подтверждение удаления
        title='Delete slot'
        description={`Are you sure you want to delete the slot "${slot?.name}"? This action cannot be undone.`}
        actionText='Delete'
        cancelText='Cancel'
      />,
      'delete-slot',
    )
  }

  const handleGroupModalOpen = () => {
    openPopUp(
      <SlotsGroupModal
        id='slots-group-modal'
        data={data}
        setData={setData}
        group={group}
        is_create={false}
      />,
      'slots-group-modal',
    )
  }

  const handleNewSlotModalOpen = () => {
    openPopUp(
      <SlotModal
        id='new-slot-modal'
        data={data}
        setData={setData}
        group={group}
      />,
      'new-slot-modal',
    )
  }

  return (
    <>
      <div className='w-full rounded-lg border border-border bg-node-header p-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            <Button
              className='h-8 min-h-0 w-8 min-w-0 p-0'
              radius='sm'
              variant='light'
              onClick={() => setIsOpen(!isOpen)}
              isIconOnly
            >
              <ChevronDown
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out',
                }}
              />
            </Button>
            <p className='text-sm font-medium'>{group.name}</p>
          </div>
          <Button
            onClick={handleGroupModalOpen}
            className='h-8 min-h-0 w-8 min-w-0 p-0'
            radius='sm'
            variant='light'
            color='default'
            isIconOnly
          >
            <NewWindowIcon />
          </Button>
        </div>
        <div
          className='overflow-hidden transition-all'
          style={{
            display: 'grid',
            gridTemplateRows: isOpen ? '1fr' : '0fr',
          }}
        >
          <div className='grid min-h-0 gap-1'>
            <span className='mt-1 block' />
            {group.slots.length ? (
              group.slots.map((slot) => (
                <div
                  key={slot.id}
                  className='flex items-center justify-between pl-4 pr-2'
                >
                  <p className='text-sm'>{slot.name}</p>
                  <div className='flex items-center gap-1'>
                    <p className='rounded bg-border px-1.5 text-sm'>
                      {typeof slot.type === 'string'
                        ? slot.type
                        : JSON.stringify(slot.type)}{' '}
                      (
                      {slot.value.length > 10
                        ? slot.value.substring(0, 10) + '...'
                        : slot.value}
                      )
                    </p>
                    <Button
                      radius='sm'
                      isIconOnly
                      className='h-6 min-h-6 w-6 min-w-6'
                      variant='light'
                      onClick={() => handleConfirmDeleteOpen(slot)} // Устанавливаем слот для удаления
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>Your slots will appear here.</p>
            )}
            <button
              onClick={handleNewSlotModalOpen}
              data-testid={`${data.name.toLowerCase().replace(' ', '')}-add-group-btn`}
              className='mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-node-header py-1'
            >
              <PlusIcon color='var(--foreground)' />
              Add slot
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SlotsGroup
