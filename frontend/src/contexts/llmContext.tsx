import { getLlmConfigs, getLlmProviders, getLLMTokens } from '@/api/llm'
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
}

export const LlmContext = createContext<llmContextType>({
  llmProviders: {},
  tokens: {},
  setTokens: () => {},
  llmConfigs: {},
  setLlmConfigs: () => {},
  editingConfig: null,
  setEditingConfig: () => {},
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

  useEffect(() => {
    fetchLlmProviders()
    fetchTokens()
    fetchLlmConfigs()
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
      }}
    >
      {children}
    </LlmContext.Provider>
  )
}

export default LlmProvider
