import { flowContext } from '@/contexts/flowContext'
import { Button } from '@nextui-org/react'
import { useReactFlow } from '@xyflow/react'
import { useContext, useState } from 'react'
import { PopUpContext } from '../../contexts/popUpContext'
import SlotsConditionIcon from '../../icons/nodes/conditions/SlotsConditionIcon'
import { SlotsGroupType, SlotType } from '../../types/FlowTypes'
import { SlotsNodeDataType } from '../../types/NodeTypes'
import { generateNewSlot } from '../../utils'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'
import SlotItem, { IErrorDep, IerrorSimple } from './components/SlotItem'

type SlotModalType = CustomModalProps & {
  group: SlotsGroupType
  data: SlotsNodeDataType
  setData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
}

const SlotModal = ({
  id = 'new-slot-modal',
  data,
  setData,
  group,
}: SlotModalType) => {
  const { closePopUp } = useContext(PopUpContext)
  const { updateNodeData } = useReactFlow()

  const { quietSaveFlows } = useContext(flowContext)
  const [slot, setSlot] = useState<SlotType>(generateNewSlot(group.name))
  const [errors, setErrors] = useState<IerrorSimple | IErrorDep>({
    name: { isInvalid: false, errorMessage: '' },
    value: { isInvalid: false, errorMessage: '' },
  })

  const isNotValid = () => {
    const newErrors = {
      name: { isInvalid: false, errorMessage: '' },
      value: { isInvalid: false, errorMessage: '' },
    }
    let notValid = false
    const allNames = group.slots.map((s) => s.name)
    if (allNames.includes(slot.name)) {
      newErrors.name = { isInvalid: true, errorMessage: 'Name already exists' }
      notValid = true
    }

    if (slot.value.length === 0) {
      newErrors.value = { isInvalid: true, errorMessage: 'Value is required' }
      notValid = true
    }
    setErrors(newErrors)
    return notValid
  }

  const onSave = () => {
    if (!slot.name || !slot.type || !slot.value) {
      return
    }

    const newData = {
      ...data,
      groups: data.groups.map((g) =>
        g.id === group.id ? { ...group, slots: [...group.slots, slot] } : g,
      ),
    }

    setData(() => newData)
    updateNodeData(data.id, newData)
    setSlot(generateNewSlot(group.name))
  }

  const onCloseHandler = () => {
    closePopUp(id)
  }

  const onSaveHandler = () => {
    if (isNotValid()) {
      return
    }
    onSave()
    closePopUp(id)
    quietSaveFlows()
  }

  return (
    <Modal id={id} isOpen={true} onClose={onCloseHandler}>
      <ModalHeader className='flex items-center gap-2'>
        <div className='flex items-center gap-2'>
          <SlotsConditionIcon />
          New slot
        </div>
      </ModalHeader>
      <ModalBody>
        <SlotItem
          onDelete={() => {}}
          is_create_modal
          setSlots={setSlot}
          slot={slot}
          errors={errors}
          setErrors={setErrors}
        />
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCloseHandler}>Cancel</Button>
        <Button
          className='bg-foreground text-background'
          onClick={onSaveHandler}
        >
          Save
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default SlotModal
