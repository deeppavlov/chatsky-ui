/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react"
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
import { NotificationsContext } from "./notificationsContext"

type BuildContextType = {
  build: boolean
  setBuild: React.Dispatch<React.SetStateAction<boolean>>
  builds: localBuildType[]
  setBuilds: React.Dispatch<React.SetStateAction<localBuildType[]>>
  buildPending: boolean
  setBuildPending: React.Dispatch<React.SetStateAction<boolean>>
  buildStart: (
    options: buildPresetType
  ) => Promise<{ status: buildApiStatusType; build_id?: number }>
  buildStop: () => void
  buildStatus: string
  setBuildStatus: React.Dispatch<React.SetStateAction<buildApiStatusType>>
  setBuildsHandler: (builds: buildMinifyApiType[]) => void
}

export const buildContext = createContext({
  build: false,
  setBuild: () => {},
  builds: [],
  setBuilds: () => {},
  buildPending: false,
  setBuildPending: () => {},
  buildStart: async () => ({ status: "failed", build_id: 0 }),
  buildStop: () => {},
  buildStatus: "",
  setBuildStatus: () => {},
  setBuildsHandler: () => {},
} as BuildContextType)

export const BuildProvider = ({ children }: { children: React.ReactNode }) => {
  const [build, setBuild] = useState(false)
  const [buildPending, setBuildPending] = useState(false)
  const [buildStatus, setBuildStatus] = useState<buildApiStatusType>("stopped")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const [builds, setBuilds] = useState<localBuildType[]>([])
  const { notification: n } = useContext(NotificationsContext)

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

  const buildStart = async ({
    end_status = "completed",
    name,
    preset,
    messenger,
  }: buildPresetType): Promise<{ status: buildApiStatusType; build_id?: number }> => {
    setBuildPending(true)
    setBuildStatus("running")

    try {
      const { build_id } = await build_start({ end_status, name, preset, messenger })
      const started_builds = await get_builds()
      setBuildsHandler(started_builds)

      const timerId = setTimeout(async () => {
        setBuild(false)
        setBuildStatus("failed")
        n.add({
          title: "Build timeout error!",
          message: "",
          type: "error",
        })
        await build_stop(build_id)
        setBuildPending(false)
        return "failed"
      }, 15000)

      let flag = true
      while (flag) {
        const status_res = await build_status(build_id)
        const status = status_res.status

        if (status !== "running" && status !== "alive") {
          flag = false
          clearTimeout(timerId)

          await handleBuildCompletion(status)
          return { status, build_id }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Build start error:", error)
      return { status: "failed" }
    } finally {
      setBuildPending(false)
    }
    return { status: "failed" }
  }

  const handleBuildCompletion = async (status: string) => {
    const builds = await get_builds()

    setBuilds(builds.map((build) => ({ ...build, type: "build" })))

    if (status === "completed") {
      setBuildStatus("completed")
      setBuild(true)
      n.add({
        title: "Build successfully!",
        message: "",
        type: "success",
      })
    } else if (status === "failed") {
      setBuildStatus("failed")
      setBuild(false)
      n.add({
        title: "Build failed!",
        message: "Unknown build error. Please check your script.",
        type: "error",
      })
    }
  }

  const buildStop = async () => {
    try {
      await build_stop(builds[0].id + 1)
      setBuildPending(() => false)
      setBuildStatus("stopped")
    } catch (error) {
      console.log(error)
      n.add({
        title: "Build stop error!",
        message: (error as Error).message,
        type: "error",
      })
    }
  }

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
        setBuildsHandler,
      }}
    >
      {children}
    </buildContext.Provider>
  )
}
