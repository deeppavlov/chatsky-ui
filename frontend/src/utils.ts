import { v4 } from 'uuid'
import { CreateFlowType } from './modals/FlowModal/CreateFlowModal'
import { conditionType } from './types/ConditionTypes'
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

export const validateFlowName = (name: string, flows: FlowType[]) => {
  return !flows.some((flow) => flow.name === name) && name.length >= 2
}

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

export const generateNewConditionBase = (name: string): conditionType => {
  return {
    id: 'condition_' + v4(),
    name: name,
    type: 'python',
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

export const generateNewSlot = (group_id: string): SlotType => {
  return {
    id: 'slot_' + v4(),
    name: 'New slot',
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
