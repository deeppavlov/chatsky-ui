import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Tab,
  Tabs,
} from "@nextui-org/react"
import classNames from "classnames"
import { HelpCircle, TrashIcon } from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useReactFlow } from "reactflow"
import { lint_service } from "../../api/services"
import ModalComponent from "../../components/ModalComponent"
import { flowContext } from "../../contexts/flowContext"
import { notificationsContext } from "../../contexts/notificationsContext"
import { conditionType, conditionTypeType } from "../../types/ConditionTypes"
import { NodeDataType, NodeType } from "../../types/NodeTypes"
import { generateNewConditionBase } from "../../utils"
import PythonCondition from "./components/PythonCondition"
import UsingLLMConditionSection from "./components/UsingLLMCondition"

type ConditionModalProps = {
  data: NodeDataType
  condition?: conditionType
  is_create?: boolean
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
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
  isOpen,
  onClose,
  size = "3xl",
}: ConditionModalProps) => {
  const [selected, setSelected] = useState<conditionTypeType>(condition?.type ?? "python")
  const [lintStatus, setLintStatus] = useState<LintStatusType | null>(null)
  const [testConditionPending, setTestConditionPending] = useState(false)
  const setSelectedHandler = (key: conditionTypeType) => {
    setCurrentCondition({ ...currentCondition, type: key })
    setSelected(key)
  }

  const { getNode, setNodes, getNodes } = useReactFlow()
  const { notification: n } = useContext(notificationsContext)
  const { updateFlow, flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()

  const [currentCondition, setCurrentCondition] = useState(
    is_create || !condition ? generateNewConditionBase() : condition
  )

  const validateConditionName = (is_create: boolean) => {
    const nodes = getNodes() as NodeType[]
    if (!is_create) {
      const is_name_valid = !nodes.some((node: NodeType) =>
        node.data.conditions?.some(
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
      const is_name_valid = !nodes.some((node: NodeType) =>
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
      slot: <div>Slot filling</div>,
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

  // useEffect(() => {
  //   console.log(currentCondition)
  // }, [currentCondition])

  const lintCondition = async () => {
    setLintStatus(null)
    if (currentCondition.type === "python") {
      try {
        const res = await lint_service(currentCondition.data.python?.action ?? "")
        console.log(res)
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
      console.log(lint)
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

  const saveCondition = () => {
    const nodes = getNodes()
    const node = getNode(data.id)
    const currentFlow = flows.find((flow) => flow.name === flowId)
    const validate_name: ValidateErrorType = validateConditionName(is_create)
    if (validate_name.status) {
      if (node && currentFlow) {
        const new_node = {
          ...node,
          data: {
            ...node.data,
            conditions: is_create
              ? [...node.data.conditions, currentCondition]
              : data.conditions?.map((condition) =>
                  condition.id === currentCondition.id ? currentCondition : condition
                ),
          },
        }
        const new_nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
        setNodes(() => new_nodes)
        // currentFlow.data.nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
        // updateFlow(currentFlow)
        quietSaveFlows()
      }
      onClose()
      setCurrentCondition(
        is_create || !condition ? generateNewConditionBase() : currentCondition
      )
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
    const nodes = getNodes()
    const node = getNode(data.id)
    const currentFlow = flows.find((flow) => flow.name === flowId)
    if (node && currentFlow) {
      const new_node = {
        ...node,
        data: {
          ...node.data,
          conditions: data.conditions?.filter((condition) => condition.id !== currentCondition.id),
        },
      }
      const new_nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
      setNodes(() => new_nodes)
      // currentFlow.data.nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
      // updateFlow(currentFlow)
      quietSaveFlows()
    }
    onClose()
  }

  return (
    <ModalComponent
      className='bg-background min-h-[584px]'
      motionProps={{ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } }}
      isOpen={isOpen}
      onClose={onClose}
      size={size}>
      <ModalContent>
        <ModalHeader>{is_create ? "Create condition" : "Edit condition"}</ModalHeader>
        <ModalBody>
          <label>
            <Tabs
              disabledKeys={["llm", "custom", "slot", "button"]}
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
          <div>
            <Input
              label='Name'
              variant="bordered"
              labelPlacement='outside'
              placeholder="Enter condition's name here"
              value={currentCondition.name}
              onChange={(e) => setCurrentCondition({ ...currentCondition, name: e.target.value })}
            />
          </div>
          <div>
            {bodyItems[selected]}
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
                      lintStatus?.status == "error" ? "bg-red-200" : "bg-green-200"
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
            <Button
              onClick={deleteCondition}
              className='hover:bg-red-500'
              isIconOnly>
              <TrashIcon />
            </Button>
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
      </ModalContent>
    </ModalComponent>
  )
}

export default ConditionModal
