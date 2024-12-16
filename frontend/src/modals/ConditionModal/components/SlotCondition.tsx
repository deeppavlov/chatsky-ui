import SearchIcon from "@/icons/SearchIcon"
import DefCombobox from "@/UI/Input/DefCombobox"
import { TableCell, TableRow } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"
import { flowContext } from "../../../contexts/flowContext"
import { SlotType } from "../../../types/FlowTypes"
import DefSelect from "../../../UI/Input/DefSelect"
import DefTable from "../../../UI/Table/DefTable"
import { ConditionModalContentType } from "../ConditionModal"

const SlotCondition = ({ condition, setData }: ConditionModalContentType) => {
  const { groups: _groups } = useContext(flowContext)

  const [groups, setGroups] = useState(_groups)
  const [slots, setSlots] = useState<SlotType[]>(groups.flatMap((group) => group.slots))
  const [selectedSlot, setSelectedSlot] = useState(
    slots.find((slot) => slot.id === condition.data.slot)?.name ?? ""
  )
  const [selectedGroup, setSelectedGroup] = useState(
    groups.find(
      (group) => group.id === slots.find((slot) => slot.id === condition.data.slot)?.group_id
    )?.name ?? ""
  )

  useEffect(() => {
    if (!condition.data.slot) {
      setData({
        ...condition,
        type: "slot",
        data: {
          ...condition.data,
          slot: "",
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeConditionValue = (value: string) => {
    setData({
      ...condition,
      type: "slot",
      data: {
        ...condition.data,
        slot: value,
      },
    })
  }

  useEffect(() => {
    if (selectedSlot) {
      const slot = slots.find((s) => s.name === selectedSlot)
      if (slot) {
        setSelectedGroup(
          groups.find((g) => g.slots.some((s) => s.id === slot.id))?.name ?? "group name error"
        )
        changeConditionValue(slot.id)
      }
    }
  }, [groups, selectedSlot, slots])


  return (
    <div>
      <div>
        {/* <DefCombobox items={slots} selected={selectedSlot} setSelected={setSelectedSlot} /> */}
        <DefCombobox
          startContent={<SearchIcon stroke='var(--input-border)' />}
          selected={selectedSlot}
          setSelected={setSelectedSlot}
          items={slots.map((slot) => slot.name)}
          placeholder='Search slot name'
        />
        <p className='my-2.5 text-sm'>The following slot will be filled for future use:</p>
        <DefTable headers={["Parameter", "Value"]}>
          <TableRow className='h-12'>
            <TableCell className='w-1/2'>Group</TableCell>
            <TableCell className='w-1/2'>
              <DefSelect
                mini
                className='w-3/4 min-h-8 h-8'
                defaultValue={selectedGroup}
                onValueChange={(value) => setSelectedGroup(value)}
                items={groups.map((group) => ({ value: group.name, key: group.id }))}
                placeholder="Choose group"
              />
            </TableCell>
          </TableRow>
          <TableRow className='h-12'>
            <TableCell className='w-1/2'>Slot</TableCell>
            <TableCell className='w-1/2'>
              <DefSelect
                mini
                className='w-3/4 min-h-8 h-8'
                defaultValue={selectedSlot}
                disabled={!selectedGroup}
                items={slots
                  .filter(
                    (slot) => slot.group_id === groups.find((g) => g.name === selectedGroup)?.id
                  )
                  .map((slot) => ({
                    key: slot.id,
                    value: slot.name,
                  }))}
                  placeholder="Choose slot"
                  onValueChange={(value) => setSelectedSlot(value)}
              />
            </TableCell>
          </TableRow>
        </DefTable>
      </div>
    </div>
  )
}

export default SlotCondition
