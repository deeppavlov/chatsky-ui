import { Button } from "@nextui-org/react"
import { useEffect, useState } from "react"
import DefTextarea from "../../../UI/Input/DefTextarea"
import EditPenIcon from "../../../icons/EditPenIcon"
import TrashIcon from "../../../icons/TrashIcon"
import { SlotType } from "../../../types/FlowTypes"
import DefInput from "../../../UI/Input/DefInput"

type SlotItemType = {
 slot: SlotType
 setSlots: (updatedSlot: SlotType) => void
 onDelete: (slotId: string) => void
 is_create_modal?: boolean
}

const SlotItem = ({
 slot,
 setSlots,
 onDelete,
 is_create_modal,
}: SlotItemType) => {
 const [name, setName] = useState<string>(slot.name ?? "")
 const [type, setType] = useState<"RegexpSlot" | "">(slot.type ?? "")
 const [method, setMethod] = useState<string>(slot.method ?? "")
 const [value, setValue] = useState<string>(slot.value ?? "")
 const [index, setIndex] = useState<number>(0)

 useEffect(() => {
  setSlots({
   ...slot,
   name,
   type,
   method,
   value,
  })
 }, [name, type, method, value])

 return (
  <div className="my-1">
   <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2 mb-2">
     <EditPenIcon />
     <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="bg-transparent focus:outline-none focus:placeholder:text-transparent"
      type="text"
      placeholder="New slot"
     />
    </div>
    {!is_create_modal && (
     <Button
      onClick={() => onDelete(slot.id)}
      isIconOnly
      variant="ghost"
      className="border-none min-w-8 min-h-8 w-8 h-8 cursor-pointer"
      radius="sm"
      color="danger"
     >
      <TrashIcon className="stroke-foreground" />
     </Button>
    )}
   </div>
   <div className="grid grid-cols-2 gap-2">
    {/* <DefSelect
          defaultValue={type}
          onValueChange={(value) => setType(value as "RegexpSlot" | "")}
          items={[{ value: "RegexpSlot", key: "RegexpSlot" }]}
          placeholder='Select slot type'
        />
        <DefSelect
          defaultValue={method}
          onValueChange={(value) => setMethod(value)}
          items={[{ value: "Method1", key: "Method1" }]}
          placeholder='Select slot method'
        /> */}
    <DefTextarea
     value={value}
     onValueChange={setValue}
     className="col-span-2"
     isMultiline
     label="Slot value"
     placeholder={`Enter slot regexp\ne.g. ([a-zA-Z]+)`}
    />
    {value.length !== 0 && (
     <div className="group flex gap-2 flex-col-2 w-full col-span-2 items-center pt-2">
      <p style={{ flexShrink: 0 }}>Match group index =</p>
      <DefInput min={0} value={index.toString()} onValueChange={(value) => setIndex(Number(value))} type="number" />
     </div>
    )}
   </div>
  </div>
 )
}

export default SlotItem
