import { v4 } from "uuid"
import { CreateFlowType } from "./modals/FlowModal/CreateFlowModal"
import { conditionType } from "./types/ConditionTypes"
import { FlowType } from "./types/FlowTypes"
import { NodeType } from "./types/NodeTypes"

export const generateNewFlow = (flow: CreateFlowType) => {
  const node_id = v4()
  const node_2_id = v4()
  const condition_id = v4()
  const newFlow: FlowType = {
    ...flow,
    id: v4(),
    data: {
      nodes: [],
      edges: [
        {
          id: v4(),
          source: node_id,
          sourceHandle: condition_id,
          target: node_2_id,
        },
      ],
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

export const parseSearchParams = (
  searchParams: URLSearchParams
): {
  [key: string]: string
} => {
  if (!searchParams.toString()) return {}
  return searchParams
    .toString()
    .split("&")
    .map((s) => s.split("="))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
}

export const generateNewConditionBase = (): conditionType => {
  return {
    id: v4(),
    name: "new_cnd",
    type: "python",
    data: {
      priority: 1,
      transition_type: "manual",
    },
  }
}

export const isNodeDeletionValid = (nodes: NodeType[], id: string) => {
  const node = nodes.find((n) => n.id === id)
  if (!node) return false
  return !node.data.flags?.includes("start")
}
