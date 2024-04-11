import React, { useContext, useEffect, useMemo, useState } from "react"
import { conditionType, conditionTypeType } from "../../types/ConditionTypes"
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react"
import UsingLLMCondition from "./components/UsingLLMCondition"
import UsingLLMConditionSection from "./components/UsingLLMCondition"
import { HelpCircle, TrashIcon } from "lucide-react"
import { NodeDataType } from "../../types/NodeTypes"
import { useReactFlow } from "reactflow"
import { flowContext } from "../../contexts/flowContext"
import { useParams } from "react-router-dom"
import { generateNewConditionBase } from "../../utils"
import PythonCondition from "./components/PythonCondition"

type ConditionModalProps = {
  data: NodeDataType
  condition?: conditionType
  is_create?: boolean
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
}

type ConditionModalTab = "Using LLM" | "Slot filling" | "Button" | "Python code" | "Custom"

const ConditionModal = ({
  data,
  condition,
  is_create = false,
  isOpen,
  onClose,
  size = "3xl",
}: ConditionModalProps) => {
  const [selected, setSelected] = useState<conditionTypeType>(condition?.type ?? "python")
  const setSelectedHandler = (key: conditionTypeType) => {
    setCurrentCondition({ ...currentCondition, type: key })
    setSelected(key)
  }
  const [currentCondition, setCurrentCondition] = useState(
    is_create || !condition ? generateNewConditionBase(data.name) : condition
  )
  const [conditions, setConditions] = useState<conditionType[]>(data.conditions ?? [])
  const { getNode, setNodes, getNodes } = useReactFlow()
  const { saveFlows, updateFlow, flows } = useContext(flowContext)
  const { flowId } = useParams()

  // useEffect(() => {
  //   if (is_create) {
  //     const new_condition = generateNewConditionBase(data.name)
  //     setCurrentCondition(new_condition)
  //   }
  // }, [data.name, is_create, isOpen])

  const tabItems: {
    title: ConditionModalTab
    value: conditionTypeType
  }[] = useMemo(
    () => [
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
        title: "Python code",
        value: "python",
      },
      {
        title: "Custom",
        value: "custom",
      },
    ],
    []
  )

  useEffect(() => {
    console.log(currentCondition)
  }, [currentCondition])

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

  const saveCondition = () => {
    const nodes = getNodes()
    const node = getNode(data.id)
    const currentFlow = flows.find((flow) => flow.name === flowId)
    if (node && currentFlow) {
      const new_node = {
        ...node,
        data: {
          ...node.data,
          conditions: is_create
            ? [...node.data.conditions, currentCondition]
            : conditions.map((condition) =>
                condition.id === currentCondition.id ? currentCondition : condition
              ),
        },
      }
      console.log(node, new_node)
      setNodes(nodes.map((node) => (node.id === data.id ? new_node : node)))
      updateFlow(currentFlow)
    }
    onClose()
  }

  return (
    <Modal
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
              labelPlacement='outside'
              placeholder="Enter condition's name here"
              value={currentCondition.name}
              onChange={(e) => setCurrentCondition({ ...currentCondition, name: e.target.value })}
            />
          </div>
          <div>{bodyItems[selected]}</div>
        </ModalBody>
        <ModalFooter className='flex justify-between items-center'>
          <div className='flex items-center justify-start gap-2'>
            <Button
              isIconOnly
              className='rounded-full'>
              <HelpCircle />
            </Button>
            <Button
              className='hover:bg-red-500'
              isIconOnly>
              <TrashIcon />
            </Button>
          </div>
          <div>
            <Button
              onClick={saveCondition}
              className='bg-foreground text-background'>
              Save condition
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConditionModal