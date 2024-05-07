import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  buildApiStatusType,
  buildPresetType,
  get_builds,
  get_runs,
  localRunType,
  runMinifyApiType,
  run_start,
  run_status,
  run_stop
} from "../api/bot"
import { buildContext } from "./buildContext"

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
  runStart: (preset: buildPresetType) => void
  runStop: (run_id: number) => void
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
  setRunStatus: () => {},
  runStatus: "stopped",
  setRunsHandler: () => {},
} as RunContextType)

export const RunProvider = ({ children }: { children: React.ReactNode }) => {
  const [run, setRun] = useState<localRunType | null>(null)
  const [runPending, setRunPending] = useState(false)
  const [runStatus, setRunStatus] = useState<buildApiStatusType>("stopped")
  const [runs, setRuns] = useState<localRunType[]>([])
  const { setBuildsHandler } = useContext(buildContext)

  const setRunsHandler = (runs: runMinifyApiType[]) => {
    setRuns(runs.map((run) => ({ ...run, type: "run" })))
  }

  const getRunInitial = async () => {
    const data = await get_runs()
    // console.log(data)
    if (data) {
      const _runs: localRunType[] = data.map((run) => {
        console.log(run)
        return { ...run, type: "run" }
      })
      console.log(_runs)
      setRuns(_runs)
      if (_runs[_runs.length - 1].status === "running") {
        console.log(1)
        setRun(_runs[_runs.length - 1])
        setRunStatus("alive")
      }
    }
  }

  useEffect(() => {
    getRunInitial()
  }, [])

  const runStart = async ({ end_status = "success", wait_time = 0 }: buildPresetType) => {
    setRunPending(() => true)
    setRunStatus("running")
    try {
      const data = await run_start({ wait_time, end_status }, 43)
      console.log("run started")
      const started_runs = await get_runs()
      const started_run = started_runs.find((r) => r.id === data.run_id)!
      setRun({ ...started_run, type: "run" })
      console.log(started_run)
      setRuns((prev) => [
        ...prev,
        {
          ...started_run,
          type: "run",
        },
      ])
      const builds = await get_builds()
      setBuildsHandler(builds)
      let flag = true
      let timer = 0
      const timerId = setInterval(() => timer++, 500)
      while (flag) {
        if (timer > 9999) {
          setRunPending(() => false)
          setRunStatus("failed")
          toast.error("Run timeout error!")
          return (flag = false)
        }
        const { status } = await run_status(started_run.id)
        console.log(status)
        if (status === "running") {
          flag = false
          setRunPending(false)
          setRunStatus("alive")
        }
        // if (status !== "running") {
        //   flag = false
        //   const {
        //     data: { run },
        //   } = await get_runs()
        //   setRuns((prev) => run.map((run) => ({ ...run, type: "run" })))
        //   const { data: b } = await get_builds()
        //   setBuilds((prev) =>
        //     b.build.map((build) => ({
        //       ...build,
        //       type: "build",
        //       runs: build.runs.map((run) => ({ ...run, type: "run" })),
        //     }))
        //   )
        //   if (status === "completed") {
        //     setRunPending((prev) => false)
        //     setRunStatus("completed")
        //     setRun((prev) => false)
        //     toast.success("Run successfully closed!")
        //   } else if (status === "failed") {
        //     setRunPending((prev) => false)
        //     setRunStatus("failed")
        //     setRun((prev) => false)
        //     toast.error("Run failed!")
        //   }
        // } else {
        //   const {
        //     data: { run },
        //   } = await get_runs()
        //   setRuns((prev) => run.map((run) => ({ ...run, type: "run" })))
        //   const { data: b } = await get_builds()
        //   setBuilds((prev) =>
        //     b.build.map((build) => ({
        //       ...build,
        //       type: "build",
        //       runs: build.runs.map((run) => ({ ...run, type: "run" })),
        //     }))
        //   )
        //   setRunPending((prev) => true)
        //   setRunStatus("running")
        //   setRun((prev) => true)
        // }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      clearInterval(timerId)
    } catch (error) {
      console.log(error)
    } finally {
      setRunPending(() => false)
    }
  }

  async function runStop(run_id: number) {
    try {
      const res = await run_stop(run_id)
      if (res.status === "ok") {
        setTimeout(async () => {
          const builds = await get_builds()
          setBuildsHandler(builds)
          const runs = await get_runs()
          setRunsHandler(runs)
          setRunStatus("stopped")
        }, 500)
      }
    } catch (error) {
      console.log(error)
    }
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
        runStatus,
        runs,
        setRuns,
        setRunStatus,
        setRunsHandler,
      }}>
      {children}
    </runContext.Provider>
  )
}
