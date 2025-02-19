import ButtonConditionIcon from "@/icons/nodes/conditions/ButtonConditionIcon"
import CodeConditionIcon from "@/icons/nodes/conditions/CodeConditionIcon"
import CustomConditionIcon from "@/icons/nodes/conditions/CustomConditionIcon"
import LLMConditionIcon from "@/icons/nodes/conditions/LLMConditionIcon"
import SlotsConditionIcon from "@/icons/nodes/conditions/SlotsConditionIcon"
import { Button, Tab, Tabs } from "@nextui-org/react"
import { Edge, useReactFlow } from "@xyflow/react"
import classNames from "classnames"
import { AnimatePresence, motion } from "framer-motion"
import { HelpCircle, PlusCircleIcon, TrashIcon } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { lint_service } from "../../api/services"
import { flowContext } from "../../contexts/flowContext"
import { NotificationsContext } from "../../contexts/notificationsContext"
import { PopUpContext } from "../../contexts/popUpContext"
import EditPenIcon from "../../icons/EditPenIcon"
import { conditionType, conditionTypeType } from "../../types/ConditionTypes"
import { AppNode, DefaultNodeDataType } from "../../types/NodeTypes"
import DefInput from "../../UI/Input/DefInput"
import { generateNewConditionBase } from "../../utils"
import AlertModal from "../AlertModal"
import {
 CustomModalProps,
 Modal,
 ModalBody,
 ModalFooter,
 ModalHeader,
} from "../ModalComponents"
import PythonCondition from "./components/PythonCondition"
import SlotCondition from "./components/SlotCondition"
import UsingLLMConditionSection from "./components/UsingLLMCondition"
import BasicConditionIcon from "@/icons/nodes/conditions/BasicConditionIcon"
import BasicCondition from "./components/BasicCondition"

export type ConditionModalContentType = {
 condition: conditionType
 setData: React.Dispatch<React.SetStateAction<conditionType>>
}

type ConditionModalProps = CustomModalProps & {
 data: DefaultNodeDataType
 condition?: conditionType
 is_create?: boolean
}

type ConditionModalTab =
 | "Using LLM"
 | "Slot filling"
 | "Button"
 | "Python code"
 | "Custom"
 | "Basic"

type LintStatusType = {
 status: "ok" | "error"
 message: string
}

export type ValidateErrorType = {
 status: boolean
 reason: string
}

const ConditionModal = ({
 data,
 condition,
 is_create = false,
 id = "condition-modal",
}: ConditionModalProps) => {
 const { closePopUp, openPopUp } = useContext(PopUpContext)
 const { getNodes, updateNodeData } = useReactFlow<AppNode, Edge>()
 const { notification: n } = useContext(NotificationsContext)
 const { quietSaveFlows } = useContext(flowContext)
 const [selected, setSelected] = useState<conditionTypeType>(
  condition?.type ?? "python"
 )
 const [lintStatus, setLintStatus] = useState<LintStatusType | null>(null)
 const [testConditionPending, setTestConditionPending] = useState(false)

 const setSelectedHandler = (key: conditionTypeType) => {
  setCurrentCondition({ ...currentCondition, type: key })
  setSelected(key)
 }

 const [currentCondition, setCurrentCondition] = useState(
  is_create || !condition ? generateNewConditionBase() : condition
 )

 const validateConditionName = (is_create: boolean) => {
  const nodes = getNodes() as AppNode[]
  if (!is_create) {
   const is_name_valid = !nodes.some(
    (node: AppNode) =>
     node.type === "default_node" &&
     node.data.conditions.some(
      (c) => c.name === currentCondition.name && c.id !== currentCondition.id
     )
   )
   if (!is_name_valid) {
    return {
     status: false,
     reason: "Name must be unique",
    }
   } else {
    return {
     status: true,
     reason: "",
    }
   }
  } else {
   const is_name_valid = !nodes.some(
    (node: AppNode) =>
     node.type === "default_node" &&
     node.data.conditions?.some((c) => c.name === currentCondition.name)
   )
   if (!is_name_valid) {
    return {
     status: false,
     reason: "Name must be unique",
    }
   } else {
    return {
     status: true,
     reason: "",
    }
   }
  }
 }

 interface ICondition {
  structure?: string
  text?: string
  pattern?: string
  data: {
   structure: string
   data?: ICondition[] | ICondition
   text?: string
   pattern?: string
  }
 }

 interface ValidationResult {
  status: boolean
  reason: string
 }

 const mapping: { [key: string]: string } = {
  exactMatch: "Exact match",
  includeText: "Include text",
  regExp: "Regular expression",
  anyOf: "Any of",
  allOf: "All of",
  not: "Not",
 }
 const validateConditionBasic = (condition: ICondition): ValidationResult => {
  const reasons: string[] = []

  const validateBasicCondition = (basicCondition: ICondition) => {
   const subStructure = basicCondition.structure
    ? mapping[basicCondition.structure]
    : ""
   if (basicCondition.text === "") {
    reasons.push(
     `Text field in ${mapping[structure]} => ${subStructure} is not filled`
    )
   }
   if (basicCondition.pattern === "") {
    reasons.push(
     `Pattern field in ${mapping[structure]} => ${subStructure} is not filled`
    )
   }
   if (basicCondition.structure === "") {
    reasons.push(
     `Structure in ${mapping[structure]} => ${subStructure} cannot be empty`
    )
   }
   if (basicCondition.structure === "not") {
    const subStructure = mapping[basicCondition.data.structure]

    if (basicCondition.data.text === "") {
     reasons.push(
      `Text field in ${mapping[structure]} => Not => ${subStructure}is not filled`
     )
    }
    if (basicCondition.data.pattern === "") {
     reasons.push(
      `Pattern field in ${mapping[structure]} => Not => ${subStructure} is not filled`
     )
    }
    if (Object.keys(basicCondition.data).length === 0) {
     reasons.push(
      `Structure in ${mapping[structure]} => Not => cannot be empty`
     )
    }
   }
  }

  const validateNestedConditions = (
   conditions: ICondition[],
   structure: string
  ) => {
   if (conditions.length === 0) {
    reasons.push(`${mapping[structure]} must have child conditions`)
   }
   conditions.forEach((basicCondition) => {
    validateBasicCondition(basicCondition)
   })
  }

  const { structure = "", data, text, pattern } = condition.data

  if (structure === "") {
   reasons.push("Select the structure of the basic condition")
  }

  if (structure === "anyOf" || structure === "allOf") {
   if (data) {
    validateNestedConditions(data as ICondition[], structure)
   }
  }

  if (structure === "not") {
   const value = data as ICondition

   const subStructure = value.structure ? mapping[value.structure] : ""
   if (value.text === "") {
    reasons.push(
     `Text field in ${mapping[structure]} => ${subStructure} is not filled`
    )
   }
   if (value.pattern === "") {
    reasons.push(
     `Pattern field in ${mapping[structure]} => ${subStructure} is not filled`
    )
   }
   if (Object.keys(value).length === 0) {
    reasons.push(`Structure in ${mapping[structure]} cannot be empty`)
   }
  }

  if (
   structure === "exactMatch" ||
   structure === "includeText" ||
   structure === "regExp"
  ) {
   if (text === "") {
    reasons.push(`Text field in ${mapping[structure]} is not filled`)
   }
   if (pattern === "") {
    reasons.push(`Pattern field in ${mapping[structure]} is not filled`)
   }
  }

  const result: ValidationResult = {
   status: reasons.length === 0,
   reason: reasons.join("\n "),
  }

  return result
 }

 const validateConditionAction = () => {
  const reasons: string[] = []
  if (
   currentCondition.type === "python" &&
   currentCondition.data.python?.action
  ) {
   if (
    currentCondition.data.python?.action.includes("return") &&
    currentCondition.data.python?.action.includes("class") &&
    currentCondition.data.python?.action.includes("(BaseCondition):")
   ) {
    return {
     status: true,
     reason: "",
    }
   } else {
    if (!currentCondition.data.python?.action.includes("return")) {
     reasons.push("Missing return statement")
    }
    if (!currentCondition.data.python?.action.includes("class")) {
     reasons.push("Missing def statement")
    }
    if (!currentCondition.data.python?.action.includes("(BaseCondition):")) {
     reasons.push("Missing condition statement")
    }
    return {
     status: false,
     reason: reasons.join("\n "),
    }
   }
  } else if (
   currentCondition.type === "python" &&
   !currentCondition.data.python?.action
  ) {
   return {
    status: false,
    reason: "Missing action",
   }
  } else if (currentCondition.type !== "python") {
   return {
    status: true,
    reason: "",
   }
  }
  return {
   status: false,
   reason: "Validation error",
  }
 }

 const tabItems: {
  title: ConditionModalTab
  value: conditionTypeType
  icon: JSX.Element
 }[] = useMemo(
  () => [
   {
    title: "Python code",
    value: "python",
    icon: <CodeConditionIcon className="size-5" />,
   },
   {
    title: "Basic",
    value: "basic",
    icon: <BasicConditionIcon className="size-5" />,
   },
   {
    title: "Using LLM",
    value: "llm",
    icon: <LLMConditionIcon className="size-5" />,
   },
   {
    title: "Slot filling",
    value: "slot",
    icon: <SlotsConditionIcon className="size-5" />,
   },
   {
    title: "Button",
    value: "button",
    icon: <ButtonConditionIcon className="size-5" />,
   },
   {
    title: "Custom",
    value: "custom",
    icon: <CustomConditionIcon className="size-5" />,
   },
  ],
  []
 )

 const bodyItems = useMemo(
  () => ({
   llm: (
    <UsingLLMConditionSection
     condition={currentCondition}
     setData={setCurrentCondition}
    />
   ),
   slot: (
    <SlotCondition condition={currentCondition} setData={setCurrentCondition} />
   ),
   button: <div>Button</div>,
   python: (
    <PythonCondition
     condition={currentCondition}
     setData={setCurrentCondition}
    />
   ),
   custom: <div>Custom</div>,
   basic: (
    <BasicCondition
     condition={currentCondition}
     setData={setCurrentCondition}
    />
   ),
  }),
  [currentCondition]
 )

 const lintCondition = async () => {
  setLintStatus(null)
  if (currentCondition.type === "python") {
   try {
    const res = await lint_service(currentCondition.data.python?.action ?? "")
    setLintStatus(res)
    return res
   } catch (error) {
    console.log(error)
   }
  } else {
   return true
  }
 }

 const testCondition = async () => {
  setTestConditionPending(() => true)
  if (currentCondition.type === "python") {
   const lint = await lintCondition()
   const validate_action = validateConditionAction()
   if (lint && validate_action.status) {
    setTestConditionPending(() => false)
    return true
   } else {
    if (!validate_action.status) {
     setLintStatus(() => ({
      status: "error",
      message: validate_action.reason,
     }))
    }
    setTestConditionPending(() => false)
    return false
   }
  } else {
   setTestConditionPending(() => false)
   return true
  }
 }

 useEffect(() => {
  setLintStatus(() => null)
 }, [selected])

 const onCloseHandler = () => {
  closePopUp(id)
 }

 const saveCondition = () => {
  const validate_name: ValidateErrorType = validateConditionName(is_create)
  const validate_basic: ValidateErrorType =
   currentCondition.type === "basic"
    ? validateConditionBasic(currentCondition as ICondition)
    : { status: true, reason: "" }

  if (validate_name.status && validate_basic.status) {
   updateNodeData(data.id, {
    ...data,
    conditions: is_create
     ? [...data.conditions, currentCondition]
     : data.conditions.map((condition) =>
        condition.id === currentCondition.id ? currentCondition : condition
       ),
   })
   quietSaveFlows()
   onCloseHandler()
  } else {
   if (!validate_name.status) {
    n.add({
     title: "Saving error!",
     message: `Condition name is not valid: \n ${validate_name.reason}`,
     type: "error",
    })
   }
   if (!validate_basic.status) {
    n.add({
     title: "Saving error!",
     message: `Condition is not valid: \n ${validate_basic.reason}`,
     type: "error",
    })
   }
  }
 }

 const deleteCondition = () => {
  // const nodes = getNodes()
  // const node = getNode(data.id)
  // const currentFlow = flows.find((flow) => flow.name === flowId)
  // if (node && node.type === "default_node" && currentFlow) {
  // const new_node: DefaultNodeType = {
  //   ...node,
  //   data: {
  //     ...node.data,
  //     conditions: data.conditions?.filter((condition) => condition.id !== currentCondition.id),
  //   },
  // }
  // const new_nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
  // setNodes(() => new_nodes)
  updateNodeData(data.id, {
   ...data,
   conditions: data.conditions?.filter(
    (condition) => condition.id !== currentCondition.id
   ),
  })
  quietSaveFlows()
  // }
  onCloseHandler()
 }

 const handleConfirmDeleteOpen = () => {
  // Открываем модал для подтверждения удаления слота
  openPopUp(
   <AlertModal
    id="delete-condition"
    onAction={() => deleteCondition()} // Подтверждение удаления
    title="Delete condition"
    description={
     <>
      Are you sure you want to delete the condition{" "}
      <span className="text-sm bg-border rounded px-1">
       {currentCondition?.name}
      </span>
      ? This action cannot be undone.
     </>
    }
    actionText="Delete"
    cancelText="Cancel"
   />,
   "delete-condition"
  )
 }

 return (
  <Modal isOpen={true} onClose={onCloseHandler} size="3xl">
   <ModalHeader>
    <div className="flex items-center gap-2">
     {is_create ? <PlusCircleIcon /> : <EditPenIcon />}
     {is_create ? "Create condition" : "Edit condition"}
    </div>
   </ModalHeader>
   <ModalBody className="min-h-[480px]">
    <label>
     <Tabs
      disabledKeys={["llm", "custom", "button"]}
      selectedKey={selected}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onSelectionChange={setSelectedHandler}
      items={tabItems}
      classNames={{
       tabList: "w-full bg-table-background",
       tab: "",
       cursor: "border border-contrast-border",
      }}
      className="bg-background w-full max-w-full"
     >
      {(item) => (
       <Tab
        key={item.value}
        title={
         <div className="flex items-center gap-1 text-sm">
          {item.icon} {item.title}
         </div>
        }
        onClick={() =>
         setCurrentCondition({ ...currentCondition, type: item.value })
        }
       ></Tab>
      )}
     </Tabs>
    </label>
    <div className="grid grid-cols-4 items-center gap-4 mt-4 mb-2">
     <DefInput
      className="col-span-3"
      label="Name"
      variant="bordered"
      labelPlacement="outside"
      placeholder="Enter condition's name here"
      value={currentCondition.name}
      onChange={(e) =>
       setCurrentCondition({
        ...currentCondition,
        name: e.target.value.replace(/\s/g, ""),
       })
      }
     />
     <DefInput
      label="Priority"
      variant="bordered"
      labelPlacement="outside"
      placeholder="Enter condition's priority here"
      type="number"
      value={currentCondition.data.priority.toString()}
      onChange={(e) =>
       setCurrentCondition({
        ...currentCondition,
        data: {
         ...currentCondition.data,
         priority: parseInt(e.target.value),
        },
       })
      }
     />
    </div>
    <div>
     <AnimatePresence mode="wait">
      <motion.div
       key={selected}
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
      >
       {bodyItems[selected]}
      </motion.div>
     </AnimatePresence>
     {selected === "python" && (
      <div
       className="grid transition-all duration-150 overflow-hidden"
       style={{
        gridTemplateRows: lintStatus ? "1fr" : "0fr",
       }}
      >
       <div className="min-h-0 transition-all duration-150">
        <p
         className={classNames(
          "text-xs p-2 mt-2 rounded-lg font-mono",
          lintStatus?.status == "error"
           ? "bg-[var(--condition-test-error)]"
           : "bg-[var(--condition-test-success)]"
         )}
        >
         {lintStatus?.status == "ok"
          ? "Condition test passed!"
          : lintStatus?.message}
        </p>
       </div>
      </div>
     )}
    </div>
   </ModalBody>
   <ModalFooter className="flex justify-between items-center">
    <div className="flex items-center justify-start gap-2">
     <Button isIconOnly className="rounded-full">
      <HelpCircle />
     </Button>
     {!is_create && (
      <Button
       onClick={handleConfirmDeleteOpen}
       className="hover:bg-red-500"
       isIconOnly
      >
       <TrashIcon />
      </Button>
     )}
    </div>
    <div className="flex items-end gap-2">
     <Button
      data-testid="test-condition-button"
      onClick={testCondition}
      isLoading={testConditionPending}
      className=""
     >
      Test condition
     </Button>
     <Button
      data-testid="save-condition-button"
      onClick={saveCondition}
      className="bg-foreground text-background"
     >
      Save condition
     </Button>
    </div>
   </ModalFooter>
  </Modal>
 )
}

export default ConditionModal
