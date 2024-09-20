import { Button, Switch } from "@nextui-org/react"; // Можно заменить на свой UI-компонент
import { useReactFlow } from "@xyflow/react";
import { Plus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { NotificationsContext } from "../../contexts/notificationsContext";
import { PopUpContext } from "../../contexts/popUpContext";
import SlotsConditionIcon from "../../icons/nodes/conditions/SlotsConditionIcon";
import { SlotsGroupType, SlotType } from "../../types/FlowTypes";
import { SlotsNodeDataType } from "../../types/NodeTypes";
import DefInput from "../../UI/Input/DefInput";
import DefSelect from "../../UI/Input/DefSelect";
import { generateNewSlot, generateNewSlotsGroup } from "../../utils";
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents";
import SlotItem from "./components/SlotItem";

type SlotsGroupModalType = CustomModalProps & {
  data: SlotsNodeDataType
  setData: React.Dispatch<React.SetStateAction<SlotsNodeDataType>>
  group?: SlotsGroupType | null
  is_create?: boolean
}

const SlotsGroupModal = ({
  id = "slots-group-modal",
  data,
  setData,
  is_create,
  group,
}: SlotsGroupModalType) => {
  const { updateNodeData } = useReactFlow()
  const { closePopUp } = useContext(PopUpContext)
  const { notification: n } = useContext(NotificationsContext)
  const [isSubGroup, setIsSubGroup] = useState<boolean>(false)
  const [currentGroup, setCurrentGroup] = useState<SlotsGroupType>(
    group ?? {
      id: "group_" + v4(),
      name: "New group",
      slots: [generateNewSlot("New group")],
      subgroups: [],
      subgroup_to: "",
      flow: "global",
    }
  )

  useEffect(() => {
    if (group) {
      setCurrentGroup(group)
    }
  }, [group])

  const onAddSlot = () => {
    const newSlot: SlotType = generateNewSlot(currentGroup.name)
    setCurrentGroup((prevGroup) => ({
      ...prevGroup,
      slots: [...prevGroup.slots, newSlot],
    }))
  }

  const onSave = () => {
    if (
      !currentGroup.name ||
      !currentGroup.slots.every((slot) => slot.name && slot.group_name && slot.type && slot.value)
    ) {
      return n.add({
        type: "warning",
        title: "Warning",
        message: "All fields are required!",
      })
    } else {
      const newData = {
        ...data,
        groups: is_create
          ? [...data.groups, currentGroup]
          : data.groups.map((g: SlotsGroupType) => (g.id === currentGroup.id ? currentGroup : g)),
      }
      updateNodeData(data.id, newData)
      setData(() => newData)
      setCurrentGroup(generateNewSlotsGroup())
    }
  }

  const onSaveHandler = () => {
    onSave()
    closePopUp(id)
  }

  const onCloseHandler = () => {
    closePopUp(id)
  }

  return (
    <Modal
      id={id}
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'>
      <ModalHeader className='flex items-center justify-start gap-2 text-lg font-semibold'>
        <div className='flex items-center gap-2'>
          <SlotsConditionIcon />
          <p>{is_create ? "New" : "Edit"} group</p>
        </div>
      </ModalHeader>
      <ModalBody>
        <div>
          <DefInput
            label='Group name'
            placeholder='Enter name of this group...'
            value={currentGroup.name}
            onValueChange={(name) => setCurrentGroup({ ...currentGroup, name })}
          />
          {data.groups.length >= (is_create ? 1 : 2) && (
            <div className='flex flex-col items-start gap-1.5 mt-1'>
              <div className='flex items-center gap-1'>
                <p className='text-xs'>Standalone</p>
                <Switch
                  size='sm'
                  isSelected={isSubGroup}
                  onValueChange={setIsSubGroup}
                />
                <p className='text-xs'>Subgroup</p>
              </div>
              {isSubGroup && (
                <DefSelect
                  defaultValue={currentGroup.subgroup_to}
                  onValueChange={(value) =>
                    setCurrentGroup({ ...currentGroup, subgroup_to: value })
                  }
                  placeholder='Select parent group'
                  className='w-1/3'
                  items={data.groups
                    .filter((g) => g.id !== currentGroup.id)
                    .map((g) => ({ key: g.name, value: g.name }))}
                />
              )}
            </div>
          )}
        </div>
        <div className='grid gap-4 mt-4'>
          {currentGroup.slots.map((slot) => (
            <SlotItem
              key={slot.id}
              slot={slot}
              setSlots={(updatedSlot) =>
                setCurrentGroup((prevGroup) => ({
                  ...prevGroup,
                  slots: prevGroup.slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s)),
                }))
              }
              onDelete={(slotId) =>
                setCurrentGroup((prevGroup) => ({
                  ...prevGroup,
                  slots: prevGroup.slots.filter((s) => s.id !== slotId),
                }))
              }
            />
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className='bg-btn-accent text-black'
          onClick={onAddSlot}>
          <Plus className='stroke-black' />
          New slot
        </Button>
        <Button onClick={onSaveHandler}>Save group</Button>
      </ModalFooter>
    </Modal>
  )
}

export default SlotsGroupModal
