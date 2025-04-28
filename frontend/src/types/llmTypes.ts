export type LlmProviders = Record<string, string[]>

export interface IToken {
  id?: number
  name: string
  provider: string
  value?: string
}

export interface ITokenFormData extends IToken {
  value: string
}

export interface ILlmConfig {
  id?: number
  name: string
  model_name: string
  token_id?: number
  system_prompt?: string
}
