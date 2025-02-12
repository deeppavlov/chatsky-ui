import { ConditionModalContentType } from "../ConditionModal"
import { useEffect, useState } from "react"
import DefSelect from "@/UI/Input/DefSelect"
import DefInput from "@/UI/Input/DefInput"
import { Checkbox, Button } from "@nextui-org/react"
import DefTextarea from "@/UI/Input/DefTextarea"
import _ from "lodash"
import DeleteBasicConditionIcon from "@/icons/nodes/conditions/deleteBasicConditionIcon"

interface IFlags {
 ignoreCase: boolean
}

interface IDefObject {
 text?: string
 flags?: IFlags
 data?: IDefObject[] | IDefObject | {}
 id?: string
 pattern?: string
 structure: string
}

const genDefObject = (key: string): IDefObject | undefined => {
 switch (key) {
  case "Exact match":
   return {
    structure: "exactMatch",
    text: "",
   }
  case "Include text":
   return {
    structure: "includeText",
    text: "",
    flags: { ignoreCase: false },
   }
  case "Regular expression":
   return {
    structure: "regExp",
    pattern: "",
    flags: { ignoreCase: false },
   }
  case "Any of":
   return { structure: "anyOf", data: [] }
  case "All of":
   return { structure: "allOf", data: [] }
  case "Not":
   return { structure: "not", data: {} }
  default:
   return undefined
 }
}

interface IMapping {
 [key: string]: (
  setState: (value: IState) => void,
  state: IState,
  id?: string | undefined
 ) => JSX.Element
}

interface IState {
 structure: string
 data?: IDefObject[]
 conditionGroups: {
  name: string
  key?: string
  disabled?: boolean
 }[]
}

const isAnyOrAll = (value: string): boolean =>
 value === "Any of" ||
 value === "All of" ||
 value === "allOf" ||
 value === "anyOf"

const getValue = (state: IState, id: string): IDefObject => {
 if (isAnyOrAll(state.structure)) {
  const data: IDefObject = state.data!.filter(
   (item: IDefObject) => item.id === id
  )[0]
  return data.structure === "not" ? data.data : data
 }
 return state.structure !== "not" ? (state as IDefObject) : state.data
}

const handleValueChange = (
 setState: (value: IState) => void,
 state: IState,
 id: string | undefined,
 value: string,
 field: string
) => {
 if (id === undefined) {
  state.structure === "not"
   ? setState({ ...state, data: { ...state.data, [field]: value } })
   : setState({ ...state, [field]: value })
  return
 }

 const newData: IDefObject[] = state.data.map((item: IDefObject) => {
  if (item.id === id) {
   return item.structure === "not"
    ? { ...item, data: { ...item.data, [field]: value } }
    : { ...item, [field]: value }
  }
  return item
 })
 setState({ ...state, data: newData })
 return
}

const handleValueChangeCheckbox = (
 setState: (value: IState) => void,
 state: IState,
 id: string | undefined,
 value: boolean
) => {
 if (id === undefined) {
  state.structure === "not"
   ? setState({
      ...state,
      data: { ...state.data, flags: { ignoreCase: value } },
     })
   : setState({
      ...state,
      flags: { ignoreCase: value },
     })
  return
 }

 const newData: IDefObject[] = state.data.map((item: IDefObject) => {
  if (item.id === id) {
   return item.structure === "not"
    ? { ...item, data: { ...item.data, flags: { ignoreCase: value } } }
    : { ...item, flags: { ignoreCase: value } }
  }
  return item
 })
 setState({ ...state, data: newData })
}

const conditionGroups = [
 { name: "Exact match", key: "exactMatch", disabled: false },
 { name: "Include text", key: "includeText" },
 { name: "Regular expression", key: "regExp", disabled: false },
 { name: "Any of", key: "anyOf" },
 { name: "All of", key: "allOf" },
 { name: "Not", key: "not" },
]

const getNameCondition = (key: string) => {
 const condition = conditionGroups.filter((condition) => condition.key === key)
 return condition.length === 0 ? "" : condition[0].name
}

const mapping: IMapping = {
 exactMatch: (setState, state, id = undefined) => {
  const padding = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => handleValueChange(setState, state, id, value, "text")}
    />
   </div>
  )
 },
 includeText: (setState, state, id) => {
  const padding = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => handleValueChange(setState, state, id, value, "text")}
    />
    <div className="flex items-center gap-2 pl-[12px] pt-[12px]">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      type="checkbox"
      onValueChange={(value) =>
       handleValueChangeCheckbox(setState, state, id, value)
      }
     />
     <label className="text-sm font-medium"> Case sensitive </label>
    </div>
   </div>
  )
 },
 regExp: (setState, state, id) => {
  const padding = id === undefined ? "py-[12px]" : ""
  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <TextMessage
     title={"Pattern"}
     text={"Message has to match exactly the text below"}
    />
    <DefTextarea
     value={getValue(state, id ?? "").pattern}
     onValueChange={(value) =>
      handleValueChange(setState, state, id, value, "pattern")
     }
    />
    <div className="flex items-center gap-2 pl-[12px] pt-[12px]">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      onValueChange={(value) =>
       handleValueChangeCheckbox(setState, state, id, value)
      }
     />
     <label className="text-sm font-medium"> Case sensitive </label>
    </div>
   </div>
  )
 },
 anyOf: (setState, state) => {
  const arr = state.conditionGroups.filter(
   (condition) => condition.key !== "anyOf" && condition.key !== "allOf"
  )

  return (
   <>
    <div className="flex flex-col gap-[24px] pl-[24px] py-[24px]">
     {state.data!.map((el: IDefObject, index: number) => {
      if (el.structure === undefined) {
       return (
        <div className="flex flex-col gap-[12px]" key={index}>
         <div className="flex flex items-center justify-between">
          <p>Condition</p>
          <button
           onClick={() => {
            const newData = state.data!.filter(
             (item: IDefObject) => item.id !== el.id
            )
            setState({ ...state, data: newData })
           }}
          >
           <DeleteBasicConditionIcon />
          </button>
         </div>
         <DefSelect
          key={index}
          mini
          className="w-full"
          onValueChange={(value: string) => {
           const defData = genDefObject(value)

           const newCondition = { ...defData, id: el.id }

           const newData = state.data!.map((item: IDefObject) => {
            if (item.id === el.id) {
             return newCondition
            }
            return item
           })

           const conditionGroups = state.conditionGroups.map((condition) => {
            if (
             condition.name === value &&
             condition.hasOwnProperty("disabled")
            ) {
             return { ...condition, disabled: true }
            }
            return condition
           })

           const newState = { ...state, conditionGroups, data: newData }
           setState(newState)
          }}
          items={arr.map((group, index) => ({
           value: group.name,
           key: index.toString(),
           disabled: group.disabled,
          }))}
          placeholder="Choose group"
         />
        </div>
       )
      }
      if (el.structure !== undefined) {
       return (
        <div className="flex flex-col gap-[12px]" key={index}>
         <div className="flex flex items-center justify-between">
          <p>Condition</p>
          <button
           onClick={() => {
            const newData = state.data!.filter(
             (item: IDefObject) => item.id !== el.id
            )

            const conditionGroups = state.conditionGroups.map((condition) => {
             const isDisabled =
              condition.name === el.name && condition.hasOwnProperty("disabled")
             return isDisabled ? { ...condition, disabled: false } : condition
            })

            setState({
             ...state,
             data: newData,
             conditionGroups,
            })
           }}
          >
           <DeleteBasicConditionIcon />
          </button>
         </div>
         <DefSelect
          key={index}
          defaultValue={getNameCondition(el.structure)}
          mini
          className="w-full"
          onValueChange={(value: string) => {
           const defData = genDefObject(value)

           const newCondition = { ...defData, id: el.id }

           const newData = state.data!.map((item: IDefObject) => {
            if (item.id === el.id) {
             return newCondition
            }
            return item
           })

           const conditionGroups = state.conditionGroups.map((condition) => {
            const isDisabled =
             condition.name === el.name && condition.hasOwnProperty("disabled")
            return isDisabled ? { ...condition, disabled: false } : condition
           })
           console.log(value, "dsdasdasdsadas")
           const newState = { ...state, data: newData }
           setState(newState)
          }}
          items={arr.map((group, index) => ({
           value: group.name,
           key: index.toString(),
           disabled: group.disabled,
          }))}
          placeholder="Choose group"
         />
         {mapping[el.structure](setState, state, el.id)}
        </div>
       )
      }
      return null
     })}
    </div>
    <Button
     data-testid="add-condition-button"
     onClick={() =>
      Array.isArray(state.data) &&
      setState({
       ...state,
       data: [...state.data, { structure: undefined, id: _.uniqueId() }],
      })
     }
     className="bg-foreground text-background my-3"
    >
     + Add condition
    </Button>
    <p className="text-sm">Regular expressions tutorial ↗</p>
   </>
  )
 },
 allOf: (setState, state) => {
  return mapping["anyOf"](setState, state)
 },
 not: (setState, state, id) => {
  const arr = [
   { id: 1, name: "Exact match" },
   { id: 2, name: "Include text" },
   { id: 3, name: "Regular expression" },
  ]

  const key: string = isAnyOrAll(state.structure)
   ? state.data!.filter((data: IDefObject) => data.id === id)[0].data.structure
   : state.data!.structure

  const padding =
   isAnyOrAll(state.structure) || state.structure === "not" ? "pl-[24px]" : ""

  return (
   <div className={`${padding} flex flex-col gap-[12px] pt-[24px]`}>
    <div className="flex flex items-center justify-between">
     <p>Condition</p>
    </div>
    <DefSelect
     mini
     defaultValue={getNameCondition(key)}
     className={`w-full`}
     onValueChange={(value) => {
      const defData = genDefObject(value)

      if (isAnyOrAll(state.structure)) {
       const newCondition = { ...defData, id }

       const newData: IDefObject[] = state.data!.map((item: IDefObject) => {
        if (item.id === id) {
         return { ...item, data: newCondition }
        }
        return item
       })

       setState({ ...state, data: newData })
       return
      }

      const newState = { ...state, data: { ...defData } }
      setState(newState)
     }}
     items={arr.map((group) => ({
      value: group.name,
      key: group.id.toString(),
     }))}
     placeholder="Choose group"
    />
    {mapping[key] && mapping[key](setState, state, id)}
   </div>
  )
 },
}

const TextMessage: React.FC<{ title: string; text: string }> = ({
 title,
 text,
}) => {
 return (
  <div className="">
   <p>{title}</p>
   <p className="text-[12px]">{text}</p>
  </div>
 )
}

const InputText: React.FC<{
 setState: (value: string) => void
 defaultValue?: string
 value?: string
}> = ({ setState, value = "", defaultValue = "" }) => {
 return (
  <div className="flex flex-col gap-[12px]">
   <TextMessage
    title={"Text"}
    text={"Message has to match exactly the text below"}
   />
   <DefInput
    value={value}
    defaultValue={defaultValue}
    className="col-span-3"
    variant="bordered"
    labelPlacement="outside"
    placeholder="Enter text..."
    onChange={(e) => setState(e.target.value)}
   />
  </div>
 )
}

const BasicCondition = ({ condition, setData }: ConditionModalContentType) => {
 const defaultState: IState = {
  structure: condition.data.structure,
  data: condition.data.data,
  conditionGroups: conditionGroups,
 }

 const [state, setState] = useState(defaultState)

 useEffect(() => {
  const { python: pythonIgnored, ...newCondition } = condition.data

  if (state.structure === "not") {
   const { conditionGroups: conditionGroupsIgnored, ...newState } = state
   const result = { ...condition, data: { ...newCondition, ...newState } }
   setData(result)
   return
  }

  if (isAnyOrAll(state.structure)) {
   const { conditionGroups: conditionGroupsIgnored, ...newState } = state
   const result = { ...condition, data: { ...newCondition, ...newState } }
   console.log(result, "result")
   setData(result)
   return
  }

  const {
   conditionGroups: conditionGroupsIgnored,
   data: dataIgnored,
   ...newState
  } = state
  const result = { ...condition, data: { ...newCondition, ...newState } }
  setData(result)
 }, [state])

 const TextConditions = isAnyOrAll(state.structure) ? (
  <p className="text-[10px] pt-[12px]">
   One of the conditions below has to be fulfilled
  </p>
 ) : null

 return (
  <>
   <div className="pt-[24px]">
    <div className="flex flex items-center justify-between pb-[12px]">
     <p className="">Structure</p>
    </div>

    <DefSelect
     mini
     className="w-full"
     defaultValue={getNameCondition(state.structure)}
     onValueChange={(value) => {
      const defObject = genDefObject(value)

      if (isAnyOrAll(value)) {
       setState({ ...defaultState, ...defObject })
       return
      }

      if (value === "not") {
       setState({ ...defaultState, ...defObject })
       return
      }

      setState({
       conditionGroups: state.conditionGroups,
       ...defObject,
      })
     }}
     items={state.conditionGroups.map((group, index) => ({
      value: group.name,
      key: index.toString(),
      disabled: group.disabled,
     }))}
     placeholder="Choose group"
    />
    {TextConditions}
   </div>
   {mapping[state.structure] && mapping[state.structure](setState, state)}
  </>
 )
}

export default BasicCondition
