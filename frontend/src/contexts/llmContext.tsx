import { getLlmConfigs, getLlmProviders, getLLMTokens } from '@/api/llm'
import { ILlmConfig, IToken, LlmProviders } from '@/types/llmTypes'
import React, { createContext, useEffect, useState } from 'react'

type llmContextType = {
  llmProviders: LlmProviders
  tokens: IToken[]
  setTokens: React.Dispatch<React.SetStateAction<IToken[]>>
  llmConfigs: ILlmConfig[]
  setLlmConfigs: React.Dispatch<React.SetStateAction<ILlmConfig[]>>
  editingConfig: ILlmConfig | null
  setEditingConfig: React.Dispatch<React.SetStateAction<ILlmConfig | null>>
}

export const LlmContext = createContext<llmContextType>({
  llmProviders: {},
  tokens: [],
  setTokens: () => {},
  llmConfigs: [],
  setLlmConfigs: () => {},
  editingConfig: null,
  setEditingConfig: () => {},
})

interface ProviderProps {
  children: React.ReactNode
}

const LlmProvider = ({ children }: ProviderProps) => {
  const [llmProviders, setLlmProviders] = useState<LlmProviders>({})
  const [tokens, setTokens] = useState<IToken[]>([])
  const [llmConfigs, setLlmConfigs] = useState<ILlmConfig[]>([])
  const [editingConfig, setEditingConfig] = useState<ILlmConfig | null>(null)

  const fetchLlmProviders = async () => {
    const services = (await getLlmProviders()) as LlmProviders
    setLlmProviders(services)
  }
  const fetchTokens = async () => {
    const tokens = await getLLMTokens()
    const formattedTokens = tokens.map((t) => ({ name: t[0], provider: t[1] }))
    setTokens(formattedTokens)
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
