import { Button, Input } from "@nextui-org/react"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { conditionType } from "../../../types/ConditionTypes"

function ConditionRow({ cnd }: { cnd: conditionType }) {
  const [priority, setPriority] = useState(cnd.data.priority)
  console.log(cnd)

  return (
    <div
      key={cnd.id}
      className='grid grid-cols-3 gap-4 py-1 px-4 items-center border-t border-collapse'>
      <div> {cnd.name} </div>
      <div>
        <Input
          classNames={{
            inputWrapper: "h-6 w-3/4",
          }}
          size='sm'
          type='number'
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value={priority}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={(e) => setPriority(e.target.value)}
        />
      </div>
      <div>
        <Button
          size='sm'
          isIconOnly>
          <Trash2Icon />
        </Button>
      </div>
    </div>
  )
}

export default ConditionRow
