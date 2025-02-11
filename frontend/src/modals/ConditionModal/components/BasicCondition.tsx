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
 children?: IDefObject[] | IDefObject
 [key: string]: any
 id?: string
 pattern?: string
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
  case "Not":
   return { structure: "Not", Not: {} }
  default:
   return undefined
 }
}

interface IMapping {
 [key: string]: (
  setState: (value: IState) => void,
  state: IState,
  id?: string | number
 ) => JSX.Element
}

interface IState {
 structure: string
 data: IDefObject[] | IDefObject
 conditionGroups: {
  id: number
  name: string
  key?: string
  disabled?: boolean
 }[]
}

const isAnyOrAll = (value: string): boolean =>
 value === "Any of" || value === "All of"

const getValue = (state: IState, id: string | number): IDefObject => {
 if (isAnyOrAll(state.structure)) {
  const data: IDefObject = state.data.filter(
   (item: IDefObject) => item.id === id
  )[0]
  return data.structure === "Not" ? data.Not : data
 }
 return (state.data as IDefObject) || ""
}

const mapping: IMapping = {
 "Exact match": (setState, state, id) => {
  const padding = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => {
      if (isAnyOrAll(state.structure)) {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "Not"
          ? { ...item, Not: { ...item.Not, text: value } }
          : { ...item, text: value }
        }
        return item
       })
       setState({ ...state, data: newData })
       return
      }
      setState({ ...state, data: { ...state.data, text: value } })
     }}
    />
   </div>
  )
 },
 "Include text": (setState, state, id) => {
  const padding = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => {
      if (isAnyOrAll(state.structure)) {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "Not"
          ? { ...item, Not: { ...item.Not, text: value } }
          : { ...item, text: value }
        }
        return item
       })
       setState({ ...state, data: newData })
       return
      }
      setState({ ...state, data: { ...state.data, text: value } })
     }}
    />
    <div className="flex items-center gap-2 pl-[12px] pt-[12px]">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      type="checkbox"
      onValueChange={(value: boolean) => {
       if (isAnyOrAll(state.structure)) {
        const newData: IDefObject[] = state.data.map((item: IDefObject) => {
         if (item.id === id) {
          return item.structure === "Not"
           ? { ...item, Not: { ...item.Not, flags: { ignoreCase: value } } }
           : { ...item, flags: { ignoreCase: value } }
         }
         return item
        })
        setState({ ...state, data: newData })
        return
       }
       setState({
        ...state,
        data: { ...state.data, flags: { ignoreCase: value } },
       })
      }}
     />
     <label className="text-sm font-medium"> Case sensitive </label>
    </div>
   </div>
  )
 },
 "Regular expression": (setState, state, id) => {
  const padding = id === undefined ? "py-[12px]" : ""
  return (
   <div className={`flex flex-col gap-[12px] ${padding}`}>
    <TextMessage
     title={"Pattern"}
     text={"Message has to match exactly the text below"}
    />
    <DefTextarea
     value={getValue(state, id ?? "").pattern}
     className=""
     onValueChange={(value) => {
      if (isAnyOrAll(state.structure)) {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "Not"
          ? { ...item, Not: { ...item.Not, pattern: value } }
          : { ...item, pattern: value }
        }
        return item
       })
       setState({ ...state, data: newData })
       return
      }
      setState({ ...state, data: { ...state.data, pattern: value } })
     }}
    />
    <div className="flex items-center gap-2 pl-[12px] pt-[12px]">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      onValueChange={(value) => {
       if (isAnyOrAll(state.structure)) {
        const newData: IDefObject[] = state.data.map((item: IDefObject) => {
         if (item.id === id) {
          return item.structure === "Not"
           ? { ...item, Not: { ...item.Not, flags: { ignoreCase: value } } }
           : { ...item, flags: { ignoreCase: value } }
         }
         return item
        })
        setState({ ...state, data: newData })
        return
       }
       setState({
        ...state,
        data: { ...state.data, flags: { ignoreCase: value } },
       })
      }}
     />
     <label className="text-sm font-medium"> Case sensitive </label>
    </div>
   </div>
  )
 },
 "Any of": (setState, state) => {
  const arr = state.conditionGroups.filter(
   (condition) => condition.name !== "Any of" && condition.name !== "All of"
  )

  return (
   <>
    <div className="flex flex-col gap-[24px] pl-[24px] py-[24px]">
     {state.data.map((el: IDefObject, index: number) => {
      if (el.structure === undefined) {
       return (
        <div className="flex flex-col gap-[12px]" key={index}>
         <div className="flex flex items-center justify-between">
          <p>Condition</p>
          <button
           onClick={() => {
            const newData = state.data.filter(
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

           const newCondition = { ...defData, name: value, id: el.id }

           const newData = state.data.map((item: IDefObject) => {
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
          items={arr.map((group) => ({
           value: group.name,
           key: group.id.toString(),
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
            console.log(el)
            const newData = state.data.filter(
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
          defaultValue={el.name}
          mini
          className="w-full"
          onValueChange={(value: string) => {
           const defData = genDefObject(value)

           const newCondition = { ...defData, name: value, id: el.id }

           const newData = state.data.map((item: IDefObject) => {
            if (item.id === el.id) {
             return newCondition
            }
            return item
           })

           const newState = { ...state, data: newData }
           setState(newState)
          }}
          items={arr.map((group) => ({
           value: group.name,
           key: group.id.toString(),
           disabled: group.disabled,
          }))}
          placeholder="Choose group"
         />
         {mapping[el.name](setState, state, el.id)}
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
 "All of": (setState, state) => {
  return mapping["Any of"](setState, state)
 },
 Not: (setState, state, id) => {
  const arr = [
   { id: 1, name: "Exact match" },
   { id: 2, name: "Include text" },
   { id: 3, name: "Regular expression" },
  ]

  const currentCondition: IDefObject = state.data.filter(
   (data: IDefObject) => data.id === id
  )[0]

  const key: string =
   state.structure === "All of" || state.structure === "Any of"
    ? currentCondition.Not.name
    : (state.data as IDefObject).name

  const padding =
   isAnyOrAll(state.structure) || state.structure === "Not" ? "pl-[24px]" : ""

  return (
   <div className={`${padding} flex flex-col gap-[12px] pt-[24px]`}>
    <div className="flex flex items-center justify-between">
     <p>Condition</p>
    </div>
    <DefSelect
     mini
     defaultValue={key}
     className={`w-full`}
     onValueChange={(value) => {
      const defData = genDefObject(value)

      if (isAnyOrAll(state.structure)) {
       const newCondition = { ...defData, name: value, id }

       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return { ...item, Not: newCondition }
        }
        return item
       })

       setState({ ...state, data: newData })
       return
      }

      const newState = { ...state, data: { ...defData, name: value } }
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
 const conditionGroups = [
  { id: 1, name: "Exact match", key: "ExactMatch", disabled: false },
  { id: 2, name: "Include text", key: "includeText" },
  { id: 3, name: "Regular expression", key: "Regexp", disabled: false },
  { id: 4, name: "Any of" },
  { id: 5, name: "All of" },
  { id: 6, name: "Not" },
 ]

 const key = condition.type

 const isBasic = condition.data[key] !== undefined

 const defaultState: IState = {
  structure: isBasic ? condition.data[key].structure : "",
  data: isBasic ? condition.data[key].data : [],
  conditionGroups: conditionGroups,
 }

 const [state, setState] = useState(defaultState)

 console.log(condition)

 useEffect(() => {
  const structure = state.structure
  const newData = state.data

  const result = {
   ...condition,
   data: {
    ...condition.data,
    basic: { structure, data: Array.isArray(newData) ? [...newData] : newData },
   },
  }
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
     defaultValue={state.structure}
     onValueChange={(value) => {
      const defData = genDefObject(value)

      if (isAnyOrAll(value)) {
       setState({ ...state, structure: value, data: [] })
       return
      }

      if (defData) {
       setState({ ...state, structure: value, data: defData })
      }
     }}
     items={state.conditionGroups.map((group) => ({
      value: group.name,
      key: group.id.toString(),
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
