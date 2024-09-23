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
import { CustomModalProps, Modal, ModalBody, ModalFooter, ModalHeader } from "../ModalComponents"
import PythonCondition from "./components/PythonCondition"
import SlotCondition from "./components/SlotCondition"
import UsingLLMConditionSection from "./components/UsingLLMCondition"

export type ConditionModalContentType = {
  condition: conditionType
  setData: React.Dispatch<React.SetStateAction<conditionType>>
}

type ConditionModalProps = CustomModalProps & {
  data: DefaultNodeDataType
  condition?: conditionType
  is_create?: boolean
}

type ConditionModalTab = "Using LLM" | "Slot filling" | "Button" | "Python code" | "Custom"

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
  const [selected, setSelected] = useState<conditionTypeType>(condition?.type ?? "python")
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

  const validateConditionAction = () => {
    const reasons: string[] = []
    if (currentCondition.type === "python" && currentCondition.data.python?.action) {
      if (
        currentCondition.data.python?.action.includes("return") &&
        currentCondition.data.python?.action.includes("def") &&
        currentCondition.data.python?.action.includes("(ctx: Context, pipeline: Pipeline) -> bool:")
      ) {
        return {
          status: true,
          reason: "",
        }
      } else {
        if (!currentCondition.data.python?.action.includes("return")) {
          reasons.push("Missing return statement")
        }
        if (!currentCondition.data.python?.action.includes("def")) {
          reasons.push("Missing def statement")
        }
        if (
          !currentCondition.data.python?.action.includes(
            "(ctx: Context, pipeline: Pipeline) -> bool:"
          )
        ) {
          reasons.push("Missing condition statement")
        }
        return {
          status: false,
          reason: reasons.join("\n "),
        }
      }
    } else if (currentCondition.type === "python" && !currentCondition.data.python?.action) {
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
  }[] = useMemo(
    () => [
      {
        title: "Python code",
        value: "python",
      },
      {
        title: "Using LLM",
        value: "llm",
      },
      {
        title: "Slot filling",
        value: "slot",
      },
      {
        title: "Button",
        value: "button",
      },
      {
        title: "Custom",
        value: "custom",
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
        <SlotCondition
          condition={currentCondition}
          setData={setCurrentCondition}
        />
      ),
      button: <div>Button</div>,
      python: (
        <PythonCondition
          condition={currentCondition}
          setData={setCurrentCondition}
        />
      ),
      custom: <div>Custom</div>,
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
    // const nodes = getNodes()
    // const node = getNode(data.id)
    // const currentFlow = flows.find((flow) => flow.name === flowId)
    const validate_name: ValidateErrorType = validateConditionName(is_create)
    if (validate_name.status) {
      updateNodeData(data.id, {
        ...data,
        conditions: is_create
          ? [...data.conditions, currentCondition]
          : data.conditions.map((condition) =>
              condition.id === currentCondition.id ? currentCondition : condition
            ),
      })
      // const new_node: DefaultNodeType = {
      //   ...node,
      //   data: {
      //     ...node.data,
      //     conditions: is_create
      //       ? [...node.data.conditions, currentCondition]
      //       : data.conditions.map((condition) =>
      //           condition.id === currentCondition.id ? currentCondition : condition
      //         ),
      //   },
      // }
      // const new_nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
      // setNodes(() => new_nodes)
      quietSaveFlows()
      onCloseHandler()
      // setCurrentCondition(is_create || !condition ? generateNewConditionBase() : currentCondition)
    } else {
      if (!validate_name.status) {
        n.add({
          title: "Saving error!",
          message: `Condition name is not valid: \n ${validate_name.reason}`,
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
      conditions: data.conditions?.filter((condition) => condition.id !== currentCondition.id),
    })
    quietSaveFlows()
    // }
    onCloseHandler()
  }

  const handleConfirmDeleteOpen = () => {
    // Открываем модал для подтверждения удаления слота
    openPopUp(
      <AlertModal
        id='delete-condition'
        onAction={() => deleteCondition()} // Подтверждение удаления
        title='Delete condition'
        description={
          <>
            Are you sure you want to delete the condition{" "}
            <span className='text-sm bg-border rounded px-1'>{currentCondition?.name}</span>? This
            action cannot be undone.
          </>
        }
        actionText='Delete'
        cancelText='Cancel'
      />,
      "delete-condition"
    )
  }

  return (
    <Modal
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'>
      <ModalHeader>
        <div className='flex items-center gap-2'>
          {is_create ? <PlusCircleIcon /> : <EditPenIcon />}
          {is_create ? "Create condition" : "Edit condition"}
        </div>
      </ModalHeader>
      <ModalBody className='min-h-[480px]'>
        <label>
          <Tabs
            disabledKeys={["llm", "custom", "button"]}
            selectedKey={selected}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onSelectionChange={setSelectedHandler}
            items={tabItems}
            classNames={{
              tabList: "w-full",
              tab: "",
              cursor: "border border-contrast-border",
            }}
            className='bg-background w-full max-w-full'>
            {(item) => (
              <Tab
                key={item.value}
                title={item.title}
                onClick={() =>
                  setCurrentCondition({ ...currentCondition, type: item.value })
                }></Tab>
            )}
          </Tabs>
        </label>
        <div className='grid grid-cols-4 items-center gap-4 mt-4 mb-2'>
          <DefInput
            className='col-span-3'
            label='Name'
            variant='bordered'
            labelPlacement='outside'
            placeholder="Enter condition's name here"
            value={currentCondition.name}
            onChange={(e) => setCurrentCondition({ ...currentCondition, name: e.target.value })}
          />
          <DefInput
            label='Priority'
            variant='bordered'
            labelPlacement='outside'
            placeholder="Enter condition's priority here"
            type='number'
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
          <AnimatePresence mode='wait'>
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              {bodyItems[selected]}
            </motion.div>
          </AnimatePresence>
          {selected === "python" && (
            <div
              className='grid transition-all duration-150 overflow-hidden'
              style={{
                gridTemplateRows: lintStatus ? "1fr" : "0fr",
              }}>
              <div className='min-h-0 transition-all duration-150'>
                <p
                  className={classNames(
                    "text-xs p-2 mt-2 rounded-lg font-mono",
                    lintStatus?.status == "error"
                      ? "bg-[var(--condition-test-error)]"
                      : "bg-[var(--condition-test-success)]"
                  )}>
                  {lintStatus?.status == "ok" ? "Condition test passed!" : lintStatus?.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className='flex justify-between items-center'>
        <div className='flex items-center justify-start gap-2'>
          <Button
            isIconOnly
            className='rounded-full'>
            <HelpCircle />
          </Button>
          {!is_create && (
            <Button
              onClick={handleConfirmDeleteOpen}
              className='hover:bg-red-500'
              isIconOnly>
              <TrashIcon />
            </Button>
          )}
        </div>
        <div className='flex items-end gap-2'>
          <Button
            data-testid='test-condition-button'
            onClick={testCondition}
            isLoading={testConditionPending}
            className=''>
            Test condition
          </Button>
          <Button
            data-testid='save-condition-button'
            onClick={saveCondition}
            className='bg-foreground text-background'>
            Save condition
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default ConditionModal
