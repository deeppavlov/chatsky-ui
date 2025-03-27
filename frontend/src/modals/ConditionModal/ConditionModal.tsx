import BasicConditionIcon from '@/icons/nodes/conditions/BasicConditionIcon'
import ButtonConditionIcon from '@/icons/nodes/conditions/ButtonConditionIcon'
import CodeConditionIcon from '@/icons/nodes/conditions/CodeConditionIcon'
import CustomConditionIcon from '@/icons/nodes/conditions/CustomConditionIcon'
import LLMConditionIcon from '@/icons/nodes/conditions/LLMConditionIcon'
import SlotsConditionIcon from '@/icons/nodes/conditions/SlotsConditionIcon'
import { Button, Tab, Tabs } from '@nextui-org/react'
import { Edge, useReactFlow } from '@xyflow/react'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle, PlusCircleIcon, TrashIcon } from 'lucide-react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { lint_service } from '../../api/services'
import { flowContext } from '../../contexts/flowContext'
import { PopUpContext } from '../../contexts/popUpContext'
import EditPenIcon from '../../icons/EditPenIcon'
import {
  conditionType,
  conditionTypeType,
  ICondition,
} from '../../types/ConditionTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import DefInput from '../../UI/Input/DefInput'
import { generateNewConditionBase } from '../../utils'
import AlertModal from '../AlertModal'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'
import BasicCondition from './components/BasicCondition'
import PythonCondition from './components/PythonCondition'
import SlotCondition from './components/SlotCondition'
import UsingLLMConditionSection from './components/UsingLLMCondition'

export type ConditionModalContentType = {
  condition: conditionType
  setData: React.Dispatch<React.SetStateAction<conditionType>>
  ref?: { state: conditionType; setState: (data: conditionType) => void }
  error?: {
    group: boolean
    slot: boolean
    values: {
      group: string
      slot: string
    }
  }
  setError?: React.Dispatch<
    React.SetStateAction<{
      group: boolean
      slot: boolean
      values: {
        group: string
        slot: string
      }
    }>
  >
}

type ConditionModalProps = CustomModalProps & {
  data: DefaultNodeDataType
  condition?: conditionType
  is_create?: boolean
}

type ConditionModalTab =
  | 'Using LLM'
  | 'Slot filling'
  | 'Button'
  | 'Python code'
  | 'Custom'
  | 'Basic'

type LintStatusType = {
  status: 'ok' | 'error'
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
  id = 'condition-modal',
}: ConditionModalProps) => {
  const { closePopUp, openPopUp } = useContext(PopUpContext)
  const { getNodes, updateNodeData } = useReactFlow<AppNode, Edge>()
  const { quietSaveFlows } = useContext(flowContext)
  const [selected, setSelected] = useState<conditionTypeType>(
    condition?.type ?? 'python',
  )
  const [lintStatus, setLintStatus] = useState<LintStatusType | null>(null)
  const [testConditionPending, setTestConditionPending] = useState(false)

  const setSelectedHandler = (key: conditionTypeType) => {
    setCurrentCondition({ ...currentCondition, type: key })
    setSelected(key)
    setError({ isInvalid: false, errorMessage: '' })
  }

  const [currentCondition, setCurrentCondition] = useState(
    is_create || !condition ? generateNewConditionBase() : condition,
  )

  const [errorObject, setError] = useState({
    errorMessage: '',
    isInvalid: false,
  })

  const ref = useRef<{
    state: conditionType
    setState: (data: conditionType) => void
  }>()

  const refSlot = useRef<{
    state: conditionType
    setState: (data: { group: boolean; slot: boolean }) => void
  }>()

  const validateConditionName = (is_create: boolean) => {
    const nodes = getNodes() as AppNode[]
    if (!is_create) {
      const is_name_valid = !nodes.some(
        (node: AppNode) =>
          node.type === 'default_node' &&
          node.data.conditions.some(
            (c) =>
              c.name === currentCondition.name && c.id !== currentCondition.id,
          ),
      )
      if (!is_name_valid) {
        return {
          status: false,
          reason: 'Name must be unique',
        }
      } else {
        return {
          status: true,
          reason: '',
        }
      }
    } else {
      const is_name_valid = !nodes.some(
        (node: AppNode) =>
          node.type === 'default_node' &&
          node.data.conditions?.some((c) => c.name === currentCondition.name),
      )
      if (!is_name_valid) {
        return {
          status: false,
          reason: 'Name must be unique',
        }
      } else {
        return {
          status: true,
          reason: '',
        }
      }
    }
  }

  const validateConditionBasic = (condition: ICondition) => {
    const { data } = condition

    const arrError: boolean[] = []

    const isEmpty =
      data?.structure === '' || data?.text === '' || data?.pattern === ''
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error: _, ...res } = data as ICondition
    isEmpty ? (condition.data!.error = isEmpty) : (condition.data = res)
    arrError.push(isEmpty)

    if (data && data.structure === 'not') {
      const { error: _, ...res } = condition.data!.data as ICondition // eslint-disable-line @typescript-eslint/no-unused-vars

      const isEmpty =
        data.data!.structure === '' ||
        data.data!.text === '' ||
        data.data!.pattern === ''
      isEmpty
        ? (condition.data!.data!.error = isEmpty)
        : (condition.data!.data = res)
      arrError.push(isEmpty)
    }

    if (data && (data.structure === 'anyOf' || data.structure === 'allOf')) {
      const isEmptyCildren = (data.data as ICondition[]).length === 0
      const { error: _, ...res } = data as ICondition // eslint-disable-line @typescript-eslint/no-unused-vars

      if (isEmptyCildren) {
        isEmptyCildren
          ? (condition.data!.error = isEmptyCildren)
          : (condition.data = res)
        arrError.push(true)
      }
      const dataCondition = data.data as ICondition[]
      dataCondition.forEach((item: ICondition) => {
        if (item.structure === 'not') {
          const { error: _, ...res } = item.data as ICondition // eslint-disable-line @typescript-eslint/no-unused-vars
          const isEmpty =
            item.data!.structure === '' ||
            item.data!.text === '' ||
            item.data!.pattern === ''
          isEmpty ? (item.data!.error = isEmpty) : (item.data = res)
          arrError.push(isEmpty)
        }

        const isEmpty =
          item.structure === '' || item.text === '' || item.pattern === ''
        isEmpty ? (item.error = isEmpty) : (item = res)
        arrError.push(isEmpty)
      })
    }
    const status = !arrError.includes(true)
    return { condition, status }
  }

  const validateConditionAction = () => {
    const reasons: string[] = []
    if (
      currentCondition.type === 'python' &&
      currentCondition.data.python?.action
    ) {
      if (
        currentCondition.data.python?.action.includes('return') &&
        currentCondition.data.python?.action.includes('class') &&
        currentCondition.data.python?.action.includes('(BaseCondition):')
      ) {
        return {
          status: true,
          reason: '',
        }
      } else {
        if (!currentCondition.data.python?.action.includes('return')) {
          reasons.push('Missing return statement')
        }
        if (!currentCondition.data.python?.action.includes('class')) {
          reasons.push('Missing def statement')
        }
        if (
          !currentCondition.data.python?.action.includes('(BaseCondition):')
        ) {
          reasons.push('Missing condition statement')
        }
        return {
          status: false,
          reason: reasons.join('\n '),
        }
      }
    } else if (
      currentCondition.type === 'python' &&
      !currentCondition.data.python?.action
    ) {
      return {
        status: false,
        reason: 'Missing action',
      }
    } else if (currentCondition.type !== 'python') {
      return {
        status: true,
        reason: '',
      }
    }
    return {
      status: false,
      reason: 'Validation error',
    }
  }

  const tabItems: {
    title: ConditionModalTab
    value: conditionTypeType
    icon: JSX.Element
  }[] = useMemo(
    () => [
      {
        title: 'Python code',
        value: 'python',
        icon: <CodeConditionIcon className='size-5' />,
      },
      {
        title: 'Basic',
        value: 'basic',
        icon: <BasicConditionIcon className='size-5' />,
      },
      {
        title: 'Using LLM',
        value: 'llm',
        icon: <LLMConditionIcon className='size-5' />,
      },
      {
        title: 'Slot filling',
        value: 'slot',
        icon: <SlotsConditionIcon className='size-5' />,
      },
      {
        title: 'Button',
        value: 'button',
        icon: <ButtonConditionIcon className='size-5' />,
      },
      {
        title: 'Custom',
        value: 'custom',
        icon: <CustomConditionIcon className='size-5' />,
      },
    ],
    [],
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
          setData={(state, setState) => {
            if (setState) {
              refSlot.current = { state: { ...state }, setState }
            }
            setCurrentCondition(state)
          }}
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
      basic: (
        <BasicCondition
          condition={currentCondition}
          setData={(state, setState) => {
            ref.current = { state: { ...state }, setState }
            setCurrentCondition(state)
          }}
        />
      ),
    }),
    [currentCondition],
  )

  const lintCondition = async () => {
    setLintStatus(null)
    if (currentCondition.type === 'python') {
      try {
        const res = await lint_service(
          currentCondition.data.python?.action ?? '',
        )
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
    if (currentCondition.type === 'python') {
      const lint = await lintCondition()
      const validate_action = validateConditionAction()
      if (lint && validate_action.status) {
        setTestConditionPending(() => false)
        return true
      } else {
        if (!validate_action.status) {
          setLintStatus(() => ({
            status: 'error',
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

  useEffect(() => {
    if (currentCondition.name === '') {
      setError({ isInvalid: true, errorMessage: 'Please fill every field' })
    }

    if (currentCondition.name !== '') {
      setError({ isInvalid: false, errorMessage: '' })
    }
    if (!validateConditionName(is_create)) {
      setError({ isInvalid: false, errorMessage: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCondition.name])
  const onCloseHandler = () => {
    closePopUp(id)
  }

  const isValidCurrentCondition = () => {
    if (currentCondition.type === 'python') {
      return currentCondition.name.replace(/[A-Za-z_]|(?!^)[0-9]/g, '') === ''
    }
    if (currentCondition.type === 'basic') {
      const newState = validateConditionBasic(currentCondition)

      if (!newState.status && ref.current?.setState) {
        ref.current.setState(newState.condition.data as conditionType)
      }
      return newState.status
    }
    if (currentCondition.type === 'slot') {
      if (currentCondition.data.slot === '' && refSlot.current?.setState) {
        refSlot.current.setState({ group: true, slot: true })
        return false
      }
      return true
    }
  }

  const saveCondition = () => {
    const validate_name: ValidateErrorType = validateConditionName(is_create)

    if (validate_name.status && isValidCurrentCondition()) {
      updateNodeData(data.id, {
        ...data,
        conditions: is_create
          ? [...data.conditions, currentCondition]
          : data.conditions.map((condition) =>
              condition.id === currentCondition.id
                ? currentCondition
                : condition,
            ),
      })
      quietSaveFlows()
      onCloseHandler()
    } else {
      if (!validate_name.status) {
        setError({ isInvalid: true, errorMessage: 'Name must be unique' })
      }
      if (currentCondition.type === 'python') {
        const text = currentCondition.name.replace(/[A-Za-z_]|(?!^)[0-9]/g, '')
        text.trim() === ''
          ? null
          : setError({
              errorMessage:
                'Please use only Latin letters. Names cannot start with a number.',
              isInvalid: true,
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
        (condition) => condition.id !== currentCondition.id,
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
        id='delete-condition'
        onAction={() => deleteCondition()} // Подтверждение удаления
        title='Delete condition'
        description={
          <>
            Are you sure you want to delete the condition{' '}
            <span className='rounded bg-border px-1 text-sm'>
              {currentCondition?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        actionText='Delete'
        cancelText='Cancel'
      />,
      'delete-condition',
    )
  }

  return (
    <Modal
      data-tesid='condition-modal'
      isOpen={true}
      onClose={onCloseHandler}
      size='3xl'
      data-testid='condition-modal'
    >
      <ModalHeader>
        <div className='flex items-center gap-2'>
          {is_create ? <PlusCircleIcon /> : <EditPenIcon />}
          {is_create ? 'Create condition' : 'Edit condition'}
        </div>
      </ModalHeader>
      <ModalBody className='min-h-[480px]'>
        <label>
          <Tabs
            disabledKeys={['llm', 'custom', 'button']}
            selectedKey={selected}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onSelectionChange={setSelectedHandler}
            items={tabItems}
            classNames={{
              tabList: 'w-full bg-table-background',
              tab: '',
              cursor: 'border border-contrast-border',
            }}
            className='w-full max-w-full bg-background'
          >
            {(item) => (
              <Tab
                data-testid={`tab-${item.value}`}
                key={item.value}
                title={
                  <div className='flex items-center gap-1 text-sm'>
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
        <div className='mb-2 mt-4 grid grid-cols-4 gap-4'>
          <DefInput
            className='col-span-3'
            label='Name'
            variant='bordered'
            labelPlacement='outside'
            placeholder="Enter condition's name here"
            value={currentCondition.name}
            onChange={(e) =>
              setCurrentCondition({
                ...currentCondition,
                name: e.target.value.replaceAll(' ', '_'),
              })
            }
            data-testid='condition-name'
            {...errorObject}
          />
          <DefInput
            label='Priority'
            variant='bordered'
            labelPlacement='outside'
            placeholder="Enter condition's priority here"
            type='number'
            min={0}
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
            data-testid='condition-priority'
          />
        </div>
        <div>
          <AnimatePresence mode='wait'>
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {bodyItems[selected]}
            </motion.div>
          </AnimatePresence>
          {selected === 'python' && (
            <div
              className='grid overflow-hidden transition-all duration-150'
              style={{
                gridTemplateRows: lintStatus ? '1fr' : '0fr',
              }}
            >
              <div className='min-h-0 transition-all duration-150'>
                <p
                  className={classNames(
                    'mt-2 rounded-lg p-2 font-mono text-xs',
                    lintStatus?.status == 'error'
                      ? 'bg-[var(--condition-test-error)]'
                      : 'bg-[var(--condition-test-success)]',
                  )}
                >
                  {lintStatus?.status == 'ok'
                    ? 'Condition test passed!'
                    : lintStatus?.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter className='flex items-center justify-between'>
        <div className='flex items-center justify-start gap-2'>
          <Button isIconOnly className='rounded-full'>
            <HelpCircle />
          </Button>
          {!is_create && (
            <Button
              onClick={handleConfirmDeleteOpen}
              className='hover:bg-red-500'
              isIconOnly
            >
              <TrashIcon />
            </Button>
          )}
        </div>
        <div className='flex items-end gap-2'>
          {currentCondition.type === 'python' && (
            <Button
              data-testid='test-condition-button'
              onClick={testCondition}
              isLoading={testConditionPending}
              className=''
            >
              Test condition
            </Button>
          )}
          <Button
            data-testid='save-condition-button'
            onClick={saveCondition}
            className='bg-foreground text-background'
            isDisabled={errorObject.isInvalid || condition?.name.trim() === ''}
          >
            Save condition
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default ConditionModal
