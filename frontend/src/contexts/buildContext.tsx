import { createContext, useEffect, useState } from "react"
import {
  buildApiStatusType,
  buildApiType,
  buildPresetType,
  build_start,
  build_status,
  build_stop,
  get_build,
  get_builds,
  get_run,
  localBuildType,
} from "../api/bot"
import { apiPresetType } from "../types/buildrunTypes"
import toast from "react-hot-toast"
import { useSearchParams } from "react-router-dom"

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
} as BuildContextType)

export const BuildProvider = ({ children }: { children: React.ReactNode }) => {
  const [build, setBuild] = useState(false)
  const [buildPending, setBuildPending] = useState(false)
  const [buildStatus, setBuildStatus] = useState<buildApiStatusType>("stopped")
  const [searchParams, setSearchParams] = useSearchParams()
  const [logsPage, setLogsPage] = useState(searchParams.get("logs_page") === "opened")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [builds, setBuilds] = useState<localBuildType[]>([])

  const getBuildInitial = async () => {
    const builds = await get_builds()
    console.log(builds)
    if (builds) {
      setBuilds(
        builds.map((build) => ({
          ...build,
          type: "build",
        }))
      )
      if (builds[builds.length - 1].status === "completed") {
        setBuild(true)
        setBuildStatus("completed")
      }
    }
  }

  useEffect(() => {
    getBuildInitial()
  }, [])

  const buildStart = async ({ end_status = "completed", wait_time = 3 }: buildPresetType) => {
    setBuildPending((prev) => true)
    setBuildStatus("running")
    try {
      const start_res = await build_start({ end_status, wait_time })
      const started_build = await get_build(start_res.build_id)
      const started_builds = await get_builds()
      setBuilds(
        started_builds.map((s_b) => ({
          ...s_b,
          type: "build",
        }))
      )
      let flag = true
      let timer = 0
      const timerId = setInterval(() => timer++, 1000)
      while (flag) {
        if (timer > 15) {
          setBuild((prev) => false)
          setBuildStatus("failed")
          toast.error("Build timeout!")
          await build_stop(start_res.build_id)
          return (flag = false)
        }
        const status_res = await build_status(start_res.build_id)
        console.log(status_res)
        const status = status_res.status.toLowerCase()
        console.log(status)
        if (status !== "running") {
          flag = false
          setTimeout(async () => {
            const build = await get_builds()
            setBuilds((prev) =>
              build.map((build) => ({
                ...build,
                type: "build",
              }))
            )
            console.log(build)
          }, 1000)
          if (status === "completed") {
            setBuildStatus("completed")
            setBuild((prev) => true)
            toast.success("Build successfully!")
          } else if (status === "failed") {
            setBuildStatus("failed")
            setBuild((prev) => false)
            toast.error("Build failed!")
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      clearInterval(timerId)
    } catch (error) {
      console.log(error)
    } finally {
      setBuildPending((prev) => false)
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
      }}>
      {children}
    </buildContext.Provider>
  )
}
