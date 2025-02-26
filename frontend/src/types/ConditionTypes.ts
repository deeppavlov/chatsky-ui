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
 slot?: string
 button?: {
  button_name: string
 }
 custom?: {
  keywords: string[]
  action: string
  variables: string[]
 }
 structure?: string
}

export type conditionTypeType =
 | "llm"
 | "slot"
 | "button"
 | "python"
 | "custom"
 | "basic"

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
 | "current"
 | "fallback"
 | "start"
 | "previous"

export interface ICondition {
 text?: string
 flags?: { caseSensitive: boolean }
 id?: string
 pattern?: string
 structure?: string
 error?: boolean
 data?: ICondition
}
