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
} from "../api/bot"
import { NotificationsContext } from "./notificationsContext"

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
  runPending: boolean
  setRunPending: React.Dispatch<React.SetStateAction<boolean>>
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
  runPending: false,
  setRunPending: () => {},
  runStart: async () => {},
  runStop: () => {},
  stopAllRuns: () => {},
  setRunStatus: () => {},
  runStatus: "stopped",
  setRunsHandler: () => {},
} as RunContextType)

export const RunProvider = ({ children }: { children: React.ReactNode }) => {
  const [run, setRun] = useState<localRunType | null>(null)
  const [runPending, setRunPending] = useState(false)
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
    { end_status = "success", name, preset, build_name }: runPresetType
  ) => {
    setRunPending(true)
    setRunStatus("running")

    try {
      // 1. Запуск рана и получение run_id
      const { run_id } = await run_start(build_id, {
        end_status,
        name,
        preset,
        build_name,
      })

      let started_run
      let elapsedTime = 0
      const checkInterval = 500 // Интервал проверки (мс)
      const initializationTimeout = 5000 // Таймаут на появление рана в списке (5 секунд)

      // 2. Ожидание появления рана в списке ранов
      while (!started_run) {
        const started_runs = await get_runs()
        started_run = started_runs.find((r) => r.id === run_id)

        if (!started_run) {
          // Если ран не найден, ждём 0.5 секунды и проверяем снова
          await new Promise((resolve) => setTimeout(resolve, checkInterval))
          elapsedTime += checkInterval

          // Уведомление, если процесс длится больше 10 секунд
          if (elapsedTime >= initializationTimeout) {
            n.add({
              title: "Run timeout error!",
              message: "",
              type: "warning",
            })
            break
          }
        } else {
          setRunsHandler(started_runs)
          setRun({ ...started_run, type: "run" })
        }
      }

      if (!started_run) {
        // Если ран так и не появился, завершаем выполнение
        setRunPending(false)
        setRunStatus("failed")
        return
      }

      // 4. Мониторинг статуса рана
      let isMonitoring = true
      elapsedTime = 0 // Сбрасываем таймер для мониторинга статуса
      const monitoringTimeout = 5000 // Таймаут на мониторинг статуса (5 секунд)

      while (isMonitoring) {
        const { status } = await run_status(started_run.id)

        if (status !== "running") {
          // Обновляем состояние, если статус изменился
          setRuns((prev) => prev.map((r) => (run_id === r.id ? { ...r, status } : r)))
          setRunPending(false)
          setRunStatus(status)
          isMonitoring = false

          // Уведомление в зависимости от статуса
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

        // Проверяем таймаут мониторинга
        elapsedTime += checkInterval
        if (elapsedTime >= monitoringTimeout) {
          n.add({
            title: "Run timeout error!",
            message: "The run status has not changed for too long.",
            type: "warning",
          })
          isMonitoring = false
        }

        // Ждём перед следующей проверкой
        await new Promise((resolve) => setTimeout(resolve, checkInterval))
      }
    } catch (error) {
      console.error("Error during run start:", error)
      n.add({
        title: "Run error!",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
        type: "error",
      })
    } finally {
      setRunPending(false)
    }
  }

  async function runStop(run_id: number) {
    setRunPending(() => true)
    try {
      await run_stop(run_id)
      let counter = 0
      const timerId = setInterval(async () => {
        if (counter > 10) {
          clearInterval(timerId)
          setRunPending(() => false)
          n.add({
            message: "",
            title: "Error stopping the run!",
            type: "error",
          })
        }
        counter += 1
        const runs = await get_runs()
        // const { status } = await run_status(run_id)
        // if (status === "stopped") {
        // из-за бага статус рана берём из массива со всеми ранами
        if (runs.find((r) => r.id === run_id)?.status === "stopped") {
          clearInterval(timerId)
          setRunsHandler(runs)
          setRunStatus("stopped")
          setRunPending(() => false)
          n.add({
            message: "",
            title: "Run stopped!",
            type: "info",
          })
        }
      }, 1000)
    } catch (error) {
      console.log(error)
      setRunPending(false)
      n.add({
        message: "",
        title: "Error stopping the run!",
        type: "error",
      })
    }
  }

  const stopAllRuns = async (run_ids: number[]) => {
    setRunPending(true)

    for (const id of run_ids) {
      try {
        // Ожидание завершения остановки запуска
        const { status } = await run_stop(id)
        if (status === "error") {
          throw Error("Error stopping the run")
        }
        let counter = 0

        // Ожидание изменения статуса запуска на "stopped"
        await new Promise<void>((resolve, reject) => {
          const timerId = setInterval(async () => {
            if (counter > 10) {
              clearInterval(timerId)
              reject(new Error("Error stopping the run!"))
              setRunPending(false)
              return
            }
            counter += 1

            const runs = await get_runs()
            // из-за бага статус рана берём из массива со всеми ранами
            if (runs.find((r) => r.id === id)?.status === "stopped") {
              clearInterval(timerId)
              setRunsHandler(runs)
              setRunStatus("stopped")
              setRunPending(false)
              n.add({
                message: "",
                title: "Run stopped!",
                type: "info",
              })
              resolve()
            }
          }, 1000)
        })
      } catch (error) {
        console.log(error)
        setRunPending(false)
        n.add({
          message: "",
          title: "Error stopping the run!",
          type: "error",
        })
      }
    }

    setRunPending(false)
  }

  return (
    <runContext.Provider
      value={{
        run,
        setRun,
        runPending,
        setRunPending,
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
