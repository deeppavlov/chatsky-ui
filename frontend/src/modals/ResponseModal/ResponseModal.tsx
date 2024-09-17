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
import { useReactFlow } from "@xyflow/react"
import { useContext, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import ModalComponent from "../../components/ModalComponent"
import { flowContext } from "../../contexts/flowContext"
import { NotificationsContext } from "../../contexts/notificationsContext"
import { DefaultNodeDataType } from "../../types/NodeTypes"
import { responseType, responseTypeType } from "../../types/ResponseTypes"
import PythonResponse from "./components/PythonResponse"
import TextResponse from "./components/TextResponse"

type ResponseModalTab = "Using LLM" | "Python code" | "Custom" | "Text"

type ResponseModalProps = {
  data: DefaultNodeDataType
  setData: React.Dispatch<React.SetStateAction<DefaultNodeDataType>>
  response: responseType
  size?: ModalProps["size"]
  isOpen: boolean
  onClose: () => void
}

const ResponseModal = ({
  isOpen,
  onClose,
  data,
  setData,
  response,
  size = "3xl",
}: ResponseModalProps) => {
  const { getNode, setNodes, getNodes } = useReactFlow()
  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()
  const [selected, setSelected] = useState<responseTypeType>(response.type ?? "python")
  // const [nodeDataState, setNodeDataState] = useState(data)
  const [currentResponse, setCurrentResponse] = useState(response)
  const setSelectedHandler = (key: responseTypeType) => {
    setCurrentResponse({ ...currentResponse, type: key })
    setSelected(key)
  }
  const { notification: n } = useContext(NotificationsContext)

  const tabItems: {
    title: ResponseModalTab
    value: responseTypeType
  }[] = useMemo(
    () => [
      {
        title: "Python code",
        value: "python",
      },
      {
        title: "Text",
        value: "text",
      },
      {
        title: "Using LLM",
        value: "llm",
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
      text: (
        <TextResponse
          response={currentResponse}
          setData={setCurrentResponse}
        />
      ),
    }),
    [currentResponse]
  )

  const saveResponse = () => {
    if (!currentResponse.name) {
      return n.add({
        title: "Saving error!",
        message: "Response name is required!",
        type: "error",
      })
    }
    if (flows.some((flow) => flow.data.nodes.some((node) => (node.type === "default_node" && node.data.response.name === currentResponse.name && node.id !== data.id)))) {
      return n.add({
        title: "Saving error!",
        message: "Response name must be unique!",
        type: "error",
      })
    } else {
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
        setData({
          ...data,
          response: new_node.data.response
        })
        // currentFlow.data.nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
        // updateFlow(currentFlow)
        quietSaveFlows()
        onClose()
      }
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
              disabledKeys={['llm']}
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
              isRequired
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
