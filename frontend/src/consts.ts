import { conditionLabelType } from "./types/ConditionTypes"

export const NODE_TYPES = {
  default_node: "default_node",
  // start_node: "start_node",
  // fallback_node: "fallback_node",
}

export const START_FALLBACK_NODE_FLAGS = ["start", "fallback"]
export const START_NODE_FLAGS = ["start"]
export const FALLBACK_NODE_FLAGS = ["fallback"]

export const NODES = {
  default_node: {
    name: "Default Node",
    type: "default_node",
    conditions: [],
    global_conditions: [],
    local_conditions: [],
    response: {
      name: "default_response",
      type: "text",
      data: [{ text: "Default node response", priority: 1 }],
    },
  },
  // start_node: {
  //   name: "Start Node",
  //   type: "start_node",
  //   conditions: [],
  //   global_conditions: [],
  //   local_conditions: [],
  //   response: "Start response",
  // },
  // fallback_node: {
  //   name: "Fallback Node",
  //   type: "fallback_node",
  //   conditions: [],
  //   global_conditions: [],
  //   local_conditions: [],
  //   response: "Fallback response",
  // },
  default_link: {
    name: "Link",
    type: "link",
    conditions: [],
    global_conditions: [],
    local_conditions: [],
    response: {
      name: "Link response",
      type: "text",
      data: [{ text: "Link response", priority: 1 }],
    }
  },
}

export const FLOW_COLORS = [
  "#FF3333",
  "#FF9500",
  "#FFCC00",
  "#00CC99",
  "#3300FF",
  "#7000FF",
  "#CC66CC",
  "#FF3366",
]

export const CONDITION_LABELS: {
  [key: string]: conditionLabelType
} = {
  manual: "manual",
  forward: "forward",
  backward: "backward",
  repeat: "repeat",
  fallback: "fallback",
  start: "start",
  previous: "previous",
}
