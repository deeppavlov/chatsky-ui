export type conditionDataType = {
  priority: number
  transition_type: conditionLabelType
  llm?: {
    prompt: string
    api_key: string
    model_name: string
  }
  python?: {
    action: string
  }
  slot?: {
    slot_id: string
  }
  button?: {
    button_name: string
  }
  custom?: {
    keywords: string[]
    action: string
    variables: string[]
  }
}

export type conditionTypeType = "llm" | "slot" | "button" | "python" | "custom"

export type conditionType = {
  id: string
  name: string
  type: conditionTypeType
  data: conditionDataType
}

export type conditionLabelType =
  | "manual"
  | "forward"
  | "backward"
  | "repeat"
  | "fallback"
  | "start"
  | "previous"
