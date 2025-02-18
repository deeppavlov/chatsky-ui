import { createContext, useContext, useEffect, useState } from "react"
import {
  buildApiStatusType,
  get_runs,
  localRunType,
  runMinifyApiType,
  runPresetType,
  run_start,
  run_status,
  run_stop,
  run_stop_all,
} from "../api/bot"
import { NotificationsContext } from "./notificationsContext"
import { AxiosError } from "axios"

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
  run: localRunType | null
  setRun: React.Dispatch<React.SetStateAction<localRunType | null>>
  startingRunId: number | null
  setStartingRunId: React.Dispatch<React.SetStateAction<number | null>>
  runStopping: boolean
  setRunStopping: React.Dispatch<React.SetStateAction<boolean>>
  runStart: (build_id: string, preset: runPresetType) => void
  runStop: (run_id: number) => void
  stopAllRuns: (run_ids: number[]) => void
  runStatus: buildApiStatusType
  setRunStatus: React.Dispatch<React.SetStateAction<buildApiStatusType>>
  setRunsHandler: (runs: runMinifyApiType[]) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const runContext = createContext({
  setRuns: () => {},
  runs: [],
  run: null,
  setRun: () => {},
  startingRunId: null,
  setStartingRunId: () => {},
  runStopping: false,
  setRunStopping: () => {},
  runStart: async () => {},
  runStop: () => {},
  stopAllRuns: () => {},
  setRunStatus: () => {},
  runStatus: "stopped",
  setRunsHandler: () => {},
} as RunContextType)

export const RunProvider = ({ children }: { children: React.ReactNode }) => {
  const [run, setRun] = useState<localRunType | null>(null)
  const [startingRunId, setStartingRunId] = useState<number | null>(null)
  const [runStopping, setRunStopping] = useState(false)
  const [runStatus, setRunStatus] = useState<buildApiStatusType>("stopped")
  const [runs, setRuns] = useState<localRunType[]>([])
  const { notification: n } = useContext(NotificationsContext)

  const setRunsHandler = (runs: runMinifyApiType[]) => {
    setRuns(runs.map((run) => ({ ...run, type: "run" })))
  }

  const getRunInitial = async () => {
    const data = await get_runs()
    if (data) {
      const _runs: localRunType[] = data.map((run) => {
        return { ...run, type: "run" }
      })
      setRuns(_runs)
      if (_runs[_runs.length - 1].status === "alive") {
        setRun(_runs[_runs.length - 1])
        setRunStatus("alive")
      }
    }
  }

  useEffect(() => {
    getRunInitial()
  }, [])

  const runStart = async (
    build_id: string,
    { end_status = "success", ...restParams }: runPresetType
  ) => {
    setRunStatus("running")
    setStartingRunId(runs.length)

    try {
      // 1. Запуск рана и получение run_id
      const { run_id } = await run_start(build_id, {
        end_status,
        ...restParams,
      })

      let started_run
      const checkInterval = 500

      // 2. Ожидание появления рана в списке ранов
      while (!started_run) {
        // const started_runs = await get_runs()
        started_run = await get_runs(run_id)
        await new Promise((resolve) => setTimeout(resolve, checkInterval))
        // Это бесконечный цикл, но его можно остановить с помощью кнопки в интерфейсе

        if (started_run) {
          // Если ран найден, добавляем его в стейт
          setRunsHandler([...runs, started_run])
          setRun({ ...started_run, type: "run" })
        }
      }

      // 4. Мониторинг статуса рана
      let isMonitoring = true

      while (isMonitoring) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          const { status } = await run_status(started_run.id)

          if (status !== "running") {
            // Обновляем состояние, если статус изменился
            setRuns((prev) => prev.map((r) => (run_id === r.id ? { ...r, status } : r)))
            setRunStatus(status)
            isMonitoring = false

            switch (status) {
              case "alive":
                n.add({
                  title: "Run started!",
                  message: "",
                  type: "success",
                })
                break

              case "failed":
                n.add({
                  title: "Run failed!",
                  message: "Unknown run error. Please check your script.",
                  type: "error",
                })
                break

              default:
                // Продолжаем мониторинг
                break
            }
          }
        } catch (error) {
          console.log(error)
          // если функция run_status вернёт ошибку, не прерываем цикл
        }
      }
    } catch (error) {
      console.error("Error during run start:", error)
      setStartingRunId(null)
      n.add({
        title: "Run error!",
        message: error instanceof AxiosError ? error.message : "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setStartingRunId(null)
    }
  }

  async function runStop(run_id: number) {
    try {
      await run_stop(run_id)
      let counter = 0
      const timerId = setInterval(async () => {
        if (counter > 10) {
          clearInterval(timerId)
          n.add({
            message: "",
            title: "Error stopping the run!",
            type: "error",
          })
        }
        counter += 1

        const { status } = await run_status(run_id)
        if (status === "stopped") {
          clearInterval(timerId)
          setRunsHandler(runs.map((r) => (r.id === run_id ? { ...r, status } : r)))
          setRunStatus("stopped")
          n.add({
            message: "",
            title: "Run stopped!",
            type: "info",
          })
        }
      }, 1000)
    } catch (error) {
      console.log(error)
      n.add({
        message: "",
        title: "Error stopping the run!",
        type: "error",
      })
    }
  }

  const stopAllRuns = async () => {
    setRunStopping(true)
    try {
      await run_stop_all()
      let counter = 0
      const timerId = setInterval(async () => {
        if (counter > 10) {
          clearInterval(timerId)
          n.add({
            message: "",
            title: "Error stopping the run!",
            type: "error",
          })
        }
        counter += 1
        const runs = await get_runs()
        if (runs.every((r) => r.status !== "alive")) {
          clearInterval(timerId)
          setRunsHandler(runs)
          setRunStatus("stopped")
          n.add({
            message: "",
            title: "All runs stopped!",
            type: "info",
          })
        }
      }, 1000)
    } catch (error) {
      console.log(error)
      n.add({
        message: "",
        title: "Error stopping the run!",
        type: "error",
      })
    } finally {
      setRunStopping(false)
    }
  }

  return (
    <runContext.Provider
      value={{
        run,
        setRun,
        startingRunId,
        setStartingRunId,
        runStopping,
        setRunStopping,
        runStart,
        runStop,
        stopAllRuns,
        runStatus,
        runs,
        setRuns,
        setRunStatus,
        setRunsHandler,
      }}
    >
      {children}
    </runContext.Provider>
  )
}
