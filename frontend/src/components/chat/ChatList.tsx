import { getChatIds, localRunType } from '@/api/bot'
import { chatContext } from '@/contexts/chatContext'
import { runContext } from '@/contexts/runContext'
import { formatRelativeTime } from '@/utils'
import cn from 'classnames'
import { Archive } from 'lucide-react'
import { useContext, useEffect, useLayoutEffect, useState } from 'react'

const ChatList = ({ isOpen = true }: { isOpen: boolean }) => {
  const { runs } = useContext(runContext)
  const { chatId, setChatId } = useContext(chatContext)
  const [chats, setChats] = useState<localRunType[]>([])

  useEffect(() => {
    const getChats = async () => {
      const chatIds = (await getChatIds()).map(([runId]) => runId)
      const chats = runs
        .filter(
          (run) =>
            (run.status === 'alive' && run.messenger === 'web') ||
            chatIds.includes(run.id.toString()),
        )
        .sort((a, b) => b.id - a.id)
      setChats(chats)
    }
    getChats()
  }, [runs])

  useLayoutEffect(() => {
    if (chats.length !== 0) {
      setChatId(chatId >= 0 ? chatId : chats[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats])

  return (
    <aside
      className={cn(
        'h-full transition-all duration-300',
        isOpen ? 'w-[240px]' : 'w-0',
      )}
    >
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
                    data-testid='archive-icon'
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
      </div>
    </aside>
  )
}

export default ChatList
