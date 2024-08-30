import { v4 } from "uuid"
import { CreateFlowType } from "./modals/FlowModal/CreateFlowModal"
import { conditionType } from "./types/ConditionTypes"
import { FlowType } from "./types/FlowTypes"
import {
  AppNode,
  DefaultNodeDataType,
  DefaultNodeType,
  LinkNodeDataType,
  LinkNodeType,
  NodesTypes,
} from "./types/NodeTypes"

export const generateNewFlow = (flow: CreateFlowType) => {
  const newFlow: FlowType = {
    ...flow,
    id: "flow_" + v4(),
    data: {
      nodes: [],
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
  return !flows.some((flow) => flow.name === name) && name.length >= 2
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
    id: "condition_" + v4(),
    name: "new_cnd",
    type: "python",
    data: {
      priority: 1,
      transition_type: "manual",
    },
  }
}

export const isNodeDeletionValid = (nodes: AppNode[], id: string) => {
  const node = nodes.find((n) => n.id === id)
  if (!node) return false
  if (node.type === "link_node") return true
  if (node.type === "default_node") return !node.data.flags?.includes("start")
}

export function delay(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

export const generateNewNode = (
  type: NodesTypes | undefined,
  template?: Partial<
    (Omit<DefaultNodeType, "data"> & {
      data: Partial<DefaultNodeDataType>
    }) &
      (Omit<LinkNodeType, "data"> & { data: Partial<LinkNodeDataType> })
  >
) => {
  const id = type + "_" + v4()
  switch (type) {
    case "default_node":
      return {
        id,
        type,
        position: template?.position ?? { x: 0, y: 0 },
        data: {
          id,
          name: template?.data?.name ?? "New node",
          response: template?.data?.response ?? {
            id: "response_" + v4(),
            name: "response",
            type: "text",
            data: [{ text: "New node response", priority: 1 }],
          },
          flags: template?.data?.flags ?? [],
          conditions: template?.data?.conditions ?? [],
          global_conditions: template?.data?.global_conditions ?? [],
          local_conditions: template?.data?.local_conditions ?? [],
        },
      }
    case "link_node":
      return {
        id,
        type,
        position: template?.position ?? { x: 0, y: 0 },
        data: {
          id,
          name: template?.data?.name ?? "Link",
          transition: template?.data?.transition ?? {
            target_flow: template?.data?.transition?.target_flow ?? "",
            target_node: template?.data?.transition?.target_flow ?? "",
          },
        },
      }
  }
  return {
    id,
    type,
    position: template?.position ?? { x: 0, y: 0 },
    data: {
      id,
      name: template?.data?.name ?? "New node",
      response: template?.data?.response ?? {
        id: "response_" + v4(),
        name: "response",
        type: "text",
        data: [{ text: "New node response", priority: 1 }],
      },
      flags: template?.data?.flags ?? [],
      conditions: template?.data?.conditions ?? [],
      global_conditions: template?.data?.global_conditions ?? [],
      local_conditions: template?.data?.local_conditions ?? [],
    },
  }
}

