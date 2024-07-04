import { conditionType } from "./ConditionTypes"
import { responseType } from "./ResponseTypes"

export type NodesTypes = 'default_node' | 'default_link'

export type NodeType = {
  id: string
  type: string
  data: NodeDataType
  position: {
    x: number
    y: number
  }
}

export type NodeDataType = {
  id: string
  name: string
  flags?: string[]
  conditions?: conditionType[]
  global_conditions?: string[]
  local_conditions?: string[]
  response?: responseType
  to?: string
}

export type NodeComponentType = {
  data: NodeDataType
}

export interface NodeComponentConditionType extends NodeComponentType {
  condition: conditionType
}