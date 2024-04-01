import { FlowType } from "../types/FlowTypes"


export type GetFlowsResponseType = {
  data: {
    flows: FlowType[]
  }
  status: string
}

export type SaveFlowsResponseType = {
  status: string
}