import {
  getDefaultConfigId,
  getLlmConfigs,
  getLlmProviders,
  getLLMTokens,
} from '@/api/llm'
import {
  ILlmConfig,
  ILlmConfigs,
  ITokens,
  LlmProviders,
} from '@/types/llmTypes'
import React, { createContext, useEffect, useState } from 'react'

type llmContextType = {
  llmProviders: LlmProviders
  tokens: ITokens
  setTokens: React.Dispatch<React.SetStateAction<ITokens>>
  llmConfigs: ILlmConfigs
  setLlmConfigs: React.Dispatch<React.SetStateAction<ILlmConfigs>>
  editingConfig: (ILlmConfig & { id: string }) | null
  setEditingConfig: React.Dispatch<
    React.SetStateAction<(ILlmConfig & { id: string }) | null>
  >
  defaultLlmConfig: (ILlmConfig & { id: string }) | null
  setDefaultLlmConfig: React.Dispatch<
    React.SetStateAction<(ILlmConfig & { id: string }) | null>
  >
}

export const LlmContext = createContext<llmContextType>({
  llmProviders: {},
  tokens: {},
  setTokens: () => {},
  llmConfigs: {},
  setLlmConfigs: () => {},
  editingConfig: null,
  setEditingConfig: () => {},
  defaultLlmConfig: null,
  setDefaultLlmConfig: () => {},
})

interface ProviderProps {
  children: React.ReactNode
}

const LlmProvider = ({ children }: ProviderProps) => {
  const [llmProviders, setLlmProviders] = useState<LlmProviders>({})
  const [tokens, setTokens] = useState<ITokens>({})
  const [llmConfigs, setLlmConfigs] = useState<ILlmConfigs>({})
  const [editingConfig, setEditingConfig] = useState<
    (ILlmConfig & { id: string }) | null
  >(null)
  const [defaultLlmConfig, setDefaultLlmConfig] = useState<
    (ILlmConfig & { id: string }) | null
  >(null)

  const fetchLlmProviders = async () => {
    const services = (await getLlmProviders()) as LlmProviders
    setLlmProviders(services)
  }
  const fetchTokens = async () => {
    const tokens = await getLLMTokens()
    setTokens(tokens)
  }

  const fetchLlmConfigs = async () => {
    const configs = await getLlmConfigs()
    setLlmConfigs(configs)
  }

  const fetchDefaultLlmConfigId = async () => {
    const configId = await getDefaultConfigId()
    const defaultConfig = { ...llmConfigs[configId], id: configId }

    setDefaultLlmConfig(defaultConfig)
  }

  useEffect(() => {
    fetchLlmProviders()
    fetchTokens()
    fetchLlmConfigs()
    fetchDefaultLlmConfigId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LlmContext.Provider
      value={{
        llmProviders,
        tokens,
        setTokens,
        llmConfigs,
        setLlmConfigs,
        editingConfig,
        setEditingConfig,
        defaultLlmConfig,
        setDefaultLlmConfig,
      }}
    >
      {children}
    </LlmContext.Provider>
  )
}

export default LlmProvider
