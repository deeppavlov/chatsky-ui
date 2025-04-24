import { Button, Input, ModalProps, Switch, Tab, Tabs } from '@nextui-org/react'
import { useReactFlow } from '@xyflow/react'
import { PlusIcon } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import { responseType, responseTypeType } from '../../types/ResponseTypes'
import { validateResponseName } from '../../utils'
import AddButtonModals from '../AddButtonModals/AddButtonModals'
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
  isAddButtonOpen: boolean
  setIsAddButtonOpen: (isOpen: boolean) => void
}

const ResponseModal = ({
  isOpen,
  onClose,
  data,
  setData,
  response,
  isAddButtonOpen,
  setIsAddButtonOpen,
  size = '3xl',
}: ResponseModalProps) => {
  const { getNode, setNodes, getNodes, updateNodeData } = useReactFlow()
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

  const [hideButtons, setHideButtons] = useState(
    data.response.hideButtons ?? false,
  )

  const node = getNode(data.id)

  console.log(data.response, 'hideButtons')
  useEffect(() => {
    const key = currentResponse.type
    setResponseStor({ ...responseStor, [key]: currentResponse })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResponse])

  const [errors, setErrors] = useState<{
    isInvalid: boolean
    errorMessage: string
  }>({ isInvalid: false, errorMessage: '' })

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentResponse],
  )

  const saveResponse = () => {
    const name = currentResponse.name
    const errors = validateResponseName(name, selected, flows, data)

    if (errors.isInvalid) {
      setErrors(errors)
      return
    }

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

  const buttonsCondition = (
    node?.data as DefaultNodeDataType
  ).conditions.filter((condition) => condition.type === 'button')

  return (
    <Modal
      className='flex min-h-[584px] flex-col'
      size={size}
      isOpen={isOpen}
      onClose={onClose}
      data-testid='response-modal'
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
              console.log(e.target.value, 's')
              setCurrentResponse({
                ...currentResponse,
                name: e.target.value.replaceAll(' ', '_'),
              })
              setErrors({ isInvalid: false, errorMessage: '' })
            }}
            {...errors}
          />
        </div>
        <div>{bodyItems[selected]}</div>
      </ModalBody>
      <ModalFooter>
        <Switch
          className='mr-auto h-[20px]'
          isSelected={hideButtons}
          onValueChange={(value) => {
            updateNodeData(data.id, {
              ...node?.data,
              response: {
                ...(node?.data as DefaultNodeDataType).response,
                hideButtons: value,
              },
            })
            quietSaveFlows()
            setHideButtons(value)
          }}
        >
          <p className='text-[12px]'>Hide previous buttons</p>
        </Switch>

        <Button
          data-testid='add-button-button'
          onClick={() => setIsAddButtonOpen(true)}
        >
          {buttonsCondition.length === 0 ? (
            <>
              <PlusIcon />
              Add buttons
            </>
          ) : (
            <>Edit buttons</>
          )}
        </Button>
        <Button
          data-testid='save-response-button'
          onClick={saveResponse}
          className='bg-foreground text-background'
        >
          Save response
        </Button>
        {isAddButtonOpen && (
          <AddButtonModals
            data={data}
            isOpen={isAddButtonOpen}
            onClose={() => setIsAddButtonOpen(false)}
          />
        )}
      </ModalFooter>
    </Modal>
  )
}

export default ResponseModal
