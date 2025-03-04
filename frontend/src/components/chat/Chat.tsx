import { Button, Textarea, Tooltip } from "@nextui-org/react"
import { a, useTransition } from "@react-spring/web"
import axios from "axios"
import { ArrowUp, ChevronsLeft, ChevronsRight, Paperclip, RefreshCcw, Smile } from "lucide-react"
import { memo, useContext, useEffect, useRef, useState } from "react"
import { chatContext } from "../../contexts/chatContext"
import { runContext } from "../../contexts/runContext"
import { workspaceContext } from "../../contexts/workspaceContext"
import ChatIcon from "../../icons/buildmenu/ChatIcon"
import EmojiPicker, { EmojiType } from "./EmojiPicker"
import { send_message } from "@/api/bot"
import { DotsVerticalIcon } from "@radix-ui/react-icons"
import cn from "classnames"
import ChatList from "./ChatList"

const Chat = memo(() => {
  const { runs } = useContext(runContext)
  const { chatId, chatHistory, setChatHistory, setMessages } = useContext(chatContext)
  const { setMouseOnPane } = useContext(workspaceContext)

  const [isEmoji, setIsEmoji] = useState(false)
  const [listIsOpen, setListIsOpen] = useState(false)
  const [emojis, setEmojis] = useState<EmojiType[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [emojisPending, setEmojisPending] = useState(false)
  const [messageValue, setMessageValue] = useState("")

  const chatWindowRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = chatHistory[chatId] || []
  const selectedRun = runs.find((run) => run.id === chatId)

  const handleMessage = async () => {
    if (!messageValue || !selectedRun) return

    setMessageValue("")
    setIsEmoji(false)

    setMessages([
      ...messages,
      {
        message: messageValue,
        type: "user",
      },
    ])

    const { response } = await send_message(chatId, messageValue) // user_id is not passed; it will need to be fixed later
    setTimeout(() => {
      setChatHistory((history) => ({
        ...history,
        [chatId]: [...history[chatId], { message: response.text, type: "bot" }],
      }))
    }, 500)
  }

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
  }, [messageValue, messages])

  useEffect(() => {
    setMessageValue("")
    setIsEmoji(false)

    inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId])

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

  return (
    <div className='h-full bg-background border-l border-border flex flex-col shrink-0'>
      <div className='flex items-center justify-between pl-3 pr-1.5 py-1.5 border-b border-border'>
        <div className='flex items-center gap-1 flex-grow'>
          <button
            className='w-6 h-6 mr-2  active:scale-95 hover:scale-105'
            onClick={() => setListIsOpen((isOpen) => !isOpen)}
          >
            {listIsOpen ? (
              <ChevronsRight size={16} className='stroke-input-border' />
            ) : (
              <ChevronsLeft size={16} className='stroke-input-border' />
            )}
          </button>
          <ChatIcon className='shrink-0' />
          <div className='flex flex-grow'>
            <span className='font-semibold'>Chat</span>&nbsp;
            {selectedRun && (
              <span className='truncate w-0 flex-grow'>
                {`– ${selectedRun?.preset.build_name} / ${selectedRun?.preset.name}`}
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => {}} size='sm' variant='light' isIconOnly>
          <DotsVerticalIcon strokeWidth={1.5} />
        </Button>
      </div>

      <div className='flex h-full w-full'>
        <div
          className={cn(
            "h-full transition-all duration-300 overflow-hidden",
            listIsOpen ? "w-[240px]" : "w-0"
          )}
        >
          <ChatList />
        </div>

        <div className='flex flex-col min-w-[360px]'>
          <div
            ref={chatWindowRef}
            className='flex-grow h-0 bg-chat border-b border-border px-2 py-2 overflow-y-scroll scrollbar-hide flex flex-col gap-2'
          >
            {messagesT((style, m) => (
              <a.div
                data-testid={`${m.type}-message`}
                style={style}
                key={m.message + m.type + Math.random()}
                className={`flex items-center ${
                  m.type === "user" ? "justify-end" : "justify-start"
                } `}
              >
                <div
                  className={`p-2 bg-background shadow-md break-all ${
                    m.type === "system" && "bg-warning"
                  }`}
                  style={{
                    borderRadius:
                      m.type !== "user" ? "0 0.5rem 0.5rem 0.5rem" : "0.5rem 0 0.5rem 0.5rem",
                  }}
                >
                  {m.message}
                </div>
              </a.div>
            ))}
          </div>
          <div className='flex items-center justify-between p-1 border-b border-border'>
            <Button isDisabled variant='light' isIconOnly>
              <Paperclip />
            </Button>
            <div className='flex items-center gap-0.5'>
              <div className='relative flex items-center justify-center'>
                <Button
                  isDisabled={selectedRun?.status !== "alive"}
                  isIconOnly
                  variant='light'
                  onClick={() => setIsEmoji(!isEmoji)}
                >
                  <Smile
                    className={` h-max w-max rounded-lg p-1.5 transition hover:bg-accent ${
                      isEmoji ? "bg-accent" : "bg-transparent"
                    }`}
                  />
                </Button>
                <div className='absolute bottom-12 right-0 z-10 origin-top-right'>
                  {emoji_transition((style, flag) => (
                    <>
                      {chatId && flag && (
                        <a.div style={style} className={`origin-bottom-right`}>
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
                isDisabled={selectedRun?.status !== "alive"}
                data-testid='chat-send'
                onClick={handleMessage}
                variant='light'
                isIconOnly
              >
                <ArrowUp size={28} strokeWidth={1.2} />
              </Button>
            </div>
          </div>
          <Textarea
            ref={inputRef}
            isDisabled={selectedRun?.status !== "alive"}
            onFocusChange={(focus: boolean) => setMouseOnPane(!focus)}
            data-testid='chat-input'
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            classNames={{
              input: "bg-background",
              inputWrapper:
                "bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent shadow-none",
            }}
            minRows={4}
            radius='none'
            variant='flat'
            placeholder='Type a message...'
            size='lg'
          />
          <div className='p-3 pt-0 w-full flex justify-end'>
            <Tooltip placement='bottom' radius='sm' content='Reset chat'>
              <Button
                isDisabled={selectedRun?.status !== "alive"}
                isIconOnly
                variant='flat'
                size='md'
                onClick={() => {
                  setMessages([])
                }}
              >
                <RefreshCcw strokeWidth={1.2} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Chat
