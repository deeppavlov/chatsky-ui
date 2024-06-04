export type conditionDataType = {
  priority: number
  prompt?: string
  api_key?: string
  action?: string
  model_name?: string
}

export type conditionTypeType = "llm" | "slot" | "button" | "python" | "custom"

export type conditionType = {
  id: string
  name: string
  type: conditionTypeType
  data: conditionDataType
}
