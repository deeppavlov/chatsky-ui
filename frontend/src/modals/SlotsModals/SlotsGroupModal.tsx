import SlotsGroupsTable from "@/components/nodes/slots/SlotsGroupsTable"
import { flowContext } from "@/contexts/flowContext"
import { Button, Switch } from "@nextui-org/react"; // Можно заменить на свой UI-компонент
import { useReactFlow } from "@xyflow/react"
import { Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { v4 } from "uuid"
import { NotificationsContext } from "../../contexts/notificationsContext"
import { PopUpContext } from "../../contexts/popUpContext"
import SlotsConditionIcon from "../../icons/nodes/conditions/SlotsConditionIcon"
import { SlotsGroupType, SlotType } from "../../types/FlowTypes"
import { SlotsNodeDataType } from "../../types/NodeTypes"
import DefInput from "../../UI/Input/DefInput"
import DefSelect from "../../UI/Input/DefSelect"
import { generateNewSlot } from "../../utils"
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents"
import SlotItem from "./components/SlotItem"

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
  const { closePopUp, openPopUp } = useContext(PopUpContext)
  const { notification: n } = useContext(NotificationsContext)
  const { quietSaveFlows } = useContext(flowContext)
  const [nodeData, setNodeData] = useState(data)
  const [groups, setGroups] = useState<SlotsGroupType[]>(data.groups ?? [])
  const [subgroups, setSubgroups] = useState<SlotsGroupType[]>(
    !is_create && group && group.subgroups
      ? group.subgroups.map((id) => groups.find((g) => g.id === id)!)
      : []
  )
  const [isSubGroup, setIsSubGroup] = useState<boolean>(!!group?.subgroup_to ?? false)
  const [parentGroup, setParentGroup] = useState<SlotsGroupType | null>(null)
  const [currentGroup, setCurrentGroup] = useState<SlotsGroupType>(() => {
    const id = "group_" + v4()
    return (
      group ?? {
        id: id,
        name: "New group",
        slots: [generateNewSlot(id)],
        subgroups: [],
        subgroup_to: "",
        flow: "global",
      }
    )
  })

  useEffect(() => {
    if (group) {
      setCurrentGroup(group)
    }
  }, [group])

  const onAddSlot = () => {
    const newSlot: SlotType = generateNewSlot(currentGroup.id)
    setCurrentGroup((prevGroup) => ({
      ...prevGroup,
      slots: [...prevGroup.slots, newSlot],
    }))
  }

  useEffect(() => {
    setGroups(nodeData.groups ?? [])
    setSubgroups(nodeData.groups.filter((g) => g.subgroup_to === group?.id) ?? [])
  }, [nodeData])

  const onSave = () => {
    if (
      !currentGroup.name ||
      !currentGroup.slots.every((slot) => slot.name && slot.group_id && slot.type && slot.value)
    ) {
      return n.add({
        type: "warning",
        title: "Warning",
        message: "All fields are required!",
      })
    } else {
      const newData = {
        ...nodeData,
        groups: is_create
          ? [
              ...groups.map((g: SlotsGroupType) => (g.id === parentGroup?.id ? parentGroup : g)),
              currentGroup,
            ]
          : groups.map((g: SlotsGroupType) =>
              g.id === currentGroup.id ? currentGroup : g.id === parentGroup?.id ? parentGroup : g
            ),
      }
      updateNodeData(data.id, newData)
      setData(() => newData)
    }
  }

  const onSaveHandler = () => {
    onSave()
    quietSaveFlows()
    closePopUp(id)
  }

  const onCloseHandler = () => {
    closePopUp(id)
  }

  const onDeleteTableGroupHandler = (group: SlotsGroupType, updatedGroups: SlotsGroupType[]) => {
    setCurrentGroup((prev) => ({
      ...prev,
      subgroups: updatedGroups.map((g) => g.id),
    }))
    setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, subgroup_to: "" } : g)))
  }

  useEffect(() => {
    if (!isSubGroup) {
      setParentGroup(null)
      setCurrentGroup({ ...currentGroup, subgroup_to: "" })
    }
  }, [isSubGroup])

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
          {groups.length >= (is_create ? 1 : 2) && (
            <div className='flex items-center gap-1.5 mt-1 h-8'>
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
                  mini
                  defaultValue={parentGroup?.name ?? ""}
                  onValueChange={(value) => {
                    const parent_group = nodeData.groups.find((g) => g.name === value)
                    if (parent_group) {
                      setParentGroup({
                        ...parent_group,
                        subgroups: [...(parent_group.subgroups ?? []), currentGroup.id],
                      })
                      setCurrentGroup({ ...currentGroup, subgroup_to: parent_group.id })
                    }
                  }}
                  placeholder='Select parent group'
                  className='w-1/3 h-8 min-h-8'
                  items={nodeData.groups
                    .filter((g) => g.id !== currentGroup.id)
                    .map((g) => ({ key: g.name, value: g.name }))}
                />
              )}
            </div>
          )}
        </div>
        {!is_create && subgroups.length > 0 && (
          <div className='mt-4'>
            <p className='text-sm font-medium mb-2'>Subgroups</p>
            <SlotsGroupsTable
              groups={subgroups}
              setGroups={setSubgroups}
              nodeData={nodeData}
              setNodeData={setNodeData}
              onDeleteGroupHandler={onDeleteTableGroupHandler}
            />
          </div>
        )}
        <div className='grid gap-4 mt-6'>
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
