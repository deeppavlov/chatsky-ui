import { chatContext } from "@/contexts/chatContext"
import { runContext } from "@/contexts/runContext"
import { Divider } from "@nextui-org/react"
import { useContext, useLayoutEffect } from "react"
import cn from "classnames"
import { Archive } from "lucide-react"
import { formatRelativeTime } from "@/utils"

const ChatList = () => {
  const { runs } = useContext(runContext)
  const { chatId, setChatId } = useContext(chatContext)
  const { chatHistory } = useContext(chatContext)
  const aliveRuns = runs.filter((run) => run.status === "alive" && run.messenger === "web")
  const runsWithDialogs = runs.filter((run) => chatHistory[run.id] && run.status !== "alive")

  const chats = [...runsWithDialogs, ...aliveRuns].reverse()

  useLayoutEffect(() => {
    if (chats.length !== 0) {
      setChatId(chatId >= 0 ? chatId : chats[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats])

  return (
    <div className='flex flex-col p-3 relative h-full'>
      <div className=' h-0 flex-grow overflow-y-scroll scrollbar-hide'>
        {!chats.length && <span>No chats available. Try to start any run.</span>}
        {chats.map((run) => {
          const relativeTime = formatRelativeTime(run.timestamp, "short")

          return (
            <button
              key={run.id}
              onClick={() => setChatId(run.id)}
              className={cn(
                "w-full h-9 p-2 rounded-lg flex justify-between items-center gap-1 overflow-hidden",
                run.id === chatId && "bg-btn-accent"
              )}
            >
              {run.status !== "alive" && (
                <Archive
                  size={20}
                  strokeWidth={2}
                  className='fill-fg-secondary stroke-background'
                />
              )}
              <span className='text-sm flex-grow truncate sm:basis-4/6 2xl:basis-auto text-left'>
                {`${run.preset.build_name} / ${run.preset.name}`}
              </span>
              <span className='text-input-border md:text-sm sm:text-xs truncate shrink-0'>
                {relativeTime}
              </span>
            </button>
          )
        })}
      </div>
      <Divider orientation='vertical' className='h-full absolute right-0 top-0 z-0' />
    </div>
  )
}

export default ChatList
