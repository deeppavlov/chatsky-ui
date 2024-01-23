import { createContext, useEffect, useState } from "react";
import { chatMessageType } from "../components/newChatComponent";

type chatContextType = {
  messages: chatMessageType[],
  setMessages: (newState: {}) => void;
};

const initialValue: chatContextType = {
  messages: [],
  setMessages: () => { }
};

export const chatContext = createContext<chatContextType>(initialValue);

export function ChatProvider({ children }) {

  const [messages, setMessages] = useState<chatMessageType[]>([
    {
      message: 'Your bot is not started! Please, complete configuration, build and start your bot to see messages here! ',
      source: 'bot'
    }
  ])


  return (
    <chatContext.Provider
      value={{
        messages,
        setMessages
      }}
    >
      {children}
    </chatContext.Provider>
  );
}
