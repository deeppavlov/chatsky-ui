import { Button, Input } from "@nextui-org/react"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"
import { conditionType } from "../../../types/ConditionTypes"

function ConditionRow({
  cnd,
  deleteConditionFn,
}: {
  cnd: conditionType
  deleteConditionFn: (id: string) => void
}) {
  const [priority, setPriority] = useState(cnd.data.priority)

  const changeConditionPriorityHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    if (
      (RegExp(/^[0-9]+$/).test(e.target.value) || e.target.value === "") &&
      Number(e.target.value) < 100 &&
      Number(e.target.value) > 0
    ) {
      setPriority(Number(e.target.value))
      cnd.data.priority = Number(e.target.value)
    }
  }

  const deleteConditionHandler = () => {
    deleteConditionFn(cnd.id)
  }

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
          onChange={changeConditionPriorityHandler}
        />
      </div>
      <div>
        <Button
          onClick={deleteConditionHandler}
          size='sm'
          isIconOnly>
          <Trash2Icon />
        </Button>
      </div>
    </div>
  )
}

export default ConditionRow
