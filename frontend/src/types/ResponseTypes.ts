export type responseTypeType = 'python' | 'llm' | 'custom' | 'text' | 'basic'

export type responseDataType = {
  priority: number
  text?: string
  python?: {
    action: string
  }

  llm?: {
    prompt: string
    llm_config_id: string
    context_memory_index: number
  }

  custom?: {
    keywords: string[]
    action: string
    variables: string[]
  }
}

export type responseType = {
  id: string
  name: string
  type: responseTypeType
  data: responseDataType[]
  buttons?: IButtonType[][]
  hideButtons?: boolean
}

export interface IButtonType {
  text: string
  callback?: string
  type?: string
  id: string
}

export interface IInputError {
  isInvalid: boolean
  errorMessage?: string
}

export interface ILLMResponseHandle {
  validate: () => boolean
}
