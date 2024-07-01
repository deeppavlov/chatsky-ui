import { Button, Textarea, Tooltip } from "@nextui-org/react"
import { a, useTransition } from "@react-spring/web"
import axios from "axios"
import { Paperclip, RefreshCcw, Send, Smile, X } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { useSearchParams } from "react-router-dom"
import { buildContext } from "../../contexts/buildContext"
import { chatContext } from "../../contexts/chatContext"
import { runContext } from "../../contexts/runContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import { DEV } from "../../env.consts"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import { parseSearchParams } from "../../utils"
import EmojiPicker, { EmojiType } from "./EmojiPicker"

const Chat = () => {
  const { logsPage, setLogsPage } = useContext(buildContext)
  const { chat, setChat, messages, setMessages } = useContext(chatContext)
  const { run, runStatus } = useContext(runContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const ws = useRef<WebSocket | null>(null)
  const { setMouseOnPane } = useContext(workspaceContext)

  const [isEmoji, setIsEmoji] = useState(false)

  const [emojis, setEmojis] = useState<EmojiType[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [emojisPending, setEmojisPending] = useState(false)
  useEffect(() => {
    const getEmojis = async () => {
      setEmojisPending(() => true)
      const emojis_data = await axios
        .get("https://emoji-api.com/emojis?access_key=4dd2f9e45b38e17c21b432caf8ac12206775bfef")
        .finally(() => setEmojisPending(() => false))
      return emojis_data
    }

    getEmojis()
      .then(({ data }) => {
        setEmojis(() => data)
      })
      .catch(() => {
        console.log("emojis load error")
      })
  }, [])

  const [messageValue, setMessageValue] = useState("")

  const handleMessage = () => {
    if (messageValue) {
      if (ws.current && ws.current.readyState === 1) {
        console.log(ws.current)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  console.log(window.location)

  useEffect(() => {
    if (runStatus === "alive" && run) {
      const socket = new WebSocket(
        `ws://${DEV ? "localhost:8000" : window.location.host}/api/v1/bot/run/connect?run_id=${run.id}`
      )
      socket.onopen = (e) => {
        console.log(e)
        toast.success("Chat was successfully connected!")
      }
      socket.onmessage = (event: MessageEvent) => {
        console.log(event)
        if (event.data) {
          // console.log(event.data)
          const data = event.data.split(":")[2].split("attachments")[0].slice(0, -2)
          // console.log(data)
          setTimeout(() => {
            setMessages((prev) => [...prev, { message: data, type: "bot" }])
          }, 500)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, runStatus])

  return (
    <div
      className='pt-14 absolute top-0 right-0 transition-transform duration-300 w-[320px] h-full max-h-screen bg-background border-l border-border overflow-hidden'
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
            <Tooltip placement="bottom" radius="sm" content='Reset chat'>
              <Button
                isIconOnly
                variant='light'
                size='sm'
                onClick={() => {
                  setMessages([])
                }}>
                <RefreshCcw strokeWidth={1.2} />
              </Button>
            </Tooltip>
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
              data-testid={`${m.type}-message`}
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
                          onEmojiClick={(emoji) => {
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
              data-testid='chat-send'
              onClick={handleMessage}
              variant='light'
              isIconOnly>
              <Send />
            </Button>
          </div>
        </div>
        <Textarea
          onFocusChange={(focus: boolean) => setMouseOnPane(!focus)}
          data-testid='chat-input'
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
