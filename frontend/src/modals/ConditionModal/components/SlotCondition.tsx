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
        slot: value
      }
    })
  }

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
      <div>
        <input type="text" value={condition.data.slot} onChange={(e) => changeConditionValue(e.target.value)} />
      </div>
    </div>
  )
}

export default SlotCondition
