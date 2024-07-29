
export type responseTypeType = "python" | "llm" | "custom" | "text"

export type responseDataType = {
  priority: number
  text?: string
  python?: {
    action: string
  }
  llm?: {
    prompt: string
    api_key: string
    model_name: string
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
}