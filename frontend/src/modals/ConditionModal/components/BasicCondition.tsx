import DeleteBasicConditionIcon from '@/icons/nodes/conditions/deleteBasicConditionIcon'
import DefInput from '@/UI/Input/DefInput'
import DefSelect from '@/UI/Input/DefSelect'
import DefTextarea from '@/UI/Input/DefTextarea'
import { Button, Checkbox } from '@nextui-org/react'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { ConditionModalContentType } from '../ConditionModal'

interface IDefObject {
  text?: string
  flags?: { caseSensitive: boolean }
  data?: IDefObject[] | IDefObject | Record<string, unknown>
  id?: string
  pattern?: string
  structure?: string
}

interface IMapping {
  [key: string]: (
    setState: (value: IState) => void,
    state: IState,
    id?: string,
  ) => JSX.Element
}

interface IState {
  structure: string
  data?: IDefObject[] | IDefObject
  conditionGroups: {
    name: string
    key?: string
    disabled?: boolean
  }[]
  flags?: { caseSensitive: boolean }
}

const genDefObject = (key: string): IDefObject => {
  switch (key) {
    case 'Exact match':
      return {
        structure: 'exactMatch',
        text: '',
      }
    case 'Include text':
      return {
        structure: 'includeText',
        text: '',
        flags: { caseSensitive: false },
      }
    case 'Regular expression':
      return {
        structure: 'regExp',
        pattern: '',
        flags: { caseSensitive: false },
      }
    case 'Any of':
      return { structure: 'anyOf', data: [] }
    case 'All of':
      return { structure: 'allOf', data: [] }
    case 'Not':
      return { structure: 'not', data: {} }
    default:
      console.log(key)
      return { structure: 'unknown' }
  }
}

const isAnyOrAll = (value: string): boolean =>
  value === 'Any of' ||
  value === 'All of' ||
  value === 'allOf' ||
  value === 'anyOf'

const getValue = (state: IState, id: string): IDefObject => {
  const stateData = state.data as IDefObject[]

  if (isAnyOrAll(state.structure)) {
    const data: IDefObject = stateData.filter(
      (item: IDefObject) => item.id === id,
    )[0]
    return data.structure === 'not' ? (data.data as IDefObject) : data
  }
  return state.structure !== 'not'
    ? (state as IDefObject)
    : (state.data as IDefObject)
}

const handleValueChange = (
  setState: (value: IState) => void,
  state: IState,
  id: string | undefined,
  value: string,
  field: string,
) => {
  if (id === undefined) {
    state.structure === 'not'
      ? setState({
          ...state,
          data: { ...(state.data as IDefObject), [field]: value },
        })
      : setState({ ...state, [field]: value })
    return
  }

  const newData: IDefObject[] = (state.data as IDefObject[]).map(
    (item: IDefObject) => {
      if (item.id === id) {
        return item.structure === 'not'
          ? { ...item, data: { ...item.data, [field]: value } }
          : { ...item, [field]: value }
      }
      return item
    },
  )
  setState({ ...state, data: newData })
  return
}

const handleValueChangeCheckbox = (
  setState: (value: IState) => void,
  state: IState,
  id: string | undefined,
  value: boolean,
) => {
  if (id === undefined) {
    state.structure === 'not'
      ? setState({
          ...state,
          data: { ...state.data, flags: { caseSensitive: value } },
        })
      : setState({ ...state, flags: { caseSensitive: value } })
    return
  }

  const newData: IDefObject[] = (state.data as IDefObject[]).map(
    (item: IDefObject) => {
      if (item.id === id) {
        return item.structure === 'not'
          ? { ...item, data: { ...item.data, flags: { caseSensitive: value } } }
          : { ...item, flags: { caseSensitive: value } }
      }
      return item
    },
  )
  setState({ ...state, data: newData })
}

interface IConditionGroup {
  name: string
  key?: string
  disabled?: boolean
}

const disabledConditionGroup = (state: IState): IConditionGroup[] => {
  const conditionStructures = state.structure
  const arrConditions: string[] = (state.data as IDefObject[])
    .map((el: IDefObject) => el.structure)
    .filter((structure): structure is string => structure !== undefined)

  const mapStructures: { [key: string]: string[] } = {
    allOf: ['exactMatch', 'regExp'],
    anyOf: ['regExp'],
  }

  const arrKeyMap = mapStructures[conditionStructures]

  const newConditionGroups = state.conditionGroups.map((group) => {
    if (Object.hasOwn(group, 'disabled')) {
      group.disabled =
        group.key &&
        arrKeyMap.includes(group.key) &&
        arrConditions.includes(group.key)
          ? true
          : false
    }
    return group
  })

  return newConditionGroups
}

const conditionGroups = [
  { name: 'Exact match', key: 'exactMatch', disabled: false },
  { name: 'Include text', key: 'includeText' },
  { name: 'Regular expression', key: 'regExp', disabled: false },
  { name: 'Any of', key: 'anyOf' },
  { name: 'All of', key: 'allOf' },
  { name: 'Not', key: 'not' },
]

const getNameCondition = (key: string) => {
  const condition = conditionGroups.filter((condition) => condition.key === key)
  return condition.length === 0 ? '' : condition[0].name
}

const ConditionHeader = ({ onDelete }: { onDelete?: () => void }) => (
  <div className='flex items-center justify-between'>
    <p>Condition</p>
    {onDelete && (
      <button onClick={onDelete} aria-label='Delete condition'>
        <DeleteBasicConditionIcon />
      </button>
    )}
  </div>
)

const mapping: IMapping = {
  exactMatch: (setState, state, id = undefined) => {
    const padding = id === undefined ? 'py-[12px]' : ''

    return (
      <div className={`flex flex-col gap-[12px] ${padding}`}>
        <InputText
          value={getValue(state, id ?? '').text}
          defaultValue={''}
          setState={(value) =>
            handleValueChange(setState, state, id, value, 'text')
          }
        />
      </div>
    )
  },
  includeText: (setState, state, id) => {
    const padding = id === undefined ? 'py-[12px]' : ''

    return (
      <div className={`flex flex-col gap-[12px] ${padding}`}>
        <InputText
          value={getValue(state, id ?? '').text}
          defaultValue={''}
          setState={(value) =>
            handleValueChange(setState, state, id, value, 'text')
          }
        />
        <div
          className='flex items-center gap-2 pl-[12px] pt-[12px]'
          style={{ cursor: 'not-allowed', opacity: 0.3 }}
        >
          <Checkbox
            isDisabled={true}
            aria-label='Case sensitive'
            isSelected={getValue(state, id ?? '').flags?.caseSensitive}
            type='checkbox'
            onValueChange={(value) =>
              handleValueChangeCheckbox(setState, state, id, value)
            }
          />
          <label className='text-sm font-medium'> Case sensitive </label>
        </div>
      </div>
    )
  },
  regExp: (setState, state, id) => {
    const padding = id === undefined ? 'py-[12px]' : ''
    return (
      <div className={`flex flex-col gap-[12px] ${padding}`}>
        <TextMessage
          title={'Pattern'}
          text={'Message has to match exactly the text below'}
        />
        <DefTextarea
          value={getValue(state, id ?? '').pattern}
          onValueChange={(value) =>
            handleValueChange(setState, state, id, value, 'pattern')
          }
        />
        <div className='flex items-center gap-2 pl-[12px] pt-[12px]'>
          <Checkbox
            aria-label='Case sensitive'
            isSelected={getValue(state, id ?? '').flags?.caseSensitive}
            onValueChange={(value) =>
              handleValueChangeCheckbox(setState, state, id, value)
            }
          />
          <label className='text-sm font-medium'> Case sensitive </label>
        </div>
      </div>
    )
  },
  anyOf: (setState, state) => {
    const arr = state.conditionGroups.filter(
      (condition) => condition.key !== 'anyOf' && condition.key !== 'allOf',
    )

    return (
      <>
        <div className='flex flex-col gap-[24px] py-[24px] pl-[24px]'>
          {(state.data as IDefObject[]).map((el: IDefObject, index: number) => {
            if (el.structure === '') {
              return (
                <div className='flex flex-col gap-[12px]' key={index}>
                  <ConditionHeader
                    onDelete={() => {
                      const newData = (state.data as IDefObject[]).filter(
                        (item: IDefObject) => item.id !== el.id,
                      )
                      const newState = { ...state, data: newData }
                      const newConditionGroups =
                        disabledConditionGroup(newState)
                      setState({
                        ...newState,
                        conditionGroups: newConditionGroups,
                      })
                    }}
                  />

                  <DefSelect
                    key={index}
                    mini
                    className='w-full'
                    onValueChange={(value: string) => {
                      const defData = genDefObject(value)
                      const newCondition = { ...defData, id: el.id }
                      const newData = (state.data as IDefObject[]).map(
                        (item: IDefObject) =>
                          item.id === el.id ? newCondition : item,
                      )
                      const newState = {
                        ...state,
                        conditionGroups,
                        data: newData,
                      }
                      const newConditionGroups =
                        disabledConditionGroup(newState)
                      setState({
                        ...newState,
                        conditionGroups: newConditionGroups,
                      })
                    }}
                    items={arr.map((group, index) => ({
                      value: group.name,
                      key: index.toString(),
                      disabled: group.disabled,
                    }))}
                    placeholder='Choose group'
                  />
                </div>
              )
            }
            if (el.structure !== undefined) {
              return (
                <div className='flex flex-col gap-[12px]' key={index}>
                  <ConditionHeader
                    onDelete={() => {
                      const newData = (state.data as IDefObject[]).filter(
                        (item: IDefObject) => item.id !== el.id,
                      )
                      const newState = { ...state, data: newData }
                      const newConditionGroups =
                        disabledConditionGroup(newState)

                      setState({
                        ...newState,
                        conditionGroups: newConditionGroups,
                      })
                    }}
                  />
                  <DefSelect
                    key={index}
                    defaultValue={getNameCondition(el.structure)}
                    mini
                    className='w-full'
                    onValueChange={(value: string) => {
                      const defData = genDefObject(value)
                      const newCondition = { ...defData, id: el.id }
                      const newData = (state.data as IDefObject[]).map(
                        (item: IDefObject) =>
                          item.id === el.id ? newCondition : item,
                      )
                      const newState = { ...state, data: newData }
                      const newConditionGroups =
                        disabledConditionGroup(newState)
                      setState({
                        ...newState,
                        conditionGroups: newConditionGroups,
                      })
                    }}
                    items={arr.map((group, index) => ({
                      value: group.name,
                      key: index.toString(),
                      disabled: group.disabled,
                    }))}
                    placeholder='Choose group'
                  />
                  {mapping[el.structure](setState, state, el.id)}
                </div>
              )
            }
          })}
        </div>
        <Button
          data-testid='add-condition-button'
          onClick={() => {
            setState({
              ...state,
              data: [
                ...(state.data as IDefObject[]),
                { structure: '', id: _.uniqueId() },
              ],
            })
          }}
          className='my-3 bg-foreground text-background'
        >
          + Add condition
        </Button>
        <p className='text-sm'>Regular expressions tutorial ↗</p>
      </>
    )
  },
  allOf: (setState, state) => {
    return mapping['anyOf'](setState, state)
  },
  not: (setState, state, id) => {
    const arr = [
      { id: 1, name: 'Exact match' },
      { id: 2, name: 'Include text' },
      { id: 3, name: 'Regular expression' },
    ]

    const key: string = isAnyOrAll(state.structure)
      ? ((
          (state.data as IDefObject[]).filter(
            (data: IDefObject) => data.id === id,
          )[0]?.data as IDefObject
        )?.structure ?? '')
      : ((state.data as IDefObject).structure ?? '')

    const padding =
      isAnyOrAll(state.structure) || state.structure === 'not'
        ? 'pl-[24px]'
        : ''

    return (
      <div className={`${padding} flex flex-col gap-[12px] pt-[24px]`}>
        <div className='flex items-center justify-between'>
          <p>Condition</p>
        </div>
        <DefSelect
          mini
          defaultValue={getNameCondition(key)}
          className={`w-full`}
          onValueChange={(value) => {
            const defData = genDefObject(value)
            if (isAnyOrAll(state.structure)) {
              const newCondition = { ...defData, id }
              const newData: IDefObject[] = (state.data as IDefObject[]).map(
                (item: IDefObject) =>
                  item.id === id ? { ...item, data: newCondition } : item,
              )
              setState({ ...state, data: newData })
              return
            }
            const newState = { ...state, data: { ...defData } }
            setState(newState)
          }}
          items={arr.map((group) => ({
            value: group.name,
            key: group.id.toString(),
          }))}
          placeholder='Choose group'
        />
        {mapping[key] && mapping[key](setState, state, id)}
      </div>
    )
  },
}

const TextMessage: React.FC<{ title: string; text: string }> = ({
  title,
  text,
}) => {
  return (
    <div className=''>
      <p>{title}</p>
      <p className='text-[12px]'>{text}</p>
    </div>
  )
}

const InputText: React.FC<{
  setState: (value: string) => void
  defaultValue?: string
  value?: string
}> = ({ setState, value = '', defaultValue = '' }) => {
  return (
    <div className='flex flex-col gap-[12px]'>
      <TextMessage
        title={'Text'}
        text={'Message has to match exactly the text below'}
      />
      <DefInput
        value={value}
        defaultValue={defaultValue}
        className='col-span-3'
        variant='bordered'
        labelPlacement='outside'
        placeholder='Enter text...'
        onChange={(e) => setState(e.target.value)}
      />
    </div>
  )
}

const BasicCondition = ({ condition, setData }: ConditionModalContentType) => {
  const defState: IState =
    Object.hasOwn(condition.data, 'structure') && condition.data.structure
      ? {
          ...condition.data,
          conditionGroups,
          structure: condition.data.structure,
        }
      : { conditionGroups, structure: '' }

  const [state, setState] = useState(defState)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { conditionGroups: conditionGroupsIgnored, ...newState } = state

    const newCondition = {
      ...condition,
      data: {
        ...newState,
        priority: condition.data.priority,
        transition_type: condition.data.transition_type,
      },
    }
    setData(newCondition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const TextConditions = isAnyOrAll(state.structure) ? (
    <p className='pt-[12px] text-[10px]'>
      One of the conditions below has to be fulfilled
    </p>
  ) : null

  return (
    <>
      <div className='pt-[24px]'>
        <div className='flex items-center justify-between pb-[12px]'>
          <p className=''>Structure</p>
        </div>

        <DefSelect
          mini
          className='w-full'
          defaultValue={getNameCondition(state.structure)}
          onValueChange={(value) => {
            const defObject = genDefObject(value)
            const newStructure = defObject?.structure ?? ''

            const newConditionGroups = state.conditionGroups.map((group) => {
              if (group.disabled) {
                group.disabled = false
              }
              return group
            })

            setState({
              conditionGroups: newConditionGroups,
              ...defObject,
              structure: newStructure,
            })
          }}
          items={state.conditionGroups.map((group, index) => ({
            value: group.name,
            key: index.toString(),
          }))}
          placeholder='Choose group'
        />
        {TextConditions}
      </div>
      {mapping[state.structure] && mapping[state.structure](setState, state)}
    </>
  )
}

export default BasicCondition
