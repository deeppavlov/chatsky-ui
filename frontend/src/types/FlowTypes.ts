import { Edge, ReactFlowJsonObject } from "@xyflow/react"
import { AppNode } from "./NodeTypes"

export type FlowType = {
  id: string
  name: string
  description?: string
  color?: string
  subflow?: string
  data: ReactFlowJsonObject<AppNode, Edge>
}
