import { useEffect } from "react"
import { ConditionModalContentType } from "../ConditionModal"

const SlotCondition = ({ condition, setData }: ConditionModalContentType) => {

  useEffect(() => {
    if (!condition.data.slot) {
      setData({
        ...condition,
        type: "slot",
        data: {
          ...condition.data,
          slot: {
            slot_id: "",
          }
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   if (condition.data.python?.action) {
  //     setData({
  //       ...condition,
  //       type: "python",
  //       data: {
  //         ...condition.data,
  //         python: {
  //           action: `${firstString}\n${condition.data.python.action.split("\n").slice(1).join("\n")}`,
  //         },
  //       },
  //     })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [condition.name])


  return (
    <div>
      <div></div>
    </div>
  )
}

export default SlotCondition
