import {
  ILlmConfig,
  ILlmConfigs,
  IToken,
  ITokenFormData,
  ITokens,
  LlmProviders,
} from '@/types/llmTypes'
import { $v1 } from '.'

export const getLlmProviders = async (): Promise<LlmProviders> => {
  try {
    const { data } = await $v1.get('/config/providers')
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getLLMTokens = async (): Promise<ITokens> => {
  try {
    const {
      data: { data },
    } = await $v1.get('/config/llms/tokens')

    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createLLMToken = async (
  token: ITokenFormData,
): Promise<string> => {
  try {
    const {
      data: { token_id },
    } = await $v1.post(
      `/config/llms/token?provider=${token.provider}&token_name=${token.name}&token_value=${token.value}`,
    )
    return token_id
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateLLMToken = async (
  token_id: string,
  newToken: Partial<IToken>,
) => {
  try {
    const params = new URLSearchParams({ token_id })

    if (newToken.name) params.append('new_token_name', newToken.name)
    if (newToken.value) params.append('new_token_value', newToken.value)
    if (newToken.provider) params.append('new_provider', newToken.provider)

    const { data } = await $v1.patch(`/config/llms/token?${params.toString()}`)

    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteLLMToken = async (token_id: string) => {
  try {
    const { data } = await $v1.delete(`/config/llms/token?&id=${token_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getLlmConfigs = async (): Promise<ILlmConfigs> => {
  try {
    const {
      data: { data },
    } = await $v1.get('/config/llms')
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createLlmConfig = async (config: Omit<ILlmConfig, 'id'>) => {
  try {
    const systemPromptString = config?.system_prompt
      ? `&system_prompt=${config.system_prompt}`
      : ''
    const {
      data: { config_id },
    } = await $v1.post(
      `/config/llms?config_name=${config.config_name}&model_name=${config.model_name}&llm_token_id=${config.token_id}${systemPromptString}`,
    )
    return config_id
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateLlmConfig = async (
  config_id: string,
  newConfig: Partial<ILlmConfig>,
) => {
  try {
    const params = new URLSearchParams({ config_id })
    if (newConfig.config_name) {
      params.append('new_config_name', newConfig.config_name)
    }
    if (newConfig.model_name) {
      params.append('model_name', newConfig.model_name)
    }
    if (newConfig.token_id) {
      params.append('llm_token_id', newConfig.token_id.toString())
    }
    if (newConfig.system_prompt) {
      params.append('system_prompt', newConfig.system_prompt)
    }

    const { data } = await $v1.patch(`/config/llms?${params.toString()}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteLlmConfig = async (config_id: string) => {
  try {
    const { data } = await $v1.delete(`config/llms?config_id=${config_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getDefaultConfigId = async (): Promise<string> => {
  try {
    const {
      data: { data },
    } = await $v1.get(`config/llms/default`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const setDefaultConfigId = async (id: string) => {
  try {
    const { data } = await $v1.post(`config/llms/default/?config_id=${id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}
