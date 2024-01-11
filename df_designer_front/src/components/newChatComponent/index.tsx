import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useSpring, animated, a, useSprings, useTransition } from '@react-spring/web'
import { MessageCircle, Paperclip, RotateCcw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export type chatMessageType = {
  message: string
  source: "user" | "bot"
}

const NewChatComponent = () => {



  const [messages, setMessages] = useState<chatMessageType[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [userMessages, setUserMessages] = useState<chatMessageType[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  // const [botMessages, setBotMessages] = useState([])

  const [props, api] = useSpring(
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
    }),
    [messages.length]
  )

  const transitions = useTransition(messages, {
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 1 },
    config: {
      duration: 100
    }
  })

  useEffect(() => {
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          message: 'Hi! I’m a bot. How can I help you?',
          source: 'bot'
        }
      ])
    }, 2000);
  }, [userMessages])

  useEffect(() => {
    chatRef.current.scrollTo({ behavior: 'smooth', top: chatRef.current.scrollHeight })
  }, [messages])

  return (
    <div className='chat-wrapper w-1/4 flex-col items-start justify-start'>
      <div className='chat-header border-b border-border flex flex-row items-center justify-between h-12 px-4'>
        <div className="chat-header-title flex flex-row items-center justify-start gap-2">
          <MessageCircle />
          <p> Chat </p>
        </div>
        <div className="chat-header-buttons flex flex-row items-center justify-start gap-2">
          <button className='chat-header-logs-btn flex flex-row items-center justify-center gap-2 bg-accent py-1 px-2 rounded-lg'>
            <ActivityLogIcon />
            Logs
          </button>
          <button>
            <Cross1Icon />
          </button>
        </div>
      </div>
      <div ref={chatRef} className="chat-main bg-chat flex flex-col items-center justify-start gap-3 py-3 px-2 overflow-y-scroll transition-all duration-100">
        {/* {messages.map((m) => (
          <a.div style={props} className={`w-full flex flex-row items-center ${m.source === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <p className={`bg-card p-2 rounded-t-lg ${m.source === 'bot' ? 'rounded-br-lg' : 'rounded-bl-lg'} `}>
              {m.message}
            </p>
          </a.div>
        ))} */}
        {transitions((style, m) => (
          <a.div style={style} className={`w-full flex flex-row items-center ${m.source === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <p className={`bg-card p-2 rounded-t-lg ${m.source === 'bot' ? 'rounded-br-lg' : 'rounded-bl-lg'} `}>
              {m.message}
            </p>
          </a.div>
        ))}
      </div>
      <div className="chat-system px-2 border-b border-border">
        <button className='flex flex-row items-center my-2 justify-center gap-2 bg-accent px-2 py-1 rounded-lg'>
          <Paperclip />
          Attach files
        </button>
      </div>
      <div className="chat-user h-[160px]">
        <textarea onKeyDown={(e) => {
          console.log(e.key)
          if (e.key === "Enter") {
            e.preventDefault()
            setMessages(prev => [...prev, { message: userMessage, source: 'user' }])
            setUserMessages(prev => [...prev, { message: userMessage, source: 'user' }])
            setUserMessage(prev => '')
          }
        }}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          name="chat"
          id="chat-textarea"
          className='p-6 w-full h-full outline-none resize-none'
          placeholder='Type...'
        ></textarea>
      </div>
      <div className="chat-footer h-[48px] flex flex-row items-center justify-end gap-2 px-2">
        <button className='flex items-center justify-center w-9 h-9 bg-accent rounded-lg'>
          <RotateCcw className='w-4 h-4 -scale-x-100' />
        </button>
        <button className='flex items-center justify-center px-2 h-9 bg-btn-black text-white rounded-lg'>
          Save changes
        </button>
      </div>
    </div>
  )
}

export default NewChatComponent