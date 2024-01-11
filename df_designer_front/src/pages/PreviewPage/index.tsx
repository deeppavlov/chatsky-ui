import { ActivityLogIcon, Cross1Icon } from '@radix-ui/react-icons'
import { ArrowLeft, Cross, MessageCircle, Paperclip, RotateCcw } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NewChatComponent from '../../components/newChatComponent'

const PreviewPage = () => {


  const navigate = useNavigate()

  const [mockLogs, setMockLogs] = useState([
    'Current runner version: "2.311.0"',
    'Secret source: Dependabot',
    'Prepare workflow directory',
    'Prepare all required actions',
    'Getting action download info',
    'Download action repository "actions/checkout@v4" (SHA:b4ffde65f46336ab88eb53be808477a3936bae11)',
    'Download action repository "actions/setup-python@v4" (SHA:65d7f2d534ac1bc67fcd62888c5f4f3d2cb2b236)',
    'Complete job name: lint',
    'Bot successfully started at localhost:5000'
  ])

  const [logs, setLogs] = useState(['init'])

  useEffect(() => {

    mockLogs.forEach((log, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log])
      }, (idx+1)*150);
    })

  }, [])



  return (
    <div className=' w-full h-full flex flex-row items-start justify-start'>
      <div className='w-3/4 h-full pt-12 pb-8 pl-10 pr-6 flex flex-col gap-4 items-start justify-start'>
        <div className=' flex flex-row items-center justify-center gap-4 '>
          <button onClick={() => navigate(-1)} className=' w-12 h-12 flex items-center justify-center bg-accent rounded-full '> <ArrowLeft /> </button>
          <h4 className='text-3xl'>Logs</h4>
        </div>
        <div>
          {logs.map((log, idx) => (
            <div className='flex flex-row items-center justify-start gap-2'>
              <span className='border-r border-border w-6 text-ring'> {idx+1} </span>
              <p> {log} </p>
            </div>
          ))}
        </div>
      </div>
      <NewChatComponent />
    </div>
  )
}

export default PreviewPage