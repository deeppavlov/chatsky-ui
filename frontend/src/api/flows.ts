import { $v1 } from "."
import { FlowType } from "../types/FlowTypes"
import { GetFlowsResponseType, SaveFlowsResponseType } from "./flows.types"



export const get_flows = async (): Promise<GetFlowsResponseType> => {
  return (await $v1.get("/flows")).data
}

export const save_flows = async (flows: FlowType[]): Promise<SaveFlowsResponseType> => {
  return (await $v1.post("/flows", {flows})).data
}