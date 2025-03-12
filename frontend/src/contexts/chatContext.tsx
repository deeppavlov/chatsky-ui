import { createContext, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useLocalStorage from '../hooks/useLocalStorage'

export type messageType = {
  message: string
  type: 'user' | 'bot' | 'system'
}

interface IChatHistory {
  [runId: number]: messageType[]
}

type chatContextType = {
  chatId: number
  setChatId: React.Dispatch<React.SetStateAction<number>>
  chatHistory: IChatHistory
  setChatHistory: React.Dispatch<React.SetStateAction<IChatHistory>>
  setMessages: (messages: messageType[]) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const chatContext = createContext({} as chatContextType)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const [chatId, setChatId] = useState<number>(-1)
  const [chatHistory, setChatHistory] = useLocalStorage<{
    [runId: number]: messageType[]
  }>('chat_messages', {})
  const setMessages = (messages: messageType[]) => {
    setChatHistory((history) => ({ ...history, [chatId]: messages }))
  }

  return (
    <chatContext.Provider
      value={{
        chatId,
        setChatId,
        chatHistory,
        setChatHistory,
        setMessages,
      }}
    >
      {children}
    </chatContext.Provider>
  )
}
