import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { chatMessageType } from '../components/newChatComponent'
import { savedBuildType } from '../types/entities'
import {
  getBuildStatus,
  getBuilds,
  getRunStatus,
  getRuns,
  startBuild,
  startRun,
  stopBuild,
  stopRun,
} from '../controllers/API/build'
import { alertContext } from './alertContext'

export type connectionStatusType = 'alive' | 'broken' | 'closed' | 'not open' | 'pending'
export type buildStatusType = 'success' | 'failed' | 'not builded' | 'pending'
export type buildApiStatusType = 'completed' | 'failed' | 'running' | 'stopped'
export type apiPresetType = {
  name?: string
  duration?: number
  end_status?: buildApiStatusType
}

export type buildApiTypeMinify = {
  id: number
  status: buildApiStatusType
  timestamp: number
  preset_name: string
  runs: any[]
}

export type buildApiType = {
  id: number
  status: buildApiStatusType
  log_path: string
  logs: string[]
  preset_name: string
  timestamp: number
  runs: runApiType[]
}

export interface buildApiTypeRuns extends buildApiType {
  runs: runApiType[]
}

export type runApiType = {
  id: number
  status: buildApiStatusType
  timestamp: number
  preset_name: string
  build_id: number
  logs?: string[]
  logs_path?: string
}

type buildContextType = {
  chat: boolean
  setChat: Dispatch<SetStateAction<boolean>>
  logs: string[]
  setLogs: Dispatch<SetStateAction<string[]>>
  builds: buildApiType[]
  setBuilds: Dispatch<SetStateAction<buildApiType[]>>
  buildPending: boolean
  setBuildPending: Dispatch<SetStateAction<boolean>>
  builded: boolean
  setBuilded: Dispatch<SetStateAction<boolean>>
  buildStart: (options?: apiPresetType) => void
  connectionStatus: connectionStatusType
  setConnectionStatus: Dispatch<SetStateAction<connectionStatusType>>
  buildStatus: buildStatusType
  setBuildStatus: Dispatch<SetStateAction<buildStatusType>>
  logsPage: boolean
  setLogsPage: Dispatch<SetStateAction<boolean>>
  run: boolean
  setRun: Dispatch<SetStateAction<boolean>>
  runs: runApiType[]
  setRuns: Dispatch<SetStateAction<runApiType[]>>
  runPending: boolean
  setRunPending: Dispatch<SetStateAction<boolean>>
  runStart: (options?: apiPresetType) => void
  // statusSocketHandler: () => void
}

const initialValue: buildContextType = {
  chat: false,
  setChat: () => {},
  logs: [],
  setLogs: () => {},
  builds: [],
  setBuilds: () => {},
  buildPending: false,
  setBuildPending: () => {},
  builded: false,
  setBuilded: () => {},
  buildStart: () => {},
  connectionStatus: 'not open',
  setConnectionStatus: () => {},
  buildStatus: 'not builded',
  setBuildStatus: () => {},
  logsPage: false,
  setLogsPage: () => {},
  run: false,
  setRun: () => {},
  runs: [],
  setRuns: () => {},
  runPending: false,
  setRunPending: () => {},
  runStart: () => {},
  // statusSocketHandler: () => { }
}

export const buildContext = createContext<buildContextType>(initialValue)

export function BuildProvider({ children }) {
  const [builded, setBuilded] = useState<boolean>()
  const [run, setRun] = useState<boolean>(false)
  const [logsPage, setLogsPage] = useState<boolean>(false)
  const [chat, setChat] = useState<boolean>(false)
  const [logs, setLogs] = useState<string[]>(['init'])
  const [buildStatus, setBuildStatus] = useState<buildStatusType>('not builded')
  const [buildPending, setBuildPending] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<connectionStatusType>('not open')
  const [builds, setBuilds] = useState<buildApiType[]>([])
  const [runs, setRuns] = useState<runApiType[]>([])
  const [runPending, setRunPending] = useState<boolean>(false)

  const { setErrorData, setSuccessData, setNoticeData } = useContext(alertContext)

  useEffect(() => {
    const fetchBuilds = async () => {
      const b = await getBuilds()
      setBuilds(prev => b.build)
      if (b.build.length) {
        if (b.build.pop().status === 'completed') {
          setBuilded(true)
          setBuildStatus('success')
        }
      }
      return b
    }
    fetchBuilds()
  }, [])

  const buildStart = async ({
    duration = 3,
    end_status = 'completed',
    name = 'default',
  }: apiPresetType) => {
    setBuildPending((prev) => true)
    setBuildStatus('pending')
    try {
      const start_res = await startBuild({ duration, end_status, name })
      setBuilds((prev) => [...prev, start_res.build_info])
      let flag = true
      let timer = 0
      let timerId = setInterval(() => timer++, 1000)
      while (flag) {
        if (timer > 15) {
          setBuilded((prev) => false)
          setBuildStatus('failed')
          setErrorData({ title: 'Build timeout error!' })
          await stopBuild()
          return (flag = false)
        }
        const status = await getBuildStatus()
        if (status !== 'running') {
          flag = false
          const { build } = await getBuilds()
          setBuilds((prev) => build)
          if (status === 'completed') {
            setBuildStatus('success')
            setBuilded((prev) => true)
            setSuccessData({ title: 'Build successfully!' })
          } else if (status === 'failed') {
            setBuildStatus('failed')
            setBuilded((prev) => false)
            setErrorData({ title: 'Build failed!' })
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      clearInterval(timerId)
    } catch (error) {
    } finally {
      setBuildPending((prev) => false)
    }
  }

  const runStart = async ({
    duration = 3,
    end_status = 'completed',
    name = 'default',
  }: apiPresetType) => {
    setRunPending((prev) => true)
    setConnectionStatus('pending')
    try {
      const start_res = await startRun({ duration, end_status, name })
      setRuns((prev) => [...prev, start_res.run_info])
      const b = await getBuilds()
      setBuilds((prev) => b.build)
      let flag = true
      let timer = 0
      let timerId = setInterval(() => timer++, 1000)
      while (flag) {
        if (timer > 15) {
          setRun((prev) => false)
          setConnectionStatus('broken')
          setErrorData({ title: 'Run timeout error!' })
          await stopRun()
          return (flag = false)
        }
        const status = await getRunStatus()
        if (status !== 'running') {
          flag = false
          const { run } = await getRuns()
          setRuns((prev) => run)
          const b = await getBuilds()
          setBuilds((prev) => b.build)
          if (status === 'completed') {
            setConnectionStatus('closed')
            setRun((prev) => false)
            setSuccessData({ title: 'Run successfully closed!' })
          } else if (status === 'failed') {
            setConnectionStatus('broken')
            setRun((prev) => false)
            setErrorData({ title: 'Run failed!' })
          }
        } else {
          const { run } = await getRuns()
          setRuns((prev) => run)
          const b = await getBuilds()
          setBuilds((prev) => b.build)
          setRunPending((prev) => false)
          setConnectionStatus('alive')
          setRun((prev) => true)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      clearInterval(timerId)
    } catch (error) {
    } finally {
    }
  }

  return (
    <buildContext.Provider
      value={{
        logs,
        setLogs,
        builds,
        setBuilds,
        buildPending,
        setBuildPending,
        builded,
        setBuilded,
        buildStart,
        connectionStatus,
        setConnectionStatus,
        buildStatus,
        setBuildStatus,
        logsPage,
        setLogsPage,
        chat,
        setChat,
        run,
        setRun,
        runs,
        setRuns,
        runPending,
        setRunPending,
        runStart,
      }}>
      {children}
    </buildContext.Provider>
  )
}
