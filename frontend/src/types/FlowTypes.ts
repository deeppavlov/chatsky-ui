import { Edge, ReactFlowJsonObject } from "@xyflow/react"
import { AppNode, LinkNodeDataType } from "./NodeTypes"

export type FlowType = {
  id: string
  name: string
  description?: string
  color?: string
  subflow?: string
  data: ReactFlowJsonObject<AppNode, Edge>
  toLink?: LinkNodeDataType[]
}

export type SlotType = {
  id: string
  name: string
  group_id: string
  type: 'RegexpSlot' | ''
  method: string
  value: string
  match_group_idx: number
}

export type SlotsGroupType = {
  id: string
  name: string
  slots: SlotType[]
  subgroups?: string[]
  subgroup_to: string
  flow: 'global' | string
}
