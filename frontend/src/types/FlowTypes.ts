import {  ReactFlowJsonObject } from "reactflow"

export type FlowType = {
  id: string
  name: string
  description?: string
  color?: string
  subflow?: string
  data: ReactFlowJsonObject
}
