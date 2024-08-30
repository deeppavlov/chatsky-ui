import { Code2, Text } from "lucide-react"
import ButtonConditionIcon from "./icons/nodes/conditions/ButtonConditionIcon"
import CodeConditionIcon from "./icons/nodes/conditions/CodeConditionIcon"
import CustomConditionIcon from "./icons/nodes/conditions/CustomConditionIcon"
import LLMConditionIcon from "./icons/nodes/conditions/LLMConditionIcon"
import SlotsConditionIcon from "./icons/nodes/conditions/SlotsConditionIcon"
import { conditionLabelType } from "./types/ConditionTypes"

export const NODE_TYPES = {
  default_node: "default_node",
  // start_node: "start_node",
  // fallback_node: "fallback_node",
}

export const NODE_NAMES = [
  "Beginning of conversation",
  "Weather discussion",
  "Question about work",
  "Talking about hobbies",
  "Family talk",
  "Weekend plans",
  "Movie discussion",
  "Exchanging opinions on books",
  "Travel talk",
  "Sports discussion",
  "Talking about friends",
  "News discussion",
  "Music talk",
  "Food discussion",
  "Vacation plans",
  "Pets discussion",
  "Health talk",
  "Technology discussion",
  "Childhood story",
  "Art talk",
  "Future plans",
  "Politics discussion",
  "Culture talk",
  "Education story",
  "Social problems discussion",
  "Evening plans",
  "Relationship talk",
  "Science talk",
  "Interests story",
  "Economy discussion",
  "Year plans",
  "History talk",
  "Environmental talk",
  "Work experience story",
  "Philosophy talk",
  "Month plans",
  "Rest talk",
  "Psychology discussion",
  "Study story",
  "Transportation discussion",
  "Day plans",
  "Society talk",
  "Medicine discussion",
  "Leisure story",
  "Fashion discussion",
  "Minute plans",
  "Technology talk",
  "Culinary discussion",
  "Friends story",
  "Music discussion",
  "Second plans",
  "Education talk",
  "Literature discussion",
  "Ideas story",
  "Entertainment discussion",
  "Hour plans",
  "Economy talk",
  "Science discussion",
  "Experience story",
  "Political discussion",
  "Now plans",
  "Sport talk",
  "Movie discussion",
  "Family story",
  "Travel discussion",
  "Second plans",
  "Economic talk",
  "Art discussion",
  "Interest story",
  "Finance discussion",
  "Morning plans",
  "Society talk",
  "Medical discussion",
  "Study story",
  "Transportation discussion",
  "Evening plans",
  "Fashion talk",
  "Psychology discussion",
  "Leisure story",
  "Entertainment discussion",
  "Night plans",
  "Literature talk",
  "Culinary discussion",
  "Technology story",
  "Music discussion",
  "Next year plans",
  "Movie talk",
  "Travel discussion",
  "Family story",
  "Sports talk",
  "Plans for the next year",
  "Book talk",
  "Cooking discussion",
  "Technology story",
  "Music talk",
  "Next year plans",
]

export const START_FALLBACK_NODE_FLAGS = ["start", "fallback"]
export const START_NODE_FLAGS = ["start"]
export const FALLBACK_NODE_FLAGS = ["fallback"]

export const NODES = {
  default_node: {
    name: "Default Node",
    type: "default_node",
    dragHandle: ".custom-drag-handle",
    conditions: [],
    global_conditions: [],
    local_conditions: [],
    response: {
      name: "default_response",
      type: "text",
      data: [{ text: "I am a bot and here is my quote ", priority: 1 }],
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
  link_node: {
    name: "Link",
    type: "link_node",
    dragHandle: "",
    transition: {
      target_flow: "",
      target_node: "",
    },
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

export const conditionTypeIcons = {
  python: <CodeConditionIcon />,
  custom: <CustomConditionIcon />,
  slot: <SlotsConditionIcon />,
  button: <ButtonConditionIcon />,
  llm: <LLMConditionIcon />,
}

export const responseTypeIcons = {
  python: <Code2 />,
  text: <Text />,
  llm: <LLMConditionIcon />,
}
