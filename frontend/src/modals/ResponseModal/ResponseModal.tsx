import { Button, Input, ModalProps, Tab, Tabs } from '@nextui-org/react'
// import ModalComponent from "../../components/ModalComponent";
import { useReactFlow } from '@xyflow/react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import { responseType, responseTypeType } from '../../types/ResponseTypes'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import PythonResponse from './components/PythonResponse'
import TextResponse from './components/TextResponse'

type ResponseModalTab =
  | 'Using LLM'
  | 'Python code'
  | 'Custom'
  | 'Text'
  | 'Basic'

type ResponseModalProps = {
  data: DefaultNodeDataType
  setData: React.Dispatch<React.SetStateAction<DefaultNodeDataType>>
  response: responseType
  size?: ModalProps['size']
  isOpen: boolean
  onClose: () => void
}

const ResponseModal = ({
  isOpen,
  onClose,
  data,
  setData,
  response,
  size = '3xl',
}: ResponseModalProps) => {
  const { getNode, setNodes, getNodes } = useReactFlow()
  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()
  const [selected, setSelected] = useState<responseTypeType>(
    response.type ?? 'python',
  )
  // const [nodeDataState, setNodeDataState] = useState(data)
  const [currentResponse, setCurrentResponse] = useState(response)
  const setSelectedHandler = (key: responseTypeType) => {
    setCurrentResponse({ ...currentResponse, type: key })
    setSelected(key)
  }

  const [responseStor, setResponseStor] = useState({
    [response.type]: response,
  })

  useEffect(() => {
    const key = currentResponse.type
    setResponseStor({ ...responseStor, [key]: currentResponse })
  }, [currentResponse])

  const [errors, setErrors] = useState<{
    name?: { isInvalid: boolean; errorMessage: string }
  }>({})

  const tabItems: {
    title: ResponseModalTab
    value: responseTypeType
  }[] = useMemo(
    () => [
      {
        title: 'Python code',
        value: 'python',
      },
      {
        title: 'Text',
        value: 'text',
      },
      {
        title: 'Using LLM',
        value: 'llm',
      },
      {
        title: 'Basic',
        value: 'basic',
      },
    ],
    [],
  )

  const bodyItems = useMemo(
    () => ({
      llm: <div>llm</div>,
      python: (
        <PythonResponse
          response={currentResponse}
          setData={setCurrentResponse}
          responseStor={responseStor}
        />
      ),
      custom: <div>Custom</div>,
      text: (
        <TextResponse
          response={currentResponse}
          setData={setCurrentResponse}
          responseStor={responseStor}
        />
      ),
      basic: <div>Basic</div>,
    }),
    [currentResponse],
  )

  const saveResponse = () => {
    if (!currentResponse.name) {
      setErrors({
        ...errors,
        name: { isInvalid: true, errorMessage: 'Please fill every field' },
      })
      return
    }

    if (
      selected === 'python' &&
      currentResponse.name.replace(/[A-Za-z]/g, '') !== ''
    ) {
      setErrors({
        ...errors,
        name: {
          isInvalid: true,
          errorMessage: 'Please use Latin alphabet only',
        },
      })
      return
    }
    if (
      flows.some((flow) =>
        flow.data.nodes.some(
          (node) =>
            node.type === 'default_node' &&
            node.data.response.name === currentResponse.name &&
            node.id !== data.id,
        ),
      )
    ) {
      setErrors({
        ...errors,
        name: {
          isInvalid: true,
          errorMessage: 'Response name must be unique!',
        },
      })
      return
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
        const new_nodes = nodes.map((node) =>
          node.id === data.id ? new_node : node,
        )
        setNodes(() => new_nodes)
        setData({
          ...data,
          response: new_node.data.response,
        })
        // currentFlow.data.nodes = nodes.map((node) => (node.id === data.id ? new_node : node))
        // updateFlow(currentFlow)
        quietSaveFlows()
        onClose()
      }
    }
  }

  return (
    <Modal
      className='flex min-h-[584px] flex-col'
      size={size}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalHeader className='flex items-center gap-2'>
        Edit response
      </ModalHeader>
      <ModalBody className={'flex flex-1 flex-col gap-3 py-2'}>
        <label htmlFor=''>
          <Tabs
            disabledKeys={['llm', 'basic']}
            selectedKey={selected}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onSelectionChange={setSelectedHandler}
            items={tabItems}
            classNames={{
              tabList: 'w-full',
              tab: '',
              cursor: 'border border-contrast-border',
            }}
            className='w-full max-w-full bg-background'
          >
            {(item) => (
              <Tab
                key={item.value}
                title={item.title}
                onClick={() =>
                  setCurrentResponse({ ...currentResponse, type: item.value })
                }
              ></Tab>
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
            onChange={(e) => {
              setCurrentResponse({
                ...currentResponse,
                name: e.target.value.replace(/\s/g, ''),
              })
              setErrors((prevErrors) => ({
                ...prevErrors,
                name: { isInvalid: false, errorMessage: '' },
              }))
            }}
            {...errors.name}
          />
        </div>
        <div>{bodyItems[selected]}</div>
      </ModalBody>
      <ModalFooter>
        <Button
          onClick={saveResponse}
          className='bg-foreground text-background'
        >
          Save response
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ResponseModal
