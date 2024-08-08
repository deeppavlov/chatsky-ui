import { conditionType } from "./ConditionTypes"
import { responseType } from "./ResponseTypes"

export type NodesTypes = 'default_node' | 'link_node'

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
  transition: {
    target_flow: string
    target_node: string
  }
  response?: responseType
}

export type NodeComponentType = {
  data: NodeDataType
}

export interface NodeComponentConditionType extends NodeComponentType {
  condition: conditionType
}