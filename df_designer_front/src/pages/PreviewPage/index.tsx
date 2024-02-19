import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { ArrowLeft, Check, ChevronDown, Cross, MessageCircle, Paperclip, Plus, Radio, RotateCcw } from 'lucide-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewChatComponent from '../../components/newChatComponent'
import { buildApiType, buildContext, runApiType } from '../../contexts/buildContext'
import { alertContext } from '../../contexts/alertContext'
import { classNames } from '../../utils'
import { savedBuildType, savedRunType } from '../../types/entities'
import BuildLogItem from '../../components/BuildLogItemComponent/BuildLogItem'

const PreviewPage = ({ className }: { className?: string }) => {


  const wrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)
  
  const { logs, runs, setLogsPage, run, builds } = useContext(buildContext)
  const { setSuccessData } = useContext(alertContext)

  // const [builds, setBuilds] = useState<savedBuildType[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(run)
  const [localBuilds, setLocalBuilds] = useState<buildApiType[]>([])


  useEffect(() => {
    const builds_with_ago_timestamp = builds?.map((build, idx) => {
      console.log(build.timestamp, Date.now())
      const agoTimestamp = Math.round((Date.now() - (build.timestamp * 1000)) / 60000)
      const ago = agoTimestamp < 60 ? (agoTimestamp > 1 ? `${agoTimestamp} minutes` : (agoTimestamp < 0.5 ? `now` : `1 minute`)) : (agoTimestamp > 120 ? `${Math.floor(agoTimestamp / 60)} hours` : `1 hour`)
      return {
        ...build,
        ago: ago,
        title: `Build ${build.id}`,
        runs: build.runs?.map((run: runApiType, idx) => {
          const agoTimestamp = Math.round((Date.now() - (run.timestamp * 1000 ?? Date.now())) / 60000)
          const ago = agoTimestamp < 60 ? (agoTimestamp > 1 ? `${agoTimestamp} minutes` : (agoTimestamp < 0.5 ? `now` : `1 minute`)) : (agoTimestamp > 120 ? `${Math.floor(agoTimestamp / 60)} hours` : `1 hour`)
          return {
            ...run,
            ago: ago,
            title: `Run ${run.id}`
          }
        }) ?? []
      }
    }) ?? []
    setLocalBuilds(prev => builds_with_ago_timestamp.reverse())
  }, [builds, runs, run])
  

  useEffect(() => {
    logsRef.current?.scrollTo({ behavior: 'smooth', top: logsRef.current?.scrollHeight })
  }, [logs])

  const [currentItem, setCurrentItem] = useState<runApiType | buildApiType>()
  

  useEffect(() => {
    const lastRun = builds[builds.length - 1].runs[builds[builds.length - 1].runs.length - 1]
    if (lastRun) {
      setCurrentItem(lastRun)
    }
    if (run) {
      setIsOpen(run)
    }
  }, [run])

  const [pageLogs, setPageLogs] = useState<string[]>([])

  useEffect(() => {
    if (builds) {
      const lastBuild: buildApiType = builds[builds.length - 1]
      const lastRun: runApiType = lastBuild.runs[lastBuild.runs?.length - 1]
      if (lastRun && currentItem) {
        if (currentItem?.['build_id'] && currentItem?.timestamp === lastRun.timestamp) {
          if (run) {
            setPageLogs(prev => logs)
          } else {
            setPageLogs(prev => currentItem.logs)
          }
        } else {
          if (currentItem) {
            setPageLogs(prev => currentItem.logs)
          } else {
            setPageLogs(prev => [])
          }
        }
      }
      if (lastBuild && currentItem && !currentItem?.['build_id']) {
        setPageLogs(prev => currentItem.logs ?? [])
      }
    }
  }, [run, logs, currentItem])

  const copyHandler = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccessData({ title: "Log was successfully copied!" })
  }

  return (
    <div className={classNames(' preview-wrapper w-screen h-full flex flex-row items-start justify-start', className)}>
      <div ref={wrapperRef} className='w-3/4 h-full pt-12 pb-8 pl-10 pr-6 flex flex-col gap-4 items-start justify-start'>
        <div ref={titleRef} className=' flex flex-row items-center justify-center gap-4 '>
          <button onClick={() => {
            setLogsPage(false)
          }} className=' w-12 h-12 flex items-center justify-center bg-accent rounded-full '> <ArrowLeft /> </button>
          <h4 className='text-3xl'>Logs</h4>
        </div>
        <div className='w-full flex flex-row items-start justify-start gap-8'>
          <div style={{
            minHeight: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80,
            maxHeight: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80
          }} className='flex flex-col items-start justify-start gap-y-0.5 min-w-[17rem] border-r border-border overflow-y-scroll '>
            {localBuilds.map((build) => (
              <BuildLogItem key={build.timestamp} build={build} setCurrentItem={setCurrentItem} currentItem={currentItem} />
            ))}
          </div>
          {currentItem && currentItem?.['build_id'] && (
            <div>
              <div className='font-semibold'>
                <h6 className='text-xl font-bold flex flex-row items-center justify-start gap-2 mb-2'>
                  {currentItem?.status === 'completed' && <span className='flex items-center justify-center bg-green-400 rounded-full p-0.5 w-max'> <Check className='w-4 h-4' /> </span>}
                  {currentItem?.status === 'failed' && <span className='flex items-center justify-center bg-red-500 rounded-full p-0.5 w-max'> <Plus className='rotate-45 w-4 h-4' /> </span>}
                  {currentItem?.status === 'running' && <span className='text-red-600 flex flex-row gap-1 items-center justify-center'>Live <Radio className='h-5' /> </span>}
                  Run {currentItem?.id}
                </h6>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Status:</span>
                  {currentItem?.status === 'completed' && <span className='text-green-500'> Success</span>}
                  {currentItem?.status === 'failed' && <span className='text-red-500'> Error</span>}
                  {currentItem?.status === 'running' && <span className='text-red-500'> Live</span>}
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Start time:</span> {new Date(currentItem?.timestamp).toLocaleString()}
                </p>
                {/* <p className='mb-1'>
                  <span className=' text-neutral-400'>End time:</span> {currentItem.timestamp.end ? new Date(currentItem?.timestamp?.end).toLocaleString() : <span className='text-red-500'> Live</span>}
                </p> */}
                {/* <p className='mb-1'>
                  <span className=' text-neutral-400'>Duration:</span>
                  <span> {currentItem.status === 'running' ? (
                    <>{Math.round((Date.now() - currentItem?.timestamp?.start) / 1000)} seconds</>
                  ) : (
                    <>{Math.round((currentItem?.timestamp?.end - currentItem?.timestamp?.start) / 1000)} seconds</>
                  )} </span>
                </p> */}
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Preset:</span> <span className='text-yellow-400'>default</span>
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Logs path:</span> none
                </p>
              </div>
              <div>
                <h5 onClick={() => setIsOpen(!isOpen)} className='font-bold text-lg flex flex-row items-center gap-1 mb-1 cursor-pointer'>Logs <ChevronDown className={`w-4 h-4 transition ${!isOpen && 'rotate-90'} `} /> </h5>
                <div style={{
                  // maxHeight: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80,
                  // height: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80,
                  maxHeight: isOpen ? document.documentElement.clientHeight - logsRef.current.getBoundingClientRect().top - ((document.documentElement.clientHeight - logsRef.current.getBoundingClientRect().top) % 24) + 1 : 0,
                  // height: isOpen ? logsRef.current.scrollHeight : 0
                }} ref={logsRef} className='w-full overflow-y-scroll scrollbar-hide flex flex-col items-start justify-start font-mono transition-all duration-300'>
                  {pageLogs?.map((log, idx) => (
                    <div onClick={() => copyHandler(log)} className='flex flex-row items-center justify-start gap-2 hover:bg-accent transition w-full cursor-pointer'>
                      <span className=' border-border w-8 text-end pr-1 text-ring'> {idx + 1} </span>
                      <p> {log} </p>
                    </div>
                  )) ?? <>No logs</>}
                </div>
              </div>
            </div>
          )}
          {currentItem && !currentItem?.['build_id'] && (
            <div>
              <div className='font-semibold'>
                <h6 className='text-xl font-bold flex flex-row items-center justify-start gap-2 mb-2'>
                  {currentItem?.status === 'completed' && <span className='flex items-center justify-center bg-green-400 rounded-full p-0.5 w-max'> <Check className='w-4 h-4' /> </span>}
                  {currentItem?.status === 'failed' && <span className='flex items-center justify-center bg-red-500 rounded-full p-0.5 w-max'> <Plus className='rotate-45 w-4 h-4' /> </span>}
                  Build {currentItem?.id}
                </h6>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Status:</span>
                  {currentItem?.status === 'completed' && <span className='text-green-500'> Success</span>}
                  {currentItem?.status === 'failed' && <span className='text-red-500'> Error</span>}
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Compilation time:</span> {new Date(currentItem?.timestamp*1000).toLocaleString()}
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Duration:</span>
                  <span>
                    <> {3} seconds</>
                  </span>
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Preset:</span> <span className='text-yellow-400'>{ currentItem?.preset_name }</span>
                </p>
                <p className='mb-1'>
                  <span className=' text-neutral-400'>Logs path:</span> 
                </p>
              </div>
              <div>
                <h5 onClick={() => setIsOpen(!isOpen)} className='font-bold text-lg flex flex-row items-center gap-1 mb-1'>Logs <ChevronDown className={`w-4 h-4 transition ${!isOpen && 'rotate-90'} `} /> </h5>
                <div style={{
                  // maxHeight: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80,
                  // height: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80,
                  maxHeight: isOpen ? document.documentElement.clientHeight - logsRef.current.getBoundingClientRect().top - ((document.documentElement.clientHeight - logsRef.current.getBoundingClientRect().top) % 24) + 1 : 0,
                  // height: isOpen ? logsRef.current.scrollHeight : 0
                }} ref={logsRef} className='w-full overflow-y-scroll scrollbar-hide flex flex-col items-start justify-start font-mono transition-all duration-300'>
                  {pageLogs?.map((log, idx) => (
                    <div onClick={() => copyHandler(log)} className='flex flex-row items-center justify-start gap-2 hover:bg-accent transition w-full cursor-pointer'>
                      <span className=' border-border w-8 text-end pr-1 text-ring'> {idx + 1} </span>
                      <p> {log} </p>
                    </div>
                  )) ?? <>No logs</>}
                </div>
              </div>
            </div>
          )}
          {/* <button 
          className=' bg-background px-2 py-1 text-foreground border border-transparent rounded transition hover:bg-accent hover:border-border '
          onClick={() => {
            setIsClosed(prev => true)
          }}
          >
            Close ws
          </button> */}
        </div>
      </div>
      {/* <NewChatComponent /> */}
    </div>
  )
}

export default PreviewPage