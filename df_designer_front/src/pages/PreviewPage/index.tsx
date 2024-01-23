import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { ArrowLeft, Cross, MessageCircle, Paperclip, RotateCcw } from 'lucide-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewChatComponent from '../../components/newChatComponent'
import { buildContext } from '../../contexts/buildContext'
import { alertContext } from '../../contexts/alertContext'
import { classNames } from '../../utils'

const PreviewPage = ({className}: {className?: string}) => {


  const wrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const logsRef = useRef<HTMLDivElement>(null)

  // const [mockLogs, setMockLogs] = useState([
  //   'Current runner version: "2.311.0"',
  //   'Secret source: Dependabot',
  //   'Prepare workflow directory',
  //   'Prepare all required actions',
  //   'Getting action download info',
  //   'Download action repository "actions/checkout@v4" (SHA:b4ffde65f46336ab88eb53be808477a3936bae11)',
  //   'Download action repository "actions/setup-python@v4" (SHA:65d7f2d534ac1bc67fcd62888c5f4f3d2cb2b236)',
  //   'Complete job name: lint',
  //   'Bot successfully started at localhost:5000'
  // ])

  // const { builded } = useContext(buildContext)
  const { logs, setLogs, connectionStatus, setConnectionStatus, setLogsPage } = useContext(buildContext)
  // const [isClosed, setIsClosed] = useState(false)
  // const statusSocket = useRef<WebSocket>(null)
  // const { setNoticeData, setSuccessData, setErrorData } = useContext(alertContext)


  // useEffect(() => {
    
  //   if (builded && !isClosed) {
  //     statusSocket.current = new WebSocket('ws://127.0.0.1:8000/socket')
      
  //     statusSocket.current.onopen = (e) => {
  //       console.log(e)
  //       setConnectionStatus('alive')
  //       setSuccessData({title: 'Connection was successfully opened!'})
  //     }


  //     statusSocket.current.onmessage = (e) => {
  //       setLogs((prev: string[]) => [...prev, e.data])
  //     }

  //     statusSocket.current.onclose = (e) => {
  //       console.log(e)
  //       setConnectionStatus('closed')
  //       setNoticeData({title: 'Connection was closed!'})
  //     }

  //     statusSocket.current.onerror = (e) => {
  //       console.log(e)
  //       setConnectionStatus('broken')
  //       setErrorData({title: 'Connection broken!'})
  //     }
  //   }

  //   if (statusSocket.current) {
  //     return () => statusSocket.current.close()
  //   }

  // }, [builded, isClosed])

  // useEffect(() => {

  //   mockLogs.forEach((log, idx) => {
  //     setTimeout(() => {
  //       setLogs(prev => [...prev, log])
  //     }, (idx+1)*150);
  //   })

  // }, [])

  useEffect(() => {
    logsRef.current?.scrollTo({behavior: 'smooth', top: logsRef.current?.scrollHeight})
  }, [logs])

  return (
    <div className={classNames(' preview-wrapper w-full h-full flex flex-row items-start justify-start', className)}>
      <div ref={wrapperRef} className='w-3/4 h-full pt-12 pb-8 pl-10 pr-6 flex flex-col gap-4 items-start justify-start'>
        <div ref={titleRef} className=' flex flex-row items-center justify-center gap-4 '>
          <button onClick={() => {
            setLogsPage(false)
          }} className=' w-12 h-12 flex items-center justify-center bg-accent rounded-full '> <ArrowLeft /> </button>
          <h4 className='text-3xl'>Logs</h4>
        </div>
        <div className=' flex flex-row items-center justify-start gap-8'>
          <div style={{
            maxHeight: wrapperRef.current?.offsetHeight - titleRef.current?.offsetHeight - 80
          }} ref={logsRef} className='overflow-y-scroll scrollbar-hide'>
            {logs?.map((log, idx) => (
              <div className='flex flex-row items-center justify-start gap-2'>
                <span className='border-r border-border w-8 text-end pr-1 text-ring'> {idx + 1} </span>
                <p> {log} </p>
              </div>
            )) ?? <>No logs</>}
          </div>
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