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
import { useParams } from 'react-router-dom'
import { lint_service } from '../../api/services'
import { flowContext } from '../../contexts/flowContext'
import { PopUpContext } from '../../contexts/popUpContext'
import EditPenIcon from '../../icons/EditPenIcon'
import { conditionType, conditionTypeType } from '../../types/ConditionTypes'
import { AppNode, DefaultNodeDataType } from '../../types/NodeTypes'
import DefInput from '../../UI/Input/DefInput'
import {
  generateNewConditionBase,
  validateConditionBasic,
  validateConditionName,
  validateConditionSlot,
} from '../../utils'
import AlertModal from '../AlertModal'
import {
  CustomModalProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '../ModalComponents'
import BasicCondition from './components/BasicCondition'
import ButtonCondition from './components/ButtonCondition'
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
  | 'Python code'
  | 'Custom'
  | 'Basic'
  | 'Button'

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
  const { quietSaveFlows, flows } = useContext(flowContext)

  const [selected, setSelected] = useState<conditionTypeType>(
    condition?.type ?? 'python',
  )

  const { flowId } = useParams()
  const [lintStatus, setLintStatus] = useState<LintStatusType | null>(null)
  const [testConditionPending, setTestConditionPending] = useState(false)

  const setSelectedHandler = (key: conditionTypeType) => {
    setCurrentCondition({ ...currentCondition, type: key })
    setSelected(key)
  }

  const arr = flows
    .filter((flow) => flow.name !== 'Global')
    .map((flow) => {
      return {
        name: flow.name,
        collection: flow.data.nodes
          .filter((node) => node.type === 'default_node')
          .map((node) =>
            (node.data as DefaultNodeDataType).conditions.map(
              (condition) => condition.name,
            ),
          ),
      }
    })

  const allNameCondidionFlows = arr
    .flatMap((flow) => {
      return flow.collection
    })
    .flat()

  const iterGenName = (count: number = 1): string => {
    const nameFlow = (flowId?.length ?? 0 >= 15) ? flowId?.slice(0, 15) : flowId

    const newName = `${nameFlow}_NewCnd_${count}`

    const isNotUnique = allNameCondidionFlows.includes(newName)

    if (isNotUnique) {
      return iterGenName((count += 1))
    }
    return newName
  }

  const initConditionName = iterGenName()

  const [currentCondition, setCurrentCondition] = useState(
    is_create || !condition
      ? generateNewConditionBase(initConditionName)
      : condition,
  )

  const [errorObject, setError] = useState<{
    name?: { isInvalid: boolean; errorMessage: string }
    isInvalid?: boolean
    errorMessage?: string
  }>({
    isInvalid: false,
    errorMessage: '',
  })

  const ref = useRef<{
    state: conditionType
    setState: (data: conditionType) => void
  }>()

  const refSlot = useRef<{
    state: conditionType
    setState: (data: { group: boolean; slot: boolean }) => void
  }>()

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
        title: 'Custom',
        value: 'custom',
        icon: <CustomConditionIcon className='size-5' />,
      },
      {
        title: 'Button',
        value: 'button',
        icon: <ButtonConditionIcon className='size-5' />,
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
      python: (
        <PythonCondition
          condition={currentCondition}
          setData={setCurrentCondition}
        />
      ),
      custom: <div>Custom</div>,
      button: (
        <ButtonCondition
          condition={currentCondition}
          setData={setCurrentCondition}
        />
      ),
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
    if (currentCondition.name !== '') {
      setError({ isInvalid: false, errorMessage: '' })
    }
  }, [currentCondition.name])
  const onCloseHandler = () => {
    closePopUp(id)
  }

  const validateCurrentCondition = () => {
    if (currentCondition.type === 'basic') {
      const newState = validateConditionBasic(currentCondition)
      if (!newState.status) {
        ref.current?.setState(newState.condition.data as conditionType)
        return false
      }
    }
    if (currentCondition.type === 'slot') {
      const newState = validateConditionSlot(currentCondition)
      if (newState.group || newState.slot) {
        refSlot.current?.setState(newState)
        return false
      }
    }
    return true
  }

  const saveCondition = () => {
    const validateObject = validateConditionName(currentCondition, getNodes())

    const isValidCondition = validateCurrentCondition()

    // const newResponse = () => {
    //   const type = currentCondition.data.button?.type as string

    //   const { callback, text } = currentCondition.data.button as IButtonType

    //   const id = currentCondition.id

    //   if (currentCondition.type === 'button') {
    //     return {
    //       ...data.response,
    //       buttons: {
    //         ...data.response.buttons,
    //         [type]: [
    //           ...(
    //             data.response.buttons as unknown as Record<
    //               string,
    //               IButtonType[]
    //             >
    //           )[type],
    //           type === 'hasCallback' ? { callback, text, id } : { text, id },
    //         ],
    //       },
    //     }
    //   }
    // }

    if (!validateObject.isInvalid && isValidCondition) {
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
    }

    setError(validateObject)
  }

  const deleteCondition = () => {
    const newConditions = data.conditions?.filter(
      (condition) => condition.id !== currentCondition.id,
    )

    const newButtonsData =
      data.buttonsData?.buttons.map((button) => {
        return button.map((button) => {
          if (button.id === currentCondition.id) {
            const date =
              button.type === 'exactMatch'
                ? { text: '' }
                : { callback: '', text: '' }

            return { ...button, ...date }
          }
          return button
        })
      }) ?? []

    const responseButtons =
      data.response?.buttons?.map((button) => {
        return button.filter((button) => button.id !== currentCondition.id)
      }) ?? []

    if (currentCondition.type === 'button') {
      updateNodeData(data.id, {
        ...data,
        conditions: newConditions,
        buttonsData: {
          buttons: newButtonsData,
          rows: data.buttonsData?.rows ?? 0,
          columns: data.buttonsData?.columns ?? 0,
        },
        response: {
          ...data.response,
          buttons: responseButtons,
        },
      })
      quietSaveFlows()
      onCloseHandler()
      return
    }

    updateNodeData(data.id, {
      ...data,
      conditions: data.conditions?.filter(
        (condition) => condition.id !== currentCondition.id,
      ),
    })
    quietSaveFlows()
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
        {is_create ? (
          <label>
            <Tabs
              disabledKeys={['llm', 'custom']}
              selectedKey={selected}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onSelectionChange={setSelectedHandler}
              items={
                !is_create
                  ? tabItems
                  : tabItems.filter((item) => item.value !== 'button')
              }
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
                    setCurrentCondition({
                      ...currentCondition,
                      type: item.value,
                    })
                  }
                ></Tab>
              )}
            </Tabs>
          </label>
        ) : null}

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
            isInvalid={errorObject.isInvalid}
            errorMessage={errorObject.errorMessage}
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
          >
            Save condition
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default ConditionModal
