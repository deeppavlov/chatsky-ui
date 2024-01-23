import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useSpring, animated, a, useSprings, useTransition } from '@react-spring/web'
import { ArrowRight, Info, MessageCircle, PanelRightClose, PanelRightOpen, Paperclip, RotateCcw } from 'lucide-react'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatContext } from '../../contexts/chatContext'
import { buildContext } from '../../contexts/buildContext'
import { alertContext } from '../../contexts/alertContext'
import ShadTooltip from '../ShadTooltipComponent'

export type chatMessageType = {
  message: string
  source: "user" | "bot" | "warning" | "error" | "success"
}

const NewChatComponent = ({ className }: { className?: string }) => {

  const { messages, setMessages } = useContext(chatContext)

  // const [messages, setMessages] = useState<chatMessageType[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [userMessages, setUserMessages] = useState<chatMessageType[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const { builded } = useContext(buildContext)
  const { logs, setLogs, connectionStatus, setConnectionStatus, setLogsPage, logsPage } = useContext(buildContext)
  const [isClosed, setIsClosed] = useState(false)
  const statusSocket = useRef<WebSocket>(null)
  const { setNoticeData, setSuccessData, setErrorData } = useContext(alertContext)
  // const [botMessages, setBotMessages] = useState([])

  const transitions = useTransition(messages, {
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0 },
    config: {
      duration: 100
    }
  })

  // useEffect(() => {
  //   setTimeout(() => {
  //     setMessages(prev => [
  //       ...prev,
  //       {
  //         message: 'Hi! I’m a bot. How can I help you?',
  //         source: 'bot'
  //       }
  //     ])
  //   }, 2000);
  // }, [userMessages])

  useEffect(() => {

    if (builded && !isClosed) {
      statusSocket.current = new WebSocket('ws://127.0.0.1:8000/socket')
      setChatIsOpen(true)

      statusSocket.current.onopen = (e) => {
        console.log(e)
        setConnectionStatus('alive')
        // setSuccessData({ title: 'Bot was successfully connected!' })
        setMessages(prev => [...prev, { message: 'Bot was successfully connected!', source: 'success' }])
      }


      statusSocket.current.onmessage = (e) => {
        setLogs((prev: string[]) => [...prev, e.data])
      }

      statusSocket.current.onclose = (e) => {
        console.log(e)
        setConnectionStatus('closed')
        setNoticeData({ title: 'Connection was closed!' })
        setMessages(prev => [...prev, { message: 'Connection was closed!', source: 'warning' }])
      }

      statusSocket.current.onerror = (e) => {
        console.log(e)
        setConnectionStatus('broken')
        setErrorData({ title: 'Connection broken!' })
        setMessages(prev => [...prev, { message: 'Connection was broken!', source: 'error' }])
      }
    }

    if (statusSocket.current) {
      return () => statusSocket.current.close()
    }

  }, [builded])

  useEffect(() => {
    chatRef.current.scrollTo({ behavior: 'smooth', top: chatRef.current.scrollHeight })
  }, [messages])

  const [chatIsOpen, setChatIsOpen] = useState(window.location.pathname === '/preview')

  const closeChatHandler = useCallback(() => {
    setChatIsOpen(!chatIsOpen)
  }, [chatIsOpen])

  return (
    <div className={className + ' ' + `chat-wrapper ${chatIsOpen ? '' : 'translate-x-full'} transition-transform duration-300 w-[25vw] max-w-md flex-col items-start justify-start`}>
      <div className='chat-header relative border-b border-border flex flex-row items-center justify-between h-12 px-4'>
        <button onClick={closeChatHandler} className={`absolute top-full ${chatIsOpen ? '' : 'right-0'} -left-12 w-12 h-12 flex items-center justify-center border border-border bg-background rounded-l-lg`}>
          <PanelRightOpen className={`absolute w-6 h-6 transition-opacity duration-500 ${chatIsOpen ? 'opacity-0' : 'opacity-100'}`} />
          <PanelRightClose className={`absolute w-6 h-6 transition-opacity duration-500 ${chatIsOpen ? 'opacity-100' : 'opacity-0'}`} />
        </button>
        <div className="chat-header-title flex flex-row items-center justify-start gap-2">
          <MessageCircle />
          <p> Chat </p>
        </div>
        <div className="chat-header-buttons flex flex-row items-center justify-start gap-2">
          <button onClick={() => setLogsPage(!logsPage)} className={`chat-header-logs-btn flex flex-row items-center justify-center gap-2 border border-transparent bg-accent ${logsPage && 'bg-muted border-border'} py-1 px-2 rounded transition`}>
            <ActivityLogIcon />
            Logs
          </button>
          {/* <button onClick={closeChatHandler}>
            <Cross1Icon />
          </button> */}
        </div>
      </div>
      <div ref={chatRef} className="chat-main bg-chat flex flex-col items-center justify-start gap-3 py-3 px-4 overflow-y-scroll transition-all duration-100">
        {/* {messages.map((m) => (
          <a.div style={props} className={`w-full flex flex-row items-center ${m.source === 'bot' ? 'justify-start' : 'justify-end'}`}>
            <p className={`bg-card p-2 rounded-t-lg ${m.source === 'bot' ? 'rounded-br-lg' : 'rounded-bl-lg'} `}>
              {m.message}
            </p>
          </a.div>
        ))} */}
        {transitions((style, m) => (
          <a.div style={style} className={`w-full flex flex-row items-center ${(m.source === 'bot' || m.source === 'warning' || m.source === 'success' || m.source === 'error') ? 'justify-start' : 'justify-end'}`}>
            <p className={`bg-card p-2 rounded-t-lg ${m.source === 'warning' && 'bg-yellow-600'} ${m.source === 'success' && 'bg-green-600'} ${m.source === 'error' && 'bg-red-600'} ${(m.source === 'bot' || m.source === 'warning' || m.source === 'success' || m.source === 'error') ? 'rounded-br-lg' : 'rounded-bl-lg'} flex flex-row justify-between gap-2 `}>
              {m.message}
              {
                (m.source === 'warning' || m.source === 'error' || m.source === 'success')
                &&
                <ShadTooltip content={`This is a service message`}><Info stroke='hsl(var(--foreground))' className='w-4 h-4 cursor-pointer' /></ShadTooltip>}
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
        <button onClick={() => { setMessages([]) }} className='flex items-center justify-center w-9 h-9 bg-accent rounded-lg'>
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