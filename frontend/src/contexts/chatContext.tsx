import { getChatHistory } from '@/api/bot'
import { createContext, useEffect, useState } from 'react'

export type messageType = {
  message: string
  type: 'user' | 'bot' | 'system'
}

type chatContextType = {
  chatId: number
  setChatId: React.Dispatch<React.SetStateAction<number>>
  chatHistory: messageType[]
  setChatHistory: React.Dispatch<React.SetStateAction<messageType[]>>
}

// eslint-disable-next-line react-refresh/only-export-components
export const chatContext = createContext({} as chatContextType)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatId, setChatId] = useState<number>(-1)

  const [chatHistory, setChatHistory] = useState<Array<messageType>>([])

  useEffect(() => {
    if (chatId < 0) return
    const getHistory = async () => {
      try {
        const history = (await getChatHistory(chatId)) || []
        setChatHistory(
          history.reduce((acc, [userMessage, botMessage]) => {
            return [
              ...acc,
              { message: userMessage, type: 'user' },
              { message: botMessage, type: 'bot' },
            ]
          }, [] as messageType[]),
        )
      } catch (e) {
        console.log(e)
        setChatHistory([])
      }
    }
    getHistory()
  }, [chatId])

  return (
    <chatContext.Provider
      value={{
        chatId,
        setChatId,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </chatContext.Provider>
  )
}
