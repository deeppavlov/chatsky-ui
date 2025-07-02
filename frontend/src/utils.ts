import { v4 } from 'uuid'
import { CreateFlowType } from './modals/FlowModal/CreateFlowModal'
import {
  conditionType,
  conditionTypeType,
  ICondition,
} from './types/ConditionTypes'
import { FlowType, SlotsGroupType, SlotType } from './types/FlowTypes'
import {
  AppNode,
  DefaultNodeDataType,
  DefaultNodeType,
  LinkNodeDataType,
  LinkNodeType,
  NodesTypes,
  SlotsNodeDataType,
} from './types/NodeTypes'

export const generateNewFlow = (flow: CreateFlowType) => {
  const newFlow: FlowType = {
    ...flow,
    id: 'flow_' + v4(),
    data: {
      nodes: [],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  }
  return newFlow
}

// export const validateFlowName = (name: string, flows: FlowType[]) => {
//   return !flows.some((flow) => flow.name === name) && name.length >= 1
// }

export function capitalizeFirstWord(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  })
}

export const parseSearchParams = (
  searchParams: URLSearchParams,
): {
  [key: string]: string
} => {
  if (!searchParams.toString()) return {}
  return searchParams
    .toString()
    .split('&')
    .map((s) => s.split('='))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}

export const generateNewConditionBase = (
  name: string,
  type: string = 'python',
): conditionType => {
  return {
    id: 'condition_' + v4(),
    name: name,
    type: type as conditionTypeType,

    data: {
      priority: 1,
      transition_type: 'manual',
    },
  }
}

export const isNodeDeletionValid = (nodes: AppNode[], id: string) => {
  const node = nodes.find((n) => n.id === id)
  if (!node) return false
  if (node.type === 'link_node') return true
  if (node.type === 'default_node') return !node.data.flags?.includes('start')
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const generateNewNode = (
  type: NodesTypes | undefined,
  template?: Partial<
    (Omit<DefaultNodeType, 'data'> & {
      data: Partial<DefaultNodeDataType>
    }) &
      (Omit<LinkNodeType, 'data'> & { data: Partial<LinkNodeDataType> }) &
      (Omit<SlotsGroupType, 'data'> & { data: Partial<SlotsNodeDataType> })
  >,
) => {
  const id = type + '_' + v4()
  switch (type) {
    case 'default_node':
      return {
        id,
        type,
        position: template?.position ?? { x: 0, y: 0 },
        data: {
          id,
          name: template?.data?.name ?? 'New node',
          response: template?.data?.response ?? {
            id: 'response_' + v4(),
            name: 'response',
            type: 'text',
            data: [{ text: 'New node response', priority: 1 }],
          },
          flags: template?.data?.flags ?? [],
          conditions: template?.data?.conditions ?? [],
          global_conditions: template?.data?.global_conditions ?? [],
          local_conditions: template?.data?.local_conditions ?? [],
        },
      }
    case 'link_node':
      return {
        id,
        type,
        position: template?.position ?? { x: 0, y: 0 },
        data: {
          id,
          name: template?.data?.name ?? 'Link',
          transition: template?.data?.transition ?? {
            target_flow: template?.data?.transition?.target_flow ?? '',
            target_node: template?.data?.transition?.target_flow ?? '',
          },
        },
      }
    case 'slots_node':
      return {
        id,
        type,
        position: template?.position ?? { x: 0, y: 0 },
        data: {
          id,
          name: template?.data?.name ?? 'Slots',
          groups: template?.data?.groups ?? [],
        },
      }
  }
  return {
    id,
    type,
    position: template?.position ?? { x: 0, y: 0 },
    data: {
      id,
      name: template?.data?.name ?? 'New node',
      response: template?.data?.response ?? {
        id: 'response_' + v4(),
        name: 'response',
        type: 'text',
        data: [{ text: 'New node response', priority: 1 }],
      },
      flags: template?.data?.flags ?? [],
      conditions: template?.data?.conditions ?? [],
      global_conditions: template?.data?.global_conditions ?? [],
      local_conditions: template?.data?.local_conditions ?? [],
    },
  }
}

export const generateNewSlot = (
  group_id: string,
  group: SlotsGroupType,
): SlotType => {
  const slot_name = group?.slots?.map((s) => s.name) ?? []

  const iterGenName = (iter: number = 1): string => {
    const name = `New_Slot_${iter}`
    if (slot_name.includes(name)) {
      return iterGenName(iter + 1)
    }
    return name
  }

  return {
    id: 'slot_' + v4(),
    name: iterGenName(),
    group_id,
    type: 'RegexpSlot',
    method: '',
    value: '',
  }
}

export const generateNewSlotsGroup = (): SlotsGroupType => {
  return {
    id: 'group_' + v4(),
    name: 'New group',
    slots: [],
    flow: 'global',
    subgroups: [],
    subgroup_to: '',
  }
}

export type ParsedSlot = {
  id: string
  type: 'GroupSlot' | 'RegexpSlot'
  [key: string]: unknown
}

export async function parseGroups(
  groups: SlotsGroupType[],
): Promise<Record<string, ParsedSlot>> {
  const result: Record<string, ParsedSlot> = {}

  function processGroup(group: SlotsGroupType): ParsedSlot {
    const groupData: ParsedSlot = {
      id: group.id,
      type: 'GroupSlot',
    }

    // Обрабатываем слоты внутри группы
    group.slots.forEach((slot) => {
      if (slot.type === 'RegexpSlot' && slot.name) {
        groupData[slot.name] = {
          id: slot.id,
          type: slot.type,
          regexp: slot.value, // Предполагаем, что value хранит регулярное выражение
          match_group_idx: 1, // Здесь предполагается индекс группы захвата
        }
      }
    })

    // Если у группы есть подгруппы, обрабатываем их рекурсивно
    if (group.subgroups) {
      group.subgroups.forEach((subgroupId) => {
        const subgroup = groups.find((g) => g.id === subgroupId)
        if (subgroup) {
          groupData[subgroup.name] = processGroup(subgroup)
        }
      })
    }

    return groupData
  }

  // Перебираем все группы верхнего уровня и строим структуру
  groups.forEach((group) => {
    if (!group.subgroup_to) {
      result[group.name] = processGroup(group)
    }
  })

  return result
}

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function formatRelativeTime(
  timestamp: string,
  format: 'default' | 'short' = 'default',
) {
  const now = Date.now()
  const date = new Date(timestamp).getTime()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (format === 'short') {
    if (diffInSeconds < 60) return `${diffInSeconds} s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} d`
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} mo`
    return `${Math.floor(diffInSeconds / 31536000)} y`
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second')
  if (diffInSeconds < 3600)
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  if (diffInSeconds < 86400)
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  if (diffInSeconds < 2592000)
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  if (diffInSeconds < 31536000)
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
}

export function getTimeDifference(date1: string, date2: string): string {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  let diffInSeconds = Math.abs((d2.getTime() - d1.getTime()) / 1000)

  const hours = Math.floor(diffInSeconds / 3600)
  diffInSeconds %= 3600
  const minutes = Math.floor(diffInSeconds / 60)
  const seconds = Math.floor(diffInSeconds % 60)

  if (hours > 0 && minutes > 0) return `${hours} hours ${minutes} minutes`
  if (hours > 0) return `${hours} hours`
  if (minutes > 0) return `${minutes} minutes`
  return `${seconds} seconds`
}

const maxLengthName = 25

const mapErrorMessage = {
  empty: 'Please fill every field',
  maxLength: 'Name must be less than 25 characters.',
  unique: 'Name must be unique.',
  color: 'Please choose flow color.',
  python: 'Please use only Latin letters. Names cannot start with a number.',
}

const validateName = (name: string) => {
  if (name.replaceAll('_', '').trim() === '') {
    return {
      name: { isInvalid: true, errorMessage: mapErrorMessage.empty },
    }
  }

  if (name.length > maxLengthName) {
    return {
      name: {
        isInvalid: true,
        errorMessage: mapErrorMessage.maxLength,
      },
    }
  }

  return {
    name: { isInvalid: false, errorMessage: '' },
  }
}

export const validateCreateFlowModal = (
  flow: CreateFlowType | FlowType,
  flows: FlowType[],
): {
  name?: { isInvalid: boolean; errorMessage: string }
  color?: { isInvalid: boolean; errorMessage: string }
} => {
  const result = validateName(flow.name)

  if (result.name.isInvalid) {
    return result
  }

  const arrFlowsName = flows.map((flow) => flow.name)

  if (arrFlowsName.includes(flow.name)) {
    return {
      name: { isInvalid: true, errorMessage: mapErrorMessage.unique },
    }
  }

  if (flow.color === '') {
    return {
      color: { isInvalid: true, errorMessage: mapErrorMessage.color },
    }
  }

  return {
    name: { isInvalid: false, errorMessage: '' },
    color: { isInvalid: false, errorMessage: '' },
  }
}

export const validateConditionName = (
  currentCondition: conditionType,
  nodes: AppNode[],
) => {
  const {
    name: { isInvalid, errorMessage },
  } = validateName(currentCondition.name)

  if (isInvalid) {
    return { isInvalid, errorMessage }
  }

  const isNameUnique = !nodes.some(
    (node: AppNode) =>
      node.type === 'default_node' &&
      node.data.conditions.some(
        (c) => c.name === currentCondition.name && c.id !== currentCondition.id,
      ),
  )

  if (!isNameUnique) {
    return { isInvalid: true, errorMessage: mapErrorMessage.unique }
  }

  if (currentCondition.type === 'python') {
    const text = currentCondition.name.replace(/[A-Za-z_]|(?!^)[0-9]/g, '')
    if (text.trim() !== '') {
      return {
        errorMessage: mapErrorMessage.python,
        isInvalid: true,
      }
    }
  }

  return { isInvalid: false, errorMessage: '' }
}

export const validateConditionSlot = (currentCondition: conditionType) => {
  if (currentCondition.data?.slot === '') {
    return { group: true, slot: true }
  }
  return { group: false, slot: false }
}

export const validateConditionBasic = (condition: ICondition) => {
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

export const validateResponseName = (
  name: string,
  selected: string,
  flows: FlowType[],
  parentNodeId: string,
) => {
  const {
    name: { isInvalid, errorMessage },
  } = validateName(name)

  if (isInvalid) {
    return {
      isInvalid,
      errorMessage,
    }
  }

  if (
    selected === 'python' &&
    name.replace(/[A-Za-z_]|(?!^)[0-9]/g, '') !== ''
  ) {
    return {
      isInvalid: true,
      errorMessage: mapErrorMessage.python,
    }
  }
  if (
    flows.some((flow) =>
      flow.data.nodes.some(
        (node) =>
          node.type === 'default_node' &&
          node.data.response.name === name &&
          node.id !== parentNodeId,
      ),
    )
  ) {
    return {
      isInvalid: true,
      errorMessage: mapErrorMessage.unique,
    }
  }
  return {
    isInvalid: false,
    errorMessage: '',
  }
}

export const validateNodeName = (
  name: string,
  nodes: AppNode[],
  id: string,
) => {
  const {
    name: { isInvalid, errorMessage },
  } = validateName(name)

  if (isInvalid) {
    return {
      isInvalid,
      errorMessage,
    }
  }

  if (nodes.some((node) => node.data.name === name && node.id !== id)) {
    return {
      isInvalid: true,
      errorMessage: mapErrorMessage.unique,
    }
  }

  return {
    isInvalid: false,
    errorMessage: '',
  }
}

export const validateGroupSlot = (
  currentGroup: SlotsGroupType,
  arrNamesSlotsGrop: string[],
) => {
  const errorNameGroup = {
    isInvalid: false,
    errorMessage: '',
  }

  if (currentGroup.name.replaceAll('_', '').trim() === '') {
    errorNameGroup.isInvalid = true
    errorNameGroup.errorMessage = mapErrorMessage.empty
  }

  if (arrNamesSlotsGrop.includes(currentGroup.name)) {
    errorNameGroup.isInvalid = true
    errorNameGroup.errorMessage = mapErrorMessage.unique
  }

  if (currentGroup.name.length > maxLengthName) {
    errorNameGroup.isInvalid = true
    errorNameGroup.errorMessage = mapErrorMessage.maxLength
  }

  const errorsSlot = currentGroup.slots.map((slot) => {
    const arr = currentGroup.slots
      .filter((s) => s.id !== slot.id)
      .map((s) => s.name)

    const object = {
      id: slot.id,
      name: {
        isInvalid: false,
        errorMessage: '',
      },
      value: {
        isInvalid: false,
        errorMessage: '',
      },
    }

    const {
      name: { isInvalid, errorMessage },
    } = validateName(slot.name)

    if (isInvalid) {
      object.name.isInvalid = true
      object.name.errorMessage = errorMessage
    }

    if (slot.value.replaceAll('_', '').trim() === '') {
      object.value.isInvalid = true
      object.value.errorMessage = mapErrorMessage.empty
    }

    if (arr.includes(slot.name)) {
      object.name.isInvalid = true
      object.name.errorMessage = mapErrorMessage.unique
    }

    return object
  })

  return {
    nameGroup: errorNameGroup,
    slots: errorsSlot,
  }
}

export const validateSlot = (slot: SlotType, group: SlotsGroupType) => {
  const newErrors = {
    name: { isInvalid: false, errorMessage: '' },
    value: { isInvalid: false, errorMessage: '' },
  }

  const allNames = group.slots.map((s) => s.name)
  if (allNames.includes(slot.name)) {
    newErrors.name = {
      isInvalid: true,
      errorMessage: mapErrorMessage.unique,
    }
  }

  if (slot.value.replaceAll('_', '').trim() === '') {
    newErrors.value = { isInvalid: true, errorMessage: mapErrorMessage.empty }
  }

  const {
    name: { isInvalid, errorMessage },
  } = validateName(slot.name)

  if (isInvalid) {
    newErrors.name = { isInvalid, errorMessage }
  }

  return newErrors
}
