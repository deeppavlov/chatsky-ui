/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useSearchParams } from "react-router-dom"
import {
  buildApiStatusType,
  buildMinifyApiType,
  buildPresetType,
  build_start,
  build_status,
  build_stop,
  get_builds,
  localBuildType,
} from "../api/bot"

type BuildContextType = {
  build: boolean
  setBuild: React.Dispatch<React.SetStateAction<boolean>>
  builds: localBuildType[]
  setBuilds: React.Dispatch<React.SetStateAction<localBuildType[]>>
  buildPending: boolean
  setBuildPending: React.Dispatch<React.SetStateAction<boolean>>
  buildStart: (options: buildPresetType) => void
  buildStop: () => void
  buildStatus: string
  setBuildStatus: React.Dispatch<React.SetStateAction<buildApiStatusType>>
  logsPage: boolean
  setLogsPage: React.Dispatch<React.SetStateAction<boolean>>
  setBuildsHandler: (builds: buildMinifyApiType[]) => void
}

export const buildContext = createContext({
  build: false,
  setBuild: () => {},
  builds: [],
  setBuilds: () => {},
  buildPending: false,
  setBuildPending: () => {},
  buildStart: () => {},
  buildStop: () => {},
  buildStatus: "",
  setBuildStatus: () => {},
  logsPage: false,
  setLogsPage: () => {},
  setBuildsHandler: () => {},
} as BuildContextType)

export const BuildProvider = ({ children }: { children: React.ReactNode }) => {
  const [build, setBuild] = useState(false)
  const [buildPending, setBuildPending] = useState(false)
  const [buildStatus, setBuildStatus] = useState<buildApiStatusType>("stopped")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const [logsPage, setLogsPage] = useState(searchParams.get("logs_page") === "opened")
  const [builds, setBuilds] = useState<localBuildType[]>([])

  const setBuildsHandler = (builds: buildMinifyApiType[]) => {
    setBuilds(() =>
      builds.map((build) => ({
        ...build,
        type: "build",
        runs: build.runs.map((run) => ({ ...run, type: "run" })),
      }))
    )
  }

  useEffect(() => {
    const getBuildInitial = async () => {
      const builds = await get_builds()
      if (builds) {
        setBuildsHandler(builds)
        if (builds[builds.length - 1].status === "completed") {
          setBuild(true)
          setBuildStatus("completed")
        }
      }
    }
    getBuildInitial()
  }, [])

  const buildStart = async ({ end_status = "completed", wait_time = 0 }: buildPresetType) => {
    setBuildPending(() => true)
    setBuildStatus("running")
    try {
      const start_res = await build_start({ end_status, wait_time })
      const started_builds = await get_builds()
      // const started_build = started_builds.find((build) => build.id === start_res.build_id)
      setBuildsHandler(started_builds)
      let flag = true
      let timer = 0
      const timerId = setInterval(() => timer++, 1000)
      while (flag) {
        if (timer > 15) {
          setBuild(() => false)
          setBuildStatus("failed")
          toast.error("Build timeout!")
          await build_stop(start_res.build_id)
          return (flag = false)
        }
        const status_res = await build_status(start_res.build_id)
        const status = status_res.status.toLowerCase()
        if (status !== "running" && status !== "alive") {
          flag = false
          setTimeout(async () => {
            const build = await get_builds()
            setBuilds(() =>
              build.map((build) => ({
                ...build,
                type: "build",
              }))
            )
          }, 1000)
          if (status === "completed") {
            setBuildStatus("completed")
            setBuild(() => true)
            toast.success("Build successfully!")
          } else if (status === "failed") {
            setBuildStatus("failed")
            setBuild(() => false)
            toast.error("Build failed!")
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      clearInterval(timerId)
    } catch (error) {
      console.log(error)
    } finally {
      setBuildPending(() => false)
    }
  }
  const buildStop = () => {}

  return (
    <buildContext.Provider
      value={{
        build,
        setBuild,
        buildPending,
        setBuildPending,
        buildStart,
        buildStop,
        buildStatus,
        setBuildStatus,
        builds,
        setBuilds,
        logsPage,
        setLogsPage,
        setBuildsHandler,
      }}>
      {children}
    </buildContext.Provider>
  )
}
