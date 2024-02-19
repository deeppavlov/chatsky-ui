import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { useSpring, animated, a, useSprings, useTransition } from '@react-spring/web'
import {
  ArrowBigUp,
  ArrowRight,
  Info,
  MessageCircle,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  RotateCcw,
  Send,
  Smile,
} from 'lucide-react'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatContext } from '../../contexts/chatContext'
import { buildContext } from '../../contexts/buildContext'
import { alertContext } from '../../contexts/alertContext'
import ShadTooltip from '../ShadTooltipComponent'
import NewChatIcon from '../../icons/RunIcons/NewChatIcon'
import { darkContext } from '../../contexts/darkContext'
import axios from 'axios'
import EmojiPicker, { EmojiType } from '../ui/emojiPicker'
import Picker from 'emoji-picker-react'
import { Transition } from 'react-transition-group'

export type chatMessageType = {
  message: string
  source: 'user' | 'bot' | 'warning' | 'error' | 'success'
}

const NewChatComponent = ({ className }: { className?: string }) => {
  const { messages, setMessages } = useContext(chatContext)

  // const [messages, setMessages] = useState<chatMessageType[]>([])
  const [userMessage, setUserMessage] = useState('')
  const [userMessages, setUserMessages] = useState<chatMessageType[]>([])
  const chatRef = useRef<HTMLDivElement>(null)
  const { builded } = useContext(buildContext)
  const {
    logs,
    setLogs,
    connectionStatus,
    setConnectionStatus,
    setLogsPage,
    logsPage,
    chat,
    setChat,
    run,
    setRun,
  } = useContext(buildContext)
  const [isClosed, setIsClosed] = useState(false)
  const statusSocket = useRef<WebSocket>(null)
  const { setNoticeData, setSuccessData, setErrorData } = useContext(alertContext)
  const { dark } = useContext(darkContext)
  const [isEmoji, setIsEmoji] = useState(false)

  const [emojis, setEmojis] = useState<EmojiType[]>([])
  const [emojisPending, setEmojisPending] = useState(false)
  useEffect(() => {
    const getEmojis = async () => {
      setEmojisPending((prev) => true)
      const emojis_data = await axios
        .get('https://emoji-api.com/emojis?access_key=4dd2f9e45b38e17c21b432caf8ac12206775bfef')
        .finally(() => setEmojisPending((prev) => false))
      return emojis_data
    }

    getEmojis()
      .then(({ data }) => {
        setEmojis((prev) => data)
      })
      .catch(() => {
        console.log('emojis load error')
      })
  }, [])

  const transitions = useTransition(messages, {
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0 },
    config: {
      duration: 100,
    },
  })

  const emoji_transition = useTransition(isEmoji, {
    from: { opacity: 0, transform: 'scale(0.5)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.5)' },
    config: {
      duration: 100,
    },
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
    setIsEmoji(false)
  }, [chat])

  useEffect(() => {
    if (builded && !isClosed && run) {
      statusSocket.current = new WebSocket('ws://127.0.0.1:8000/socket')
      setChat(true)

      statusSocket.current.onopen = (e) => {
        console.log(e)
        setConnectionStatus('alive')
        // setSuccessData({ title: 'Bot was successfully connected!' })
        setMessages((prev) => [
          ...prev,
          { message: 'Bot was successfully connected!', source: 'success' },
        ])
      }
      

      statusSocket.current.onmessage = (e) => {
        setLogs((prev: string[]) => [...prev, e.data])
      }

      statusSocket.current.onclose = (e) => {
        console.log(e)
        // setConnectionStatus('broken')
        setNoticeData({ title: 'Connection was closed!' })
        setMessages((prev) => [...prev, { message: 'Connection was closed!', source: 'warning' }])
      }

      statusSocket.current.onerror = (e) => {
        console.log(e)
        setRun((prev) => false)
        setConnectionStatus('broken')
        setErrorData({ title: 'Connection broken!' })
        setMessages((prev) => [...prev, { message: 'Connection was broken!', source: 'error' }])
      }
    }

    if (statusSocket.current) {
      return () => {
        statusSocket.current.close()
        setConnectionStatus('closed')
      }
    }
  }, [run])

  useEffect(() => {
    chatRef.current.scrollTo({ behavior: 'smooth', top: chatRef.current.scrollHeight })
  }, [messages])

  const toggleChatHandler = useCallback(() => {
    setChat(!chat)
  }, [chat])

  const onMessage = (mouseClick: boolean, e?: React.KeyboardEvent) => {
    setIsEmoji((prev) => false)
    if (e && e.key === 'Enter' && !mouseClick) {
      e.preventDefault()
      if (userMessage) {
        setMessages((prev) => [...prev, { message: userMessage, source: 'user' }])
        setUserMessages((prev) => [...prev, { message: userMessage, source: 'user' }])
        setUserMessage((prev) => '')
      }
    } else if (mouseClick && userMessage) {
      setMessages((prev) => [...prev, { message: userMessage, source: 'user' }])
      setUserMessages((prev) => [...prev, { message: userMessage, source: 'user' }])
      setUserMessage((prev) => '')
    }
  }

  // const emojiAnimStyle = useSpring({
  //   from: {
  //     opacity: (isEmoji && chat) ? 0 : 1,
  //     scale: (isEmoji && chat) ? '25%' : '100%',
  //   },
  //   to: {
  //     opacity: (isEmoji && chat) ? 1 : 0,
  //     scale: (isEmoji && chat) ? '100%' : '25%',
  //   },
  //   config: {
  //     duration: 200
  //   }
  // })

  return (
    <div
      className={
        className +
        ' ' +
        `chat-wrapper ${
          chat ? '' : 'translate-x-full'
        } w-[25vw] max-w-md flex-col items-start justify-start transition-transform duration-300`
      }>
      <div className="chat-header relative flex h-12 flex-row items-center justify-between border-b border-border px-4">
        <div className="chat-header-title flex flex-row items-center justify-start gap-2">
          <NewChatIcon />
          <p> Chat </p>
        </div>
        <div className="chat-header-buttons flex flex-row items-center justify-start gap-2">
          <button onClick={toggleChatHandler}>
            <Cross1Icon />
          </button>
        </div>
      </div>
      <div
        ref={chatRef}
        className="chat-main flex flex-col items-center justify-start gap-3 overflow-y-scroll bg-chat px-4 py-3 transition-all duration-100">
        {transitions((style, m) => (
          <a.div
            style={style}
            className={`flex w-full flex-row items-center ${
              m.source === 'bot' ||
              m.source === 'warning' ||
              m.source === 'success' ||
              m.source === 'error'
                ? 'justify-start'
                : 'justify-end'
            }`}>
            <p
              className={`rounded-t-lg bg-card p-2 ${m.source === 'warning' && 'bg-yellow-600'} ${
                m.source === 'success' && 'bg-green-600'
              } ${m.source === 'error' && 'bg-red-600'} ${
                m.source === 'bot' ||
                m.source === 'warning' ||
                m.source === 'success' ||
                m.source === 'error'
                  ? 'rounded-br-lg'
                  : 'rounded-bl-lg'
              } flex flex-row justify-between gap-2 `}>
              {m.message}
              {(m.source === 'warning' || m.source === 'error' || m.source === 'success') && (
                <ShadTooltip content={`This is a service message`}>
                  <Info
                    stroke="hsl(var(--foreground))"
                    className="h-4 w-4 cursor-pointer"
                  />
                </ShadTooltip>
              )}
            </p>
          </a.div>
        ))}
      </div>
      <div className="chat-system relative flex flex-row justify-between border-b border-border px-2">
        <div>
          <button className="my-2 flex flex-row items-center justify-center gap-2 rounded-lg p-1.5 transition hover:bg-accent">
            <Paperclip />
          </button>
        </div>
        <div className="flex items-center justify-end gap-1">
          <div className="relative flex items-center justify-center">
            <button onClick={() => setIsEmoji(!isEmoji)}>
              <Smile
                className={` h-max w-max rounded-lg p-1.5 transition hover:bg-accent ${
                  isEmoji ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </button>
            <div className="absolute bottom-12 right-0 z-10 origin-top-right">
              {emoji_transition((style, flag) => (
                <>
                  {chat && flag && (
                    <a.div
                      style={style}
                      className={`origin-bottom-right`}>
                      <EmojiPicker
                        data={emojis}
                        onEmojiClick={(emoji, e) => {
                          setUserMessage((prev) => prev + emoji)
                        }}
                        lazy={false}
                        theme="auto"
                      />
                    </a.div>
                  )}
                </>
              ))}
            </div>
          </div>
          <button onClick={(e) => onMessage(true)}>
            <Send className={` h-max w-max rounded-lg p-1.5 transition hover:bg-accent `} />
          </button>
        </div>
      </div>
      <div className="chat-user h-[160px]">
        <textarea
          onKeyDown={(e) => onMessage(false, e)}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          name="chat"
          id="chat-textarea"
          className="h-full w-full resize-none p-6 outline-none"
          placeholder="Type..."></textarea>
      </div>
      <div className="chat-footer flex h-[48px] flex-row items-center justify-end gap-2 px-2">
        <button
          onClick={() => {
            setMessages([])
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <RotateCcw className="h-4 w-4 -scale-x-100" />
        </button>
        {/* <button className='flex items-center justify-center px-2 h-9 bg-btn-black text-white rounded-lg'>
          Save changes
        </button> */}
      </div>
    </div>
  )
}

export default NewChatComponent
