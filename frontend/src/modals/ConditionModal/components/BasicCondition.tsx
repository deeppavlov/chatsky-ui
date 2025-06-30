import DeleteBasicConditionIcon from '@/icons/nodes/conditions/deleteBasicConditionIcon'
import DefInput from '@/UI/Input/DefInput'
import DefSelect from '@/UI/Input/DefSelect'
import DefTextarea from '@/UI/Input/DefTextarea'
import { Button, Checkbox } from '@nextui-org/react'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import { conditionType } from '../../../types/ConditionTypes'

export type IMyConditionModalContentType = {
  condition: conditionType
  setData: (
    state: conditionType,
    callback: (data: conditionType) => void,
  ) => void
}

interface ICondition {
  text?: string
  flags?: { caseSensitive: boolean }
  id?: string
  pattern?: string
  structure?: string
  error?: boolean
  data?: ICondition
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
  text?: string
  pattern?: string
  data?: ICondition[] | ICondition
  conditionGroups: {
    name: string
    key?: string
    disabled?: boolean
  }[]
  flags?: { caseSensitive: boolean }
  error?: boolean
}

const genDefObject = (key: string): ICondition => {
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
      return {
        structure: 'anyOf',
        data: [{ structure: '', id: _.uniqueId() }],
      } as ICondition
    case 'All of':
      return {
        structure: 'allOf',
        data: [{ structure: '', id: _.uniqueId() }],
      } as ICondition
    case 'Not':
      return { structure: 'not', data: { structure: '' } }
    default:
      console.log(key)
      return { structure: 'unknown' }
  }
}

const isAnyOrAll = (value: string): boolean =>
  value === 'allOf' || value === 'anyOf'

const getValue = (state: IState, id: string): ICondition | IState => {
  const stateData = state.data as ICondition[]

  if (isAnyOrAll(state.structure)) {
    const data: ICondition = stateData!.filter(
      (item: ICondition) => item.id === id,
    )[0]
    return data.structure === 'not' ? (data.data ?? {}) : data
  }
  return state.structure !== 'not'
    ? (state as IState)
    : ((state.data as ICondition) ?? {})
}

const handleValueChange = (
  setState: (value: IState) => void,
  state: IState,
  id: string | undefined,
  value: string,
  field: string,
) => {
  if (id === undefined) {
    const result =
      state.structure === 'not'
        ? {
            ...state,
            data: {
              ...(state.data as ICondition),
              [field]: value,
            },
          }
        : { ...state, [field]: value }

    setState(result)
    return
  }

  const newData: ICondition[] = (state.data as ICondition[]).map(
    (item: ICondition) => {
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

  const newData: ICondition[] = (state.data as ICondition[]).map(
    (item: ICondition) => {
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
  const arrConditions: string[] = (state.data as ICondition[])
    .map((el: ICondition) => el.structure)
    .filter((structure): structure is string => structure !== undefined)

  const mapStructures: { [key: string]: string[] } = {
    allOf: ['exactMatch', 'regExp'],
    anyOf: ['regExp'],
  }

  const arrKeyMap = mapStructures[conditionStructures]

  const newConditionGroups = state.conditionGroups.map((group) => {
    if (Object.prototype.hasOwnProperty.call(group, 'disabled')) {
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

const getError = (state: IState, id: string | undefined = undefined) => {
  if (state.structure === 'not' && state.data) {
    return (state.data as ICondition).error
  }
  if (isAnyOrAll(state.structure) && state.data) {
    const item = (state.data as ICondition[]).filter(
      (item: ICondition) => item.id === id,
    )[0]

    if (item && item.structure === 'not' && item.data) {
      return (item.data as ICondition).error
    }

    return item?.error
  }
  return state.error
}

const mapping: IMapping = {
  exactMatch: (setState, state, id = undefined) => {
    const padding = id === undefined ? 'py-[12px]' : ''

    const error = getError(state, id)

    const errorProps =
      getValue(state, id ?? '').text === ''
        ? {
            errorMessage: error ? 'Please fill every field' : '',
            isInvalid: error,
          }
        : {
            errorMessage: '',
            isInvalid: false,
          }

    return (
      <div className={`flex flex-col gap-[12px] ${padding}`}>
        <InputText
          value={getValue(state, id ?? '').text}
          defaultValue={''}
          setState={(value) =>
            handleValueChange(setState, state, id, value, 'text')
          }
          {...errorProps}
        />
      </div>
    )
  },
  includeText: (setState, state, id) => {
    const padding = id === undefined ? 'py-[12px]' : ''

    const error = getError(state, id)

    const errorProps =
      getValue(state, id ?? '').text === ''
        ? {
            errorMessage: error ? 'Please fill every field' : '',
            isInvalid: error,
          }
        : {}

    return (
      <div className={`flex flex-col gap-[12px] ${padding}`}>
        <InputText
          value={getValue(state, id ?? '').text}
          defaultValue={''}
          setState={(value) =>
            handleValueChange(setState, state, id, value, 'text')
          }
          {...errorProps}
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

    const error = getError(state, id)

    const errorProps =
      getValue(state, id ?? '').pattern === ''
        ? {
            errorMessage: error ? 'Please fill every field' : '',
            isInvalid: error,
          }
        : {}

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
          {...errorProps}
          type={'errorMessage'}
          data-testid='regexp-pattern'
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
          {(state.data as ICondition[]).map((el: ICondition, index: number) => {
            if (el.structure === '') {
              const error = getError(state, el.id)

              const errorProps = {
                errorMessage: error
                  ? 'Please select basic condition structure'
                  : '',
                isInvalid: error,
              }

              return (
                <div className='flex flex-col gap-[12px]' key={index}>
                  {Array.isArray(state.data) && state.data.length > 1 && (
                    <ConditionHeader
                      onDelete={() => {
                        const newData = (state.data as ICondition[]).filter(
                          (item: ICondition) => item.id !== el.id,
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
                  )}

                  <DefSelect
                    {...errorProps}
                    key={index}
                    mini
                    className='w-full'
                    onValueChange={(value: string) => {
                      const defData = genDefObject(value)
                      const newCondition = { ...defData, id: el.id }
                      const newData = (state.data as ICondition[]).map(
                        (item: ICondition) =>
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
                    data-testid='substructure-select'
                  />
                </div>
              )
            }
            if (el.structure !== undefined) {
              console

              return (
                <div className='flex flex-col gap-[12px]' key={index}>
                  {Array.isArray(state.data) && state.data.length > 1 && (
                    <ConditionHeader
                      onDelete={() => {
                        const newData = (state.data as ICondition[]).filter(
                          (item: ICondition) => item.id !== el.id,
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
                  )}
                  <DefSelect
                    key={index}
                    defaultValue={getNameCondition(el.structure)}
                    mini
                    className='w-full'
                    onValueChange={(value: string) => {
                      const defData = genDefObject(value)
                      const newCondition = { ...defData, id: el.id }
                      const newData = (state.data as ICondition[]).map(
                        (item: ICondition) =>
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
                ...(state.data as ICondition[]),
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
    const error = getError(state, id)

    const name =
      state.structure === 'not'
        ? (state.data as ICondition).structure
        : (
            (state.data as ICondition[]).find(
              (item: ICondition) => item.id === id,
            )?.data as ICondition
          )?.structure

    const errorProps =
      name === ''
        ? {
            errorMessage: error
              ? 'Please select basic condition structure'
              : '',
            isInvalid: error,
          }
        : {}

    const arr = [
      { id: 1, name: 'Exact match' },
      { id: 2, name: 'Include text' },
      { id: 3, name: 'Regular expression' },
    ]

    const key: string = isAnyOrAll(state.structure)
      ? ((
          (state.data as ICondition[]).filter(
            (data: ICondition) => data.id === id,
          )[0]?.data as ICondition
        )?.structure ?? '')
      : ((state.data as ICondition).structure ?? '')

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
          {...errorProps}
          mini
          defaultValue={getNameCondition(key)}
          className={`w-full`}
          onValueChange={(value) => {
            const defData = genDefObject(value)
            if (isAnyOrAll(state.structure)) {
              const newCondition = { ...defData, id }
              const newData: ICondition[] = (state.data as ICondition[]).map(
                (item: ICondition) =>
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
          data-testid='substructure-select'
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
  isInvalid?: boolean
  errorMessage?: string
}> = ({
  setState,
  value = '',
  defaultValue = '',
  isInvalid = false,
  errorMessage = '',
}) => {
  return (
    <div className='flex flex-col gap-[12px]'>
      <TextMessage
        title={'Text'}
        text={'Message has to match exactly the text below'}
      />
      <DefInput
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        value={value}
        defaultValue={defaultValue}
        className='col-span-3'
        variant='bordered'
        labelPlacement='outside'
        placeholder='Enter text...'
        onChange={(e) => setState(e.target.value)}
        data-testid='basic-condition-text'
      />
    </div>
  )
}

const BasicCondition = ({
  condition,
  setData,
}: IMyConditionModalContentType) => {
  const defState: IState =
    Object.prototype.hasOwnProperty.call(condition.data, 'structure') &&
    condition.data.structure
      ? {
          ...condition.data,
          conditionGroups,
          structure: condition.data.structure,
        }
      : { conditionGroups, structure: '' }

  const [state, setState] = useState(defState)

  useEffect(() => {
    const { conditionGroups: conditionGroupsIgnored, ...newState } = state // eslint-disable-line @typescript-eslint/no-unused-vars
    const newCondition = {
      ...condition,
      data: {
        ...newState,
        priority: condition.data.priority,
        transition_type: condition.data.transition_type,
      },
    }

    // console.log(newCondition)

    setData(newCondition, (data) => setState({ ...state, ...data }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const TextConditions = isAnyOrAll(state.structure) ? (
    <p className='pt-[12px] text-[10px]'>
      One of the conditions below has to be fulfilled
    </p>
  ) : null

  const errorProps =
    state.structure === ''
      ? {
          errorMessage: 'Please select basic condition structure',
          isInvalid: state.error ?? false,
        }
      : {}

  return (
    <>
      <div className='pt-[24px]'>
        <div className='flex items-center justify-between pb-[12px]'>
          <p className=''>Structure</p>
        </div>

        <DefSelect
          {...errorProps}
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
          data-testid='structure-select'
        />
        {TextConditions}
      </div>
      {mapping[state.structure] && mapping[state.structure](setState, state)}
    </>
  )
}

export default BasicCondition
