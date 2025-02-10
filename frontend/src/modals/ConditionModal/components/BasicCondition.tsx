import { ConditionModalContentType } from "../ConditionModal"
import { useState } from "react"
import DefSelect from "@/UI/Input/DefSelect"
import DefInput from "@/UI/Input/DefInput"
import { Checkbox, Button } from "@nextui-org/react"
import DefTextarea from "@/UI/Input/DefTextarea"
import _ from "lodash"

interface IFlags {
 ignoreCase: boolean
}

interface IDefObject {
 text?: string
 flags?: IFlags
 children?: IDefObject[] | IDefObject
 [key: string]: any
 id?: string
}

const genDefObject = (key: string): IDefObject | undefined => {
 const parameters = {
  priority: 1,
  transition_type: "manual",
 }

 switch (key) {
  case "Exact match":
   return {
    parameters,
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
    text: "",
    flags: { ignoreCase: false },
   }
  case "Not":
   return { structure: "not", not: {} }
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
 priority: number
 transition_type: string
 Title?: string
}

const getValue = (state: IState, id: string | number): IDefObject => {
 if (state.structure === "Any of" || state.structure === "All of") {
  const data: IDefObject = state.data.filter(
   (item: IDefObject) => item.id === id
  )[0]
  return data.structure === "not" ? data.not : data
 }
 return (state.data as IDefObject) || ""
}
const mapping: IMapping = {
 "Exact match": (setState, state, id) => {
  const pading = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${pading}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => {
      if (state.structure === "Any of" || state.structure === "All of") {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "not"
          ? { ...item, not: { ...item.not, text: value } }
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
  const pading = id === undefined ? "py-[12px]" : ""

  return (
   <div className={`flex flex-col gap-[12px] ${pading}`}>
    <InputText
     value={getValue(state, id ?? "").text}
     defaultValue={""}
     setState={(value) => {
      if (state.structure === "Any of" || state.structure === "All of") {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "not"
          ? { ...item, not: { ...item.not, text: value } }
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
    <div className="flex items-center gap-2 px-3 py-3">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      type="checkbox"
      onValueChange={(value: boolean) => {
       if (state.structure === "Any of" || state.structure === "All of") {
        const newData: IDefObject[] = state.data.map((item: IDefObject) => {
         if (item.id === id) {
          return item.structure === "not"
           ? { ...item, not: { ...item.not, flags: { ignoreCase: value } } }
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
  const pading = id === undefined ? "py-[12px]" : ""
  return (
   <div className={`flex flex-col gap-[12px] ${pading}`}>
    <TextMasseg
     title={"Text"}
     text={"Message has to match exactly the text below"}
    />
    <DefTextarea
     value={getValue(state, id ?? "").text}
     className="pt-[6px] pb-[12px]"
     onValueChange={(value) => {
      if (state.structure === "Any of" || state.structure === "All of") {
       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return item.structure === "not"
          ? { ...item, not: { ...item.not, text: value } }
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
    <div className="flex items-center gap-2 px-3 py-3">
     <Checkbox
      isSelected={getValue(state, id ?? "").flags?.ignoreCase}
      onValueChange={(value) => {
       if (state.structure === "Any of" || state.structure === "All of") {
        const newData: IDefObject[] = state.data.map((item: IDefObject) => {
         if (item.id === id) {
          return item.structure === "not"
           ? { ...item, not: { ...item.not, flags: { ignoreCase: value } } }
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
  const arr = [
   { id: 1, name: "Exact match", disabled: false },
   { id: 2, name: "Include text" },
   { id: 3, name: "Regular expression", disabled: false },
   { id: 6, name: "Not" },
  ]

  return (
   <>
    <div className="flex flex-col gap-[24px] pl-[24px] py-[24px]">
     {state.data.map((el: IDefObject, index: number) => {
      if (el.structure === undefined) {
       return (
        <div className="flex flex-col gap-[12px]" key={index}>
         <p>Condition</p>
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

           const newState = { ...state, data: newData }
           setState(newState)

           if (value === "Exact match" || value === "Regular expression") {
            arr.map((group) =>
             group.name === value ? { ...group, disabled: true } : group
            )
           }
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
         <p>Condition</p>
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
 "All of": (setStae, state) => {
  return mapping["Any of"](setStae, state)
 },
 Not: (setState, state, id) => {
  const arr = [
   { id: 1, name: "Exact match" },
   { id: 2, name: "Include text" },
   { id: 3, name: "Regular expression" },
  ]

  const render = () => {
   const key: string =
    state.structure === "All of" || state.structure === "Any of"
     ? (state.data as IDefObject[]).filter(
        (item: IDefObject) => item.id === id
       )[0].not.name
     : (state.data as IDefObject).name

   return <>{mapping[key] && mapping[key](setState, state, id)}</>
  }

  const padding =
   state.structure === "Any of" ||
   state.structure === "All of" ||
   state.structure === "Not"
    ? "pl-[24px]"
    : ""

  return (
   <div className={`${padding} flex flex-col gap-[12px] py-[24px]`}>
    <p>Condition</p>
    <DefSelect
     mini
     className={`w-full`}
     onValueChange={(value) => {
      const defData = genDefObject(value)

      if (state.structure === "Any of" || state.structure === "All of") {
       const newCondition = { ...defData, name: value, id, test: true }

       const newData: IDefObject[] = state.data.map((item: IDefObject) => {
        if (item.id === id) {
         return { ...item, not: newCondition }
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
    {render()}
   </div>
  )
 },
}

const TextMasseg: React.FC<{ title: string; text: string }> = ({
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
 className?: string
}> = ({ setState, value = "", defaultValue = "", className = "" }) => {
 return (
  <div className="flex flex-col gap-[12px]">
   <TextMasseg
    title={"Text"}
    text={"Message has to match exactly the text below"}
   />
   <DefInput
    value={value}
    defaultValue={defaultValue}
    className={`col-span-3 ${className}`}
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
  priority: 1,
  transition_type: "manual",
  Title: condition.name,
  structure: "",
  data: [],
 }

 const [state, setStae] = useState(defaultState)

 const conditionGroups = [
  { id: 1, name: "Exact match", key: "ExactMatch" },
  { id: 2, name: "Include text", key: "includeText" },
  { id: 3, name: "Regular expression", key: "Regexp" },
  { id: 4, name: "Any of" },
  { id: 5, name: "All of" },
  { id: 6, name: "Not" },
 ]

 const TextConditions =
  state.structure === "All of" || state.structure === "Any of" ? (
   <p className="text-[10px] pt-[12px]">
    One of the conditions below has to be fulfilled
   </p>
  ) : null

 const isrRepetition = (key: string) => {
  if (state.structure === "Any of" || state.structure === "All of") {
   console.log(state.data?.map((item: IDefObject) => item.name).includes(key))
   return state.data?.map((item: IDefObject) => item.name).includes(key)
  }
  return false
 }

 return (
  <>
   <div className="pt-[24px]">
    <p className="pb-[12px]">Structure</p>
    <DefSelect
     mini
     className="w-full"
     defaultValue={state.structure}
     onValueChange={(value) => {
      const defData = genDefObject(value)

      if (value === "All of" || value === "Any of") {
       setStae({ ...state, structure: value, data: [] })
       return
      }

      if (defData) {
       setStae({ ...state, structure: value, data: defData })
      }
     }}
     items={conditionGroups.map((group) => ({
      value: group.name,
      key: group.id.toString(),
      disabled: isrRepetition(group.name),
     }))}
     placeholder="Choose group"
    />
    {TextConditions}
   </div>

   {mapping[state.structure] && mapping[state.structure](setStae, state)}
  </>
 )
}

export default BasicCondition
