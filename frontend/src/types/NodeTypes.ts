import { Node } from "@xyflow/react"
import { conditionType } from "./ConditionTypes"
import { responseType } from "./ResponseTypes"

export type NodesTypes = 'default_node' | 'link_node'

export type DefaultNodeType = Node<DefaultNodeDataType, "default_node">
export type LinkNodeType = Node<LinkNodeDataType, "link_node">
export type AppNode = DefaultNodeType | LinkNodeType
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
  }
}

export type PartialDefaultNodeDataType = Partial<DefaultNodeDataType>
export type PartialLinkNodeDataType = Partial<LinkNodeDataType>

export type AppNodeDataType = DefaultNodeDataType | LinkNodeDataType

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
  data: DefaultNodeDataType
}

export interface NodeComponentConditionType extends NodeComponentType {
  condition: conditionType
}