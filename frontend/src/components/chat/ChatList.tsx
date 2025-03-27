import { chatContext } from '@/contexts/chatContext'
import { runContext } from '@/contexts/runContext'
import { formatRelativeTime } from '@/utils'
import { Divider } from '@nextui-org/react'
import cn from 'classnames'
import { Archive } from 'lucide-react'
import { useContext, useLayoutEffect } from 'react'

const ChatList = () => {
  const { runs } = useContext(runContext)
  const { chatId, setChatId } = useContext(chatContext)
  const { chatHistory } = useContext(chatContext)
  const aliveRuns = runs.filter(
    (run) => run.status === 'alive' && run.messenger === 'web',
  )
  const runsWithDialogs = runs.filter(
    (run) => chatHistory[run.id] && run.status !== 'alive',
  )

  const chats = [...runsWithDialogs, ...aliveRuns].reverse()

  useLayoutEffect(() => {
    if (chats.length !== 0) {
      setChatId(chatId >= 0 ? chatId : chats[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats])

  return (
    <div className='relative flex h-full flex-col p-3'>
      <div className='h-0 flex-grow overflow-y-scroll scrollbar-hide'>
        {!chats.length && (
          <span>No chats available. Try to start any run.</span>
        )}
        {chats.map((run) => {
          const relativeTime = formatRelativeTime(run.timestamp, 'short')

          return (
            <button
              key={run.id}
              onClick={() => setChatId(run.id)}
              className={cn(
                'flex h-9 w-full items-center justify-between gap-1 overflow-hidden rounded-lg p-2',
                run.id === chatId && 'bg-btn-accent',
              )}
            >
              {run.status !== 'alive' && (
                <Archive
                  size={20}
                  strokeWidth={2}
                  className='fill-fg-secondary stroke-background'
                />
              )}
              <span className='flex-grow truncate text-left text-sm sm:basis-4/6 2xl:basis-auto'>
                {`${run.preset.build_name} / ${run.preset.name}`}
              </span>
              <span className='shrink-0 truncate text-input-border sm:text-xs md:text-sm'>
                {relativeTime}
              </span>
            </button>
          )
        })}
      </div>
      <Divider
        orientation='vertical'
        className='absolute right-0 top-0 z-0 h-full'
      />
    </div>
  )
}

export default ChatList
