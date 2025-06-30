import { Tabs, TabsList, TabsTrigger } from '@/UI/Tabs'
import { Button, Input, ModalProps, Switch } from '@nextui-org/react'
import { useReactFlow } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlusIcon } from 'lucide-react'
import { Key, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flowContext } from '../../contexts/flowContext'
import { DefaultNodeDataType } from '../../types/NodeTypes'
import {
  IInputError,
  ILLMResponseHandle,
  responseType,
  responseTypeType,
} from '../../types/ResponseTypes'
import { validateResponseName } from '../../utils'
import AddButtonModals from '../AddButtonModals/AddButtonModals'
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../ModalComponents'
import LLMResponse from './components/LLMResponse'
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

const tabItems: {
  title: ResponseModalTab
  value: responseTypeType
}[] = [
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
]

const ResponseModal = ({
  isOpen,
  onClose,
  data,
  setData,
  response,
  size = '3xl',
}: ResponseModalProps) => {
  const { getNode, setNodes, getNodes, updateNodeData } = useReactFlow()
  const { flows, quietSaveFlows } = useContext(flowContext)
  const { flowId } = useParams()

  const [selected, setSelected] = useState<responseTypeType>(
    response.type ?? 'python',
  )
  const [currentResponse, setCurrentResponse] = useState(response)
  const [isAddButtonOpen, setIsAddButtonOpen] = useState(false)
  const [responseStor, setResponseStor] = useState({
    [response.type]: response,
  })
  const [hideButtons, setHideButtons] = useState(
    data.buttonsData?.hideButtons ?? false,
  )
  const [nameError, setNameError] = useState<IInputError>({
    isInvalid: false,
    errorMessage: '',
  })
  const node = getNode(data.id)

  const setSelectedHandler = (key: Key) => {
    const type = key as responseTypeType
    setCurrentResponse({ ...currentResponse, type })
    setSelected(type)
  }

  useEffect(() => {
    const key = currentResponse.type
    setResponseStor({ ...responseStor, [key]: currentResponse })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResponse])

  const childRef = useRef<ILLMResponseHandle>(null)
  const disabledItemValues = ['basic']

  const bodyItems = useMemo(
    () => ({
      llm: (
        <LLMResponse
          ref={childRef}
          response={currentResponse}
          setData={setCurrentResponse}
          responseStor={responseStor}
          nameError={nameError}
          setNameError={setNameError}
        />
      ),
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
    [currentResponse, nameError],
  )

  const saveResponse = () => {
    const name = currentResponse.name
    const errors = validateResponseName(name, selected, flows, data.id)

    const childIsValid = childRef.current?.validate()

    setNameError(errors)
    if (errors.isInvalid || childIsValid === false) {
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
            className='w-full rounded-xl bg-bg-secondary p-1'
            value={selected}
            onValueChange={setSelectedHandler}
          >
            <TabsList className='!h-8 w-full'>
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.title}
                  value={item.value}
                  className='h-8'
                  disabled={disabledItemValues.includes(item.value)}
                  data-testid={`tab-${item.value}`}
                >
                  <div className='flex items-center gap-1 text-sm'>
                    {item.title}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </label>
        <AnimatePresence mode='wait'>
          <motion.div
            className={'flex flex-1 flex-col gap-3 py-2'}
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {selected !== 'llm' && (
              <div>
                <Input
                  label='Title'
                  variant='bordered'
                  labelPlacement='outside'
                  placeholder="Enter response's name here"
                  value={currentResponse.name}
                  onChange={(e) => {
                    setCurrentResponse({
                      ...currentResponse,
                      name: e.target.value.replaceAll(' ', '_'),
                    })
                    setNameError({ isInvalid: false, errorMessage: '' })
                  }}
                  {...nameError}
                />
              </div>
            )}
            <div className='h-0 flex-grow'>{bodyItems[selected]}</div>
          </motion.div>
        </AnimatePresence>
        {/* {bodyItems[selected]} */}
      </ModalBody>
      <ModalFooter>
        <Switch
          isDisabled={buttonsCondition.length !== 0}
          className='mr-auto h-[20px]'
          isSelected={hideButtons}
          onValueChange={(value) => {
            updateNodeData(data.id, {
              ...node?.data,
              buttonsData: {
                hideButtons: value,
                ...(node?.data as DefaultNodeDataType).buttonsData,
              },
            })
            quietSaveFlows()
            setHideButtons(value)
          }}
        >
          <p className='text-[12px]'>Show previous buttons</p>
        </Switch>

        <Button
          isDisabled={hideButtons}
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
