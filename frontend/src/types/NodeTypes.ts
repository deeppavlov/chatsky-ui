import { Node } from "@xyflow/react"
import { conditionType } from "./ConditionTypes"
import { SlotsGroupType } from "./FlowTypes"
import { responseType } from "./ResponseTypes"

export type NodesTypes = 'default_node' | 'link_node' | "slots_node"

export type DefaultNodeType = Node<DefaultNodeDataType, "default_node">
export type LinkNodeType = Node<LinkNodeDataType, "link_node">
export type SlotsNodeType = Node<SlotsNodeDataType, "slots_node">
export type AppNode = DefaultNodeType | LinkNodeType | SlotsNodeType
export type AllowAppNode = DefaultNodeType & LinkNodeType


export type DefaultNodeDataType = {
  id: string
  name: string
  response: responseType
  conditions: conditionType[]
  global_conditions?: string[]
  local_conditions?: string[]
  flags: string[]
}

export type LinkNodeDataType = {
  id: string
  name: string
  transition: {
    target_flow: string
    target_node: string
    is_configured?: boolean | undefined
  }
}

export type SlotsNodeDataType = {
  id: string
  name: string
  description?: string
  groups: SlotsGroupType[]
}

export type PartialDefaultNodeDataType = Partial<DefaultNodeDataType>
export type PartialLinkNodeDataType = Partial<LinkNodeDataType>

export type AppNodeDataType = DefaultNodeDataType | LinkNodeDataType


export type NodeComponentType = {
  data: DefaultNodeDataType
}

export interface NodeComponentConditionType extends NodeComponentType {
  condition: conditionType
}