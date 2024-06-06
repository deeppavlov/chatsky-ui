import { createContext, useState } from "react"
import { useSearchParams } from "react-router-dom"

export type messageType = {
  message: string
  type: "user" | "bot" | "system"
}

type chatContextType = {
  chat: boolean
  setChat: React.Dispatch<React.SetStateAction<boolean>>
  messages: messageType[]
  setMessages: React.Dispatch<React.SetStateAction<messageType[]>>
}

// eslint-disable-next-line react-refresh/only-export-components
export const chatContext = createContext({} as chatContextType)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const [chat, setChat] = useState(searchParams.get('chat') === 'opened')
  const [messages, setMessages] = useState<messageType[]>([])
  console.log(chat)

  return (
    <chatContext.Provider
      value={{
        chat,
        setChat,
        messages,
        setMessages,
      }}>
      {children}
    </chatContext.Provider>
  )
}
