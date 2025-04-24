import { getLlmConfigs, getLlmProviders, getLLMTokens } from '@/api/llm'
import { ILlmConfig, IToken, LlmProviders } from '@/types/llmTypes'
import React, { createContext, useEffect, useState } from 'react'

type llmContextType = {
  llmProviders: LlmProviders
  tokens: IToken[]
  setTokens: React.Dispatch<React.SetStateAction<IToken[]>>
  llms: string[]
  llmConfigs: ILlmConfig[]
  setLlmConfigs: React.Dispatch<React.SetStateAction<ILlmConfig[]>>
}

export const LlmContext = createContext<llmContextType>({
  llmProviders: {},
  tokens: [],
  setTokens: () => {},
  llms: [],
  llmConfigs: [],
  setLlmConfigs: () => {},
})

interface ProviderProps {
  children: React.ReactNode
}

const LlmProvider = ({ children }: ProviderProps) => {
  const [llmProviders, setLlmProviders] = useState<LlmProviders>({})
  const [tokens, setTokens] = useState<IToken[]>([])
  const [llmConfigs, setLlmConfigs] = useState<ILlmConfig[]>([])
  const llms = Object.values(llmProviders).flat()

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
  console.log('configs', llmConfigs)

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
        llms,
        llmConfigs,
        setLlmConfigs,
      }}
    >
      {children}
    </LlmContext.Provider>
  )
}

export default LlmProvider
