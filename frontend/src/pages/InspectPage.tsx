import Chat from '@/components/chat/Chat'
import Logs from '@/components/inspect/Logs'
import BackIcon from '@/icons/BackIcon'
import CheckIcon from '@/icons/CheckIcon'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { Divider, Spinner } from '@nextui-org/react'
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import { ChevronRightIcon, X } from 'lucide-react'
import {
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { localBuildType, localRunType } from '../api/bot'
import { buildContext } from '../contexts/buildContext'
import { runContext } from '../contexts/runContext'
import { formatRelativeTime } from '../utils'

const Inspect = memo(() => {
  const { builds } = useContext(buildContext)
  const { runs } = useContext(runContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentItem, setCurrentItem] = useState<
    localBuildType | localRunType | null
  >(null)

  const currItemRef = useRef<HTMLButtonElement>(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('type') === 'run') {
      setCurrentItem(
        runs.find((run) => run.id === Number(searchParams.get('run_id'))) ??
          null,
      )
    } else if (searchParams.get('type') === 'build') {
      setCurrentItem(
        builds.find(
          (build) => build.id === Number(searchParams.get('build_id')),
        ) ?? null,
      )
    } else {
      setCurrentItem(builds.at(0) ?? null)
    }
  }, [builds, runs, searchParams])

  useLayoutEffect(() => {
    currItemRef.current &&
      currItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
  }, [currentItem])

  return (
    <div className='absolute grid h-screen w-screen grid-cols-6 gap-6 bg-background pb-12 pl-8 pr-0 pt-14 transition-transform duration-300'>
      <div className='flex flex-col gap-4 pt-12'>
        <div
          onClick={() => navigate(-1)}
          className='flex items-center gap-[24px]'
        >
          <BackIcon
            className='cursor-pointer rounded-lg border-border bg-bg-secondary bg-foreground'
            stroke='var(--background)'
          />
          <h1 className='text-[24px] font-semibold leading-9'>Logs</h1>
        </div>

        <ScrolledContainer className='h-0 flex-grow'>
          <Accordion.Root
            value={
              currentItem?.type === 'run'
                ? String(currentItem.build_id)
                : String(currentItem?.id)
            }
            type='single'
            className='flex w-full flex-col gap-1'
          >
            {builds.map((b) => {
              const relativeBuildTime = formatRelativeTime(b.timestamp)
              return (
                <Accordion.Item key={b.id} value={String(b.id)}>
                  <Accordion.Header asChild>
                    <Accordion.Trigger
                      ref={
                        currentItem?.type === 'build' && currentItem.id === b.id
                          ? currItemRef
                          : null
                      }
                      onClick={() => {
                        // setCurrentItem(b)
                        setSearchParams({
                          page: 'inspect',
                          build_id: b.id.toString(),
                          type: 'build',
                        })
                      }}
                      className={cn(
                        'group relative flex h-10 w-full cursor-pointer items-center gap-1 overflow-hidden rounded-lg p-2 data-[state=open]:bg-btn-accent',
                      )}
                    >
                      <ChevronRightIcon
                        className={cn(
                          'size-4 shrink-0 stroke-input-border transition-all duration-300 group-data-[state=open]:rotate-90',
                        )}
                      />
                      <span className='flex-grow truncate text-start text-sm font-semibold sm:basis-4/6 2xl:basis-auto'>
                        {b.preset.name}
                      </span>
                      <div className='flex items-center gap-1 overflow-hidden'>
                        <span className='truncate text-input-border sm:text-xs md:text-sm'>
                          {relativeBuildTime}
                        </span>
                        {b.status === 'failed' && (
                          <X
                            strokeWidth={3.5}
                            className='size-3.5 flex-shrink-0 stroke-input-border'
                          />
                        )}

                        {b.status === 'completed' && (
                          <CheckIcon className='flex-shrink-0 fill-input-border group-data-[state=open]:fill-success' />
                        )}
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content className='flex flex-col gap-1 data-[state=open]:my-1'>
                    {b.runs.map((r) => {
                      const relativeRunTime = formatRelativeTime(r.timestamp)
                      return (
                        <button
                          key={r.id}
                          ref={
                            currentItem?.type === 'run' &&
                            currentItem.id === r.id
                              ? currItemRef
                              : null
                          }
                          className={cn(
                            'flex h-8 w-full items-center justify-start rounded-lg pe-2 ps-9',
                            currentItem?.type === 'run' &&
                              currentItem.id === r.id &&
                              'bg-red-200', // спросить у Миши, как выделять выбранный ран
                          )}
                          onClick={() => {
                            // setCurrentItem({
                            //   ...r,
                            //   build_id: b.id,
                            //   type: 'run',
                            // })

                            setSearchParams({
                              page: 'inspect',
                              run_id: String(r.id),
                              build_id: String(b.id),
                              type: 'run',
                            })
                          }}
                        >
                          <span className='flex-grow truncate text-start text-sm font-semibold sm:basis-4/6 2xl:basis-auto'>
                            {r.preset.name}
                          </span>
                          <div className='flex items-center gap-1 overflow-hidden'>
                            <span className='truncate text-input-border sm:text-xs md:text-sm'>
                              {relativeRunTime}
                            </span>
                            {r.status === 'failed' && (
                              <X
                                strokeWidth={3.5}
                                className='size-3.5 flex-shrink-0 stroke-input-border'
                              />
                            )}

                            {r.status === 'alive' && (
                              <CheckIcon className='flex-shrink-0 fill-input-border' />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </Accordion.Content>
                </Accordion.Item>
              )
            })}
          </Accordion.Root>
        </ScrolledContainer>
      </div>
      <div className='col-span-5 flex items-start justify-between'>
        <div className='flex h-full flex-grow pt-[100px]'>
          <Divider orientation='vertical' className='pt-20' />
          {currentItem ? (
            <Logs item={currentItem} />
          ) : (
            <Spinner className='mx-auto mt-10 self-start' />
          )}
        </div>
        <Chat />
      </div>
    </div>
  )
})

export default Inspect
