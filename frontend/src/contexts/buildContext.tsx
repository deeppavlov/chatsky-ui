/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  build_start,
  build_status,
  build_stop,
  buildApiStatusType,
  buildMinifyApiType,
  buildPresetType,
  get_builds,
  localBuildType,
} from '../api/bot'
import { NotificationsContext } from './notificationsContext'

type BuildContextType = {
  builds: localBuildType[]
  setBuilds: React.Dispatch<React.SetStateAction<localBuildType[]>>
  buildPending: boolean
  setBuildPending: React.Dispatch<React.SetStateAction<boolean>>
  buildStart: (
    options: buildPresetType,
  ) => Promise<{ status: buildApiStatusType; build_id?: number }>
  buildStop: (buildId: number) => void
  setBuildsHandler: (builds: buildMinifyApiType[]) => void
}

export const buildContext = createContext({
  builds: [],
  setBuilds: () => {},
  buildPending: false,
  setBuildPending: () => {},
  buildStart: async () => ({ status: 'failed', build_id: 0 }),
  buildStop: () => {},
  setBuildsHandler: () => {},
} as BuildContextType)

export const BuildProvider = ({ children }: { children: React.ReactNode }) => {
  const [buildPending, setBuildPending] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const [builds, setBuilds] = useState<localBuildType[]>([])
  const { notification: n } = useContext(NotificationsContext)

  const setBuildsHandler = (builds: buildMinifyApiType[]) => {
    setBuilds(() =>
      builds.map((build) => ({
        ...build,
        type: 'build',
        runs: build.runs.map((run) => ({ ...run, type: 'run' })),
      })),
    )
  }

  useEffect(() => {
    const getBuildInitial = async () => {
      const builds = await get_builds()
      if (builds) {
        setBuildsHandler(builds.sort((a, b) => b.id - a.id))
      }
    }
    getBuildInitial()
  }, [])

  const buildStart = async ({
    end_status = 'completed',
    name,
    preset,
    messenger,
  }: buildPresetType): Promise<{
    status: buildApiStatusType
    build_id?: number
  }> => {
    setBuildPending(true)

    try {
      const { build_id } = await build_start({
        end_status,
        name,
        preset,
        messenger,
      })

      let started_build = await get_builds(build_id)
      while (!started_build) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        started_build = await get_builds(build_id)
      }

      setBuildsHandler([started_build, ...builds])

      let flag = true
      while (flag) {
        const status_res = await build_status(build_id)
        const status = status_res.status

        if (status !== 'running' && status !== 'alive') {
          flag = false
          setBuilds((builds) =>
            builds.map((b) => (b.id === build_id ? { ...b, status } : b)),
          )
          handleBuildCompletion(status, build_id)
          return { status, build_id }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Build start error:', error)
      return { status: 'failed' }
    } finally {
      setBuildPending(false)
    }
    return { status: 'failed' }
  }

  const handleBuildCompletion = (
    status: buildApiStatusType,
    build_id: number,
  ) => {
    if (status === 'completed') {
      n.add({
        title: 'Build successfully!',
        message: '',
        type: 'success',
      })
    } else if (status === 'failed') {
      n.add({
        title: 'Build failed!',
        message: 'Unknown build error. Please check your script.',
        type: 'error',
        link: {
          text: 'See logs for this build',
          url: `?page=inspect&build_id=${build_id}&type=build`,
        },
      })
    }
  }

  const buildStop = async (buildId: number) => {
    try {
      await build_stop(buildId)
      setBuildPending(() => false)
      n.add({
        title: 'Build stopped!',
        message: '',
        type: 'info',
      })
    } catch (error) {
      console.log(error)
      n.add({
        title: 'Build stop error!',
        message: (error as Error).message,
        type: 'error',
      })
    }
  }

  return (
    <buildContext.Provider
      value={{
        buildPending,
        setBuildPending,
        buildStart,
        buildStop,
        builds,
        setBuilds,
        setBuildsHandler,
      }}
    >
      {children}
    </buildContext.Provider>
  )
}
