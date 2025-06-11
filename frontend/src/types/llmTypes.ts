export type LlmProviders = Record<string, string[]>

export interface IToken {
  name: string
  provider: string
  value?: string
}

export interface ITokens {
  [id: string]: IToken
}

export interface ITokenFormData extends IToken {
  value: string
}

export interface ILlmConfig {
  name: string
  model_name: string
  token_id: string
  system_prompt: string
}

export interface ILlmConfigs {
  [id: string]: ILlmConfig
}
