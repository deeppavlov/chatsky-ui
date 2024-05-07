import { v4 } from "uuid"
import { CreateFlowType } from "./modals/FlowModal/CreateFlowModal"
import { FlowType } from "./types/FlowTypes"
import React from "react"

export const generateNewFlow = (flow: CreateFlowType) => {
  const newFlow: FlowType = {
    ...flow,
    id: v4(),
    data: {
      nodes: [
        {
          id: `${flow.name}/LOCAL_NODE`,
          type: "default_node",
          data: {
            id: `${flow.name}/LOCAL_NODE`,
            name: "LOCAL NODE",
            conditions: [],
            global_conditions: [],
            local_conditions: [],
            response: "Default local node response",
          },
          position: {
            x: 0,
            y: 0,
          },
        },
      ],
      edges: [],
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
  }
  return newFlow
}

export const validateFlowName = (name: string, flows: FlowType[]) => {
  return !flows.some((flow) => flow.name === name) && name.length > 2
}

export const parseSearchParams = (searchParams: URLSearchParams): {
  [key: string]: string
} => {
  if (!searchParams.toString()) return {}
  return searchParams
    .toString()
    .split("&")
    .map((s) => s.split("="))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}
