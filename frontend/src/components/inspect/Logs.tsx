import {
  getBuildLogs,
  getRunLogs,
  localBuildType,
  localRunType,
} from '@/api/bot'
import ScrolledContainer from '@/UI/ScrolledContainer/ScrolledContainer'
import { delay } from '@/utils'
import { Spinner } from '@nextui-org/react'
import { CheckCircle2, CircleSlash, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface IProps {
  item: localBuildType | localRunType
}

const getLogs = {
  run: getRunLogs,
  build: getBuildLogs,
}

const Logs = ({ item }: IProps) => {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const updateLogs = async () => {
      while (isMounted) {
        const log = await getLogs[item.type](item.id)
        isMounted && setLogs(log)
        await delay(1000)
      }
    }

    if (['running', 'alive'].includes(item.status)) {
      updateLogs()
    } else {
      getLogs[item.type](item.id)
        .then(setLogs)
        .catch((e) => console.log(e))
    }

    return () => {
      isMounted = false
    }
  }, [item])

  const containerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    containerRef.current?.scrollBy({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [logs])

  return (
    <div className='flex w-full flex-col pe-6 ps-9'>
      {item.type === 'build' ? (
        <div>
          <h4 className='my-4 flex items-center gap-1 text-xl font-semibold'>
            <span className='flex items-center'>
              {item.status === 'completed' && (
                <CheckCircle2 className='flex-shrink-0 fill-success' />
              )}
              {item.status === 'running' && (
                <Spinner size='sm' color='warning' />
              )}
              {item.status === 'failed' && (
                <X className='size-6 flex-shrink-0 stroke-red-500' />
              )}
            </span>
            Build {item.id}
          </h4>
          <div>
            <p>
              <span className='mr-1 font-medium text-neutral-500'>Status:</span>
              <span
                style={{
                  color:
                    item.status === 'completed'
                      ? 'var(--status-green)'
                      : 'var(--status-red)',
                }}
              >
                {item.status}
              </span>
            </p>
            <p>
              <span className='mr-1 font-medium text-neutral-500'>
                Timestamp:
              </span>
              {item.timestamp}
            </p>
            <p>
              <span className='mr-1 font-medium text-neutral-500'>
                Preset name:
              </span>
              {item.preset.end_status}
            </p>
            {/* <p>
              <span className='mr-1 font-medium text-neutral-500'>
                Logs file path:
              </span>
              <a
                download
                href={`../../../backend/${item.log_path}`}
                className='text-blue-500 underline'
              >
                {item.log_path}
              </a>
            </p> */}
          </div>
        </div>
      ) : (
        <div>
          <h4 className='my-4 flex items-center gap-1 text-xl font-semibold'>
            <span className='flex items-center'>
              {item.status === 'alive' && (
                <CheckCircle2 fill='var(--status-green)' stroke='white' />
              )}
              {item.status === 'running' && (
                <Spinner size='sm' color='danger' />
              )}
              {item.status === 'failed' && <X color='red' />}
              {item.status === 'stopped' && <CircleSlash />}
            </span>
            Run {item.id}
          </h4>
          <div>
            <p>
              <span className='mr-1 font-medium text-neutral-500'>Status:</span>
              <span
                style={{
                  color:
                    item.status === 'alive'
                      ? 'var(--status-green)'
                      : item.status === 'stopped'
                        ? 'var(--foreground)'
                        : 'var(--status-red)',
                }}
              >
                {item.status}
              </span>
            </p>
            <p>
              <span className='mr-1 font-medium text-neutral-500'>
                Timestamp:
              </span>
              {item.timestamp}
            </p>
            {/* <p>
              <span className='mr-1 font-medium text-neutral-500'>
                Logs file path:
              </span>
              <a
                download
                href={`../../../backend/${item.log_path}`}
                className='text-blue-500 underline'
              >
                {item.log_path}
              </a>
            </p> */}
          </div>
        </div>
      )}
      <ScrolledContainer ref={containerRef} className='h-0 flex-grow pt-2'>
        <div className='px-4'>
          {logs?.map((string, i) => (
            <p key={i} className='text-sm font-medium text-text-secondary'>
              {string}
            </p>
          ))}
        </div>
      </ScrolledContainer>
    </div>
  )
}

export default Logs
