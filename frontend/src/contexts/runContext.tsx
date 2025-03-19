import { delay } from '@/utils';
import { AxiosError } from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildApiStatusType, get_runs, localRunType, run_start, run_status, run_stop, run_stop_all, runMinifyApiType, runPresetType } from '../api/bot';
import { buildContext } from './buildContext';
import { NotificationsContext } from './notificationsContext'


export type runApiType = {
  id: number
  status: buildApiStatusType
  timestamp: number
  preset_name: string
  build_id: number
  logs?: string[]
  logs_path?: string
}

type RunContextType = {
  runs: localRunType[]
  setRuns: React.Dispatch<React.SetStateAction<localRunType[]>>
  runStarting: boolean
  setRunStarting: React.Dispatch<React.SetStateAction<boolean>>
  startingRunId: number | null
  setStartingRunId: React.Dispatch<React.SetStateAction<number | null>>
  runStopping: boolean
  setRunStopping: React.Dispatch<React.SetStateAction<boolean>>
  stoppingRunIds: number[]
  setStoppingRunIds: React.Dispatch<React.SetStateAction<number[]>>
  runStart: (build_id: string, preset: runPresetType) => void
  runStop: (run_id: number) => void
  stopAllRuns: (run_ids: number[]) => void
  setRunsHandler: (runs: runMinifyApiType[]) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const runContext = createContext({
  setRuns: () => {},
  runs: [],
  runStarting: false,
  setRunStarting: () => {},
  startingRunId: null,
  setStartingRunId: () => {},
  runStopping: false,
  setRunStopping: () => {},
  stoppingRunIds: [],
  setStoppingRunIds: () => {},
  runStart: async () => {},
  runStop: () => {},
  stopAllRuns: () => {},
  setRunsHandler: () => {},
} as RunContextType)

export const RunProvider = ({ children }: { children: React.ReactNode }) => {
  const [runStarting, setRunStarting] = useState(false)
  const [startingRunId, setStartingRunId] = useState<number | null>(null)
  const [runStopping, setRunStopping] = useState(false)
  const [stoppingRunIds, setStoppingRunIds] = useState<number[]>([])
  const [runs, setRuns] = useState<localRunType[]>([])
  const { notification: n } = useContext(NotificationsContext)
  const { setBuilds } = useContext(buildContext)

  const setRunsHandler = (runs: runMinifyApiType[]) => {
    setRuns(runs.map((run) => ({ ...run, type: 'run' })))
  }

  const getRunInitial = async () => {
    const data = await get_runs()
    if (data) {
      const _runs: localRunType[] = data.map((run) => {
        return { ...run, type: 'run' }
      })
      setRuns(_runs.sort((a, b) => b.id - a.id))
    }
  }

  useEffect(() => {
    getRunInitial()
  }, [])

  const runStart = async (
    build_id: string,
    { end_status = 'success', ...restParams }: runPresetType,
  ) => {
    setStartingRunId(runs.length)
    setRunStarting(true)
    setTimeout(() => setRunStarting(false), 13000)

    try {
      // 1. Запуск рана и получение run_id
      const { run_id } = await run_start(build_id, {
        end_status,
        ...restParams,
      })

      // 2. Ожидание появления рана в списке ранов
      let started_run = await get_runs(run_id)
      while (!started_run) {
        await delay(500)
        started_run = await get_runs(run_id)
      }
      setRunsHandler([...runs, started_run])
      setBuilds((builds) =>
        builds.map((b) =>
          b.id === started_run.build_id
            ? { ...b, runs: [...b.runs, { ...started_run, type: 'run' }] }
            : b,
        ),
      )

      // 4. Мониторинг статуса рана

      let status: buildApiStatusType = 'running'

      while (status === 'running') {
        try {
          status = (await run_status(started_run.id)).status
          status === 'running' && (await delay(1000))
        } catch (e) {
          console.log(e)
          await delay(1000)
        }
      }

      setRuns((prev) =>
        prev.map((r) => (run_id === r.id ? { ...r, status } : r)),
      )
      setBuilds((builds) =>
        builds.map((build) =>
          build.id === started_run.build_id
            ? {
                ...build,
                runs: build.runs.map((run) =>
                  run.id === run_id ? { ...run, status } : run,
                ),
              }
            : build,
        ),
      )
      switch (status) {
        case 'alive':
          n.add({
            title: 'Run started!',
            message: '',
            type: 'success',
          })
          break

        case 'failed':
          n.add({
            title: 'Run failed!',
            message: 'Unknown run error. Please check your script.',
            type: 'error',
            link: {
              text: 'Logs',
              url: `?page=inspect&run_id=${started_run.id}&type=run`,
            },
          })
          break

        default:
          break
      }
    } catch (error) {
      console.error('Error during run start:', error)
      n.add({
        title: 'Run error!',
        message:
          error instanceof AxiosError
            ? error.message
            : 'An unexpected error occurred.',
        type: 'error',
      })
    } finally {
      setStartingRunId(null)
      setRunStarting(false)
    }
  }

  async function runStop(run_id: number) {
    let isTimeoutReached = false
    setStoppingRunIds((ids) => [...ids, run_id])
    try {
      await run_stop(run_id)

      let status: buildApiStatusType = 'alive'

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          isTimeoutReached = true
          reject(new Error('Timeout error'))
        }, 10000)
      })

      const stopRunPromise = (async () => {
        while (status !== 'stopped' && !isTimeoutReached) {
          try {
            status = (await run_status(run_id)).status
            status !== 'stopped' && (await delay(1000))
          } catch (e) {
            console.log(e)
            await delay(1000)
          }
        }
      })()

      await Promise.race([stopRunPromise, timeoutPromise])
      setRunsHandler(runs.map((r) => (r.id === run_id ? { ...r, status } : r)))
      const stoppedRun = runs.find((r) => r.id === run_id) as runMinifyApiType
      setBuilds((builds) =>
        builds.map((build) =>
          build.id === stoppedRun.build_id
            ? {
                ...build,
                runs: build.runs.map((run) =>
                  run.id === run_id ? { ...run, status } : run,
                ),
              }
            : build,
        ),
      )

      n.add({
        message: '',
        title: 'Run stopped!',
        type: 'info',
      })
    } catch (error) {
      console.log(error)
      n.add({
        message: '',
        title: 'Error stopping the run!',
        type: 'error',
      })
    } finally {
      setStoppingRunIds((ids) => ids.filter((id) => id !== run_id))
    }
  }

  const stopAllRuns = async () => {
    setRunStopping(true)
    let isTimeoutReached = false
    try {
      await run_stop_all()

      let runs = await get_runs()
      let isAllStopped = runs.every((r) => r.status !== 'alive')

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          isTimeoutReached = true
          reject(new Error('Timeout error'))
        }, 10000)
      })
      const stopRunsPromise = (async () => {
        while (!isAllStopped && !isTimeoutReached) {
          await delay(1000)
          runs = await get_runs()
          isAllStopped = runs.every((r) => r.status !== 'alive')
        }
      })()
      await Promise.race([stopRunsPromise, timeoutPromise])

      setRunsHandler(runs)
      setBuilds((builds) =>
        builds.map((build) => ({
          ...build,
          runs: build.runs.map((run) => ({ ...run, status: 'stopped' })),
        })),
      )

      n.add({
        message: '',
        title: 'All runs stopped!',
        type: 'info',
      })
    } catch (error) {
      console.log(error)
      n.add({
        message: '',
        title: 'Error stopping the run!',
        type: 'error',
      })
    } finally {
      setRunStopping(false)
    }
  }

  return (
    <runContext.Provider
      value={{
        runStarting,
        setRunStarting,
        startingRunId,
        setStartingRunId,
        runStopping,
        setRunStopping,
        stoppingRunIds,
        setStoppingRunIds,
        runStart,
        runStop,
        stopAllRuns,
        runs,
        setRuns,
        setRunsHandler,
      }}
    >
      {children}
    </runContext.Provider>
  )
}