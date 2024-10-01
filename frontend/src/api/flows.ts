import { interfaceType } from "@/contexts/flowContext"
import { $v1 } from "."
import { FlowType } from "../types/FlowTypes"
import { ParsedSlot } from "../utils"
import { GetFlowsResponseType, SaveFlowsResponseType } from "./flows.types"



export const get_flows = async (): Promise<GetFlowsResponseType> => {
  return (await $v1.get("/flows")).data
}

export const save_flows = async (flows: FlowType[], _interface: interfaceType, slots?: Record<string, ParsedSlot> | null): Promise<SaveFlowsResponseType> => {
  // const hasValidSlots = slots && Object.values(slots).some(slot => Object.keys(slot).length > 0);
  const _i = _interface.interface === "tg" ? {
    telegram: {
      token: _interface.token
    }
  } : {
    cli: {}
  }
  const json = {
    flows,
    slots: slots ?? {},
    interface: {
      ..._i
    }
  }
  return (await $v1.post("/flows", json)).data
}