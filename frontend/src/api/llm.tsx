import {
  ILlmConfig,
  IToken,
  ITokenFormData,
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

export const getLLMTokens = async (): Promise<IToken[]> => {
  try {
    const { data } = await $v1.get('/config/llms/tokens')
    return data
    // return [
    //   { id: 1, name: 't1', provider: 'openai' },
    //   { id: 2, name: 't2', provider: 'openai' },
    // ]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createLLMToken = async (token: ITokenFormData) => {
  try {
    const { data } = await $v1.post(
      `/config/llms/token?provider=${token.provider}&token_name=${token.name}&token_value=${token.value}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateLLMToken = async (
  oldToken: IToken,
  newToken: Partial<IToken>,
) => {
  try {
    const params = new URLSearchParams({
      provider: oldToken.provider,
      token_id: String(oldToken.id),
    })

    if (newToken.name) params.append('new_token_name', newToken.name)
    if (newToken.value) params.append('new_token_value', newToken.value)

    const { data } = await $v1.patch(`/config/llms/token?${params.toString()}`)

    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteLLMToken = async (token_id: number) => {
  try {
    const { data } = await $v1.delete(
      `/config/llms/token?&token_id=${token_id}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getLlmConfigs = async () => {
  try {
    const {
      data: { data },
    } = (await $v1.get('/config/llms')) as {
      data: { data: Record<string, Omit<ILlmConfig, 'name'>> }
    }

    return Object.entries(data).map(([key, value]) => ({
      name: key,
      ...value,
    }))

    // return Object.entries({
    //   cfg1: {
    //     model_name: 'gpt-3.5-turbo',
    //     token_id: 1,
    //     system_prompt: '',
    //   },
    // }).map(([key, value]) => ({
    //   name: key,
    //   ...value,
    // }))
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createLlmConfig = async (config: ILlmConfig) => {
  try {
    const systemPromptString = config?.system_prompt
      ? `&system_prompt=${config.system_prompt}`
      : ''
    const { data } = await $v1.post(
      `/config/llms?config_name=${config.name}&model_name=${config.model_name}&llm_token_id=${config.token_id}${systemPromptString}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateLlmConfig = async (
  oldConfigName: string,
  newConfig: Partial<ILlmConfig>,
) => {
  try {
    const params = new URLSearchParams({
      old_config_name: oldConfigName,
    })
    if (newConfig.name) {
      params.append('new_config_name', newConfig.name)
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

export const deleteLlmConfig = async (configName: string) => {
  try {
    const { data } = await $v1.delete(`config/llms?config_name=${configName}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}
