import React, { useContext, useEffect, useRef, useState } from "react"
import { buildContext } from "../../contexts/buildContext"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import classNames from "classnames"
import { ChevronLeft, Paperclip, Send, Smile, X } from "lucide-react"
import MonitorIcon from "../../icons/buildmenu/MonitorIcon"
import { Button, Textarea } from "@nextui-org/react"
import { useSearchParams } from "react-router-dom"
import { parseSearchParams } from "../../utils"
import { chatContext, messageType } from "../../contexts/chatContext"
import { useTransition, a } from "@react-spring/web"
import EmojiPicker, { EmojiType } from "./EmojiPicker"
import axios from "axios"
import { runContext } from "../../contexts/runContext"
import toast from "react-hot-toast"
import { parse, stringify } from "yaml"

const Chat = () => {
  const { logsPage, setLogsPage } = useContext(buildContext)
  const { chat, setChat, messages, setMessages } = useContext(chatContext)
  const { run, runStatus } = useContext(runContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const ws = useRef<WebSocket | null>(null)

  const [isEmoji, setIsEmoji] = useState(false)

  const [emojis, setEmojis] = useState<EmojiType[]>([])
  const [emojisPending, setEmojisPending] = useState(false)
  useEffect(() => {
    const getEmojis = async () => {
      setEmojisPending((prev) => true)
      const emojis_data = await axios
        .get("https://emoji-api.com/emojis?access_key=4dd2f9e45b38e17c21b432caf8ac12206775bfef")
        .finally(() => setEmojisPending((prev) => false))
      return emojis_data
    }

    getEmojis()
      .then(({ data }) => {
        setEmojis((prev) => data)
      })
      .catch(() => {
        console.log("emojis load error")
      })
  }, [])

  const [messageValue, setMessageValue] = useState("")

  const handleMessage = () => {
    if (messageValue) {
      if (ws.current && ws.current.OPEN) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ws.current.send(messageValue)
        setMessages([
          ...messages,
          {
            message: messageValue,
            type: "user",
          },
        ])
        setMessageValue("")
        setIsEmoji(false)
      } else {
        setMessages([
          ...messages,
          {
            message: "WS connection is not opened! Try to start any run!",
            type: "system",
          },
        ])
        setMessageValue("")
        setIsEmoji(false)
      }
    }
  }

  useEffect(() => {
    const enterDownEvent = (e: KeyboardEvent) => {
      if (e.key == "Enter") {
        e.preventDefault()
        handleMessage()
      }
    }

    document.addEventListener("keydown", enterDownEvent)

    return () => document.removeEventListener("keydown", enterDownEvent)
  }, [messageValue, messages, setMessages])

  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatWindowRef.current?.scrollBy({
      top: 999999,
      behavior: "smooth",
    })
  }, [messages.length])

  const messagesT = useTransition(messages, {
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0 },
    config: {
      duration: 100,
    },
  })

  const emoji_transition = useTransition(isEmoji, {
    from: { opacity: 0, transform: "scale(0.5)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.5)" },
    config: {
      duration: 0,
    },
  })

  useEffect(() => {
    if (runStatus === "alive" && run) {
      const socket = new WebSocket(`ws://localhost:8000/bot/run/connect?pid=${run.id}`)
      socket.onopen = (e) => {
        console.log(e)
        toast.success("Chat was successfully connected!")
      }
      socket.onmessage = (event: MessageEvent) => {
        console.log(event)
        if (event.data) {
          // console.log(event.data)
          const data = event.data.split(":")[2].split("attachments")[0].slice(0, -2)
          console.log(data)
          setTimeout(() => {
            setMessages((prev) => [...prev, { message: data, type: "bot" }])
          }, 500);
        }
        socket.onclose = (event) => {
          socket.close()
          console.log("websocket closed", event)
        }
      }
      ws.current = socket
    }
    return () => {
      ws.current?.close()
    }
  }, [run, runStatus])

  return (
    <div
      className='pt-14 absolute top-0 right-0 transition-transform duration-300 w-[320px] h-full bg-background border-l border-border'
      style={{
        transform: chat ? "translateX(0%)" : "translateX(100%)",
      }}>
      <div>
        <div className='flex items-center justify-between pl-3 pr-1.5 py-1.5 border-b border-border'>
          <div className='flex items-center gap-1'>
            <ChatIcon />
            Chat
          </div>
          <div className='flex items-center gap-1'>
            <Button
              size='sm'
              onClick={() => {
                setSearchParams({
                  ...parseSearchParams(searchParams),
                  logs_page: !logsPage ? "opened" : "closed",
                })
                setLogsPage(!logsPage)
              }}>
              <MonitorIcon />
              Logs
            </Button>
            <Button
              onClick={() => {
                setSearchParams({
                  ...parseSearchParams(searchParams),
                  chat: "closed",
                })
                setChat(false)
              }}
              size='sm'
              variant='light'
              isIconOnly>
              <X strokeWidth={1.5} />
            </Button>
          </div>
        </div>
        <div
          ref={chatWindowRef}
          className='h-[60vh] bg-chat border-b border-border px-2 py-2 overflow-y-scroll scrollbar-hide flex flex-col gap-2'>
          {messagesT((style, m) => (
            <a.div
              style={style}
              key={m.message + m.type + Math.random()}
              className={`flex items-center ${
                m.type === "user" ? "justify-end" : "justify-start"
              } `}>
              <div
                className={`p-2 bg-background shadow-md ${m.type === "system" && "bg-warning"}`}
                style={{
                  borderRadius:
                    m.type !== "user" ? "0 0.5rem 0.5rem 0.5rem" : "0.5rem 0 0.5rem 0.5rem",
                }}>
                {m.message}
              </div>
            </a.div>
          ))}
        </div>
        <div className='flex items-center justify-between p-1 border-b border-border'>
          <Button
            variant='light'
            isIconOnly>
            <Paperclip />
          </Button>
          <div className='flex items-center gap-0.5'>
            <div className='relative flex items-center justify-center'>
              <Button
                isIconOnly
                variant='light'
                onClick={() => setIsEmoji(!isEmoji)}>
                <Smile
                  className={` h-max w-max rounded-lg p-1.5 transition hover:bg-accent ${
                    isEmoji ? "bg-accent" : "bg-transparent"
                  }`}
                />
              </Button>
              <div className='absolute bottom-12 right-0 z-10 origin-top-right'>
                {emoji_transition((style, flag) => (
                  <>
                    {chat && flag && (
                      <a.div
                        style={style}
                        className={`origin-bottom-right`}>
                        <EmojiPicker
                          data={emojis}
                          onEmojiClick={(emoji, e) => {
                            setMessageValue((prev) => prev + emoji)
                          }}
                          lazy
                          theme='auto'
                        />
                      </a.div>
                    )}
                  </>
                ))}
              </div>
            </div>
            <Button
              onClick={handleMessage}
              variant='light'
              isIconOnly>
              <Send />
            </Button>
          </div>
        </div>
        <Textarea
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          classNames={{
            input: "h-32",
          }}
          minRows={7}
          radius='none'
          variant='flat'
          placeholder='Type a message...'
          size='lg'
        />
      </div>
    </div>
  )
}

export default Chat
