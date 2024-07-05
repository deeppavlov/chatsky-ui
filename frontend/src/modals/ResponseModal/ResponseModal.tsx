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
import { useContext, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useReactFlow } from "reactflow"
import ModalComponent from "../../components/ModalComponent"
import { flowContext } from "../../contexts/flowContext"
import { NodeDataType } from "../../types/NodeTypes"
import { responseType, responseTypeType } from "../../types/ResponseTypes"
import PythonResponse from "./components/PythonResponse"

type ResponseModalTab = "Using LLM" | "Python code" | "Custom"

type ResponseModalProps = {
  data: NodeDataType
  response: responseType
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
}

const ResponseModal = ({ isOpen, onClose, data, response, size = "3xl" }: ResponseModalProps) => {
  const { getNode, setNodes, getNodes } = useReactFlow()
  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()
  const [selected, setSelected] = useState<responseTypeType>("python")
  // const [nodeDataState, setNodeDataState] = useState(data)
  const [currentResponse, setCurrentResponse] = useState(response)
  const setSelectedHandler = (key: responseTypeType) => {
    setCurrentResponse({ ...currentResponse, type: key })
    setSelected(key)
  }

  const tabItems: {
    title: ResponseModalTab
    value: responseTypeType
  }[] = useMemo(
    () => [
      {
        title: "Using LLM",
        value: "llm",
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

  const bodyItems = useMemo(
    () => ({
      llm: <div>llm</div>,
      python: (
        <PythonResponse
          response={currentResponse}
          setData={setCurrentResponse}
        />
      ),
      custom: <div>Custom</div>,
      text: <div>text</div>,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentResponse]
  )

  const saveResponse = () => {
    const nodes = getNodes()
    const node = getNode(data.id)
    const currentFlow = flows.find((flow) => flow.name === flowId)
    if (node && currentFlow) {
      const new_node = {
        ...node,
        data: {
          ...node.data,
          response: currentResponse,
        },
      }
      const new_nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
      setNodes(() => new_nodes)
      // currentFlow.data.nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
      // updateFlow(currentFlow)
      quietSaveFlows()
      onClose()
    }
  }

  return (
    <ModalComponent
      className='min-h-[584px]'
      size={size}
      isOpen={isOpen}
      onClose={onClose}>
      <ModalContent>
        <ModalHeader> Edit response </ModalHeader>
        <ModalBody>
          <label htmlFor=''>
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
                    setCurrentResponse({ ...currentResponse, type: item.value })
                  }></Tab>
              )}
            </Tabs>
          </label>
          <div>
            <Input
              label='Name'
              variant='bordered'
              labelPlacement='outside'
              placeholder="Enter response's name here"
              value={currentResponse.name}
              onChange={(e) => setCurrentResponse({ ...currentResponse, name: e.target.value })}
            />
          </div>
          <div>{bodyItems[selected]}</div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={saveResponse}
            className='bg-foreground text-background'>
            Save response
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalComponent>
  )
}

export default ResponseModal
