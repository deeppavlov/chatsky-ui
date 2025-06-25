export type conditionDataType = {
  priority: number
  transition_type: conditionLabelType
  llm?: {
    prompt: string
    llm_config_id: string
  }
  python?: {
    action: string
  }
  slot?: string
  custom?: {
    keywords: string[]
    action: string
    variables: string[]
  }
  structure?: string
  button?: IButtonType
}

export interface IButtonType {
  text: string
  callback?: string
  type: string
  id: string
}

export type conditionTypeType =
  | 'llm'
  | 'slot'
  | 'button'
  | 'python'
  | 'custom'
  | 'basic'

export type conditionType = {
  id: string
  name: string
  type: conditionTypeType
  data: conditionDataType
}

export type conditionLabelType =
  | 'manual'
  | 'forward'
  | 'backward'
  | 'current'
  | 'fallback'
  | 'start'
  | 'previous'

export interface ICondition {
  text?: string
  flags?: { caseSensitive: boolean }
  id?: string
  pattern?: string
  structure?: string
  error?: boolean
  data?: ICondition
}

export interface ILLMConditionHandle {
  validate: () => boolean
}
