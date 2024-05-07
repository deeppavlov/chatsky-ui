import { $v1 } from "."

export type buildApiStatusType =
  | "completed"
  | "failed"
  | "running"
  | "stopped"
  | "success"
  | "alive"

type buildStartResponseType = {
  status: "ok" | "error"
  build_id: number
}

type runStartResponseType = {
  data: {
    status: "ok" | "error"
    run_id: number
  }
}

export type buildMinifyApiType = {
  id: number
  status: buildApiStatusType
  preset_end_status: string
  timestamp: number
  runs: runMinifyApiType[]
}

export type runMinifyApiType = {
  id: number
  status: buildApiStatusType
  preset_end_status: string
  log_path: string
  timestamp: number
  build_id: number
}

export type buildPresetType = {
  wait_time: number
  end_status: buildApiStatusType
}

export type buildResponseType = {
  status?: string
  build_id: number
}

export type runApiType = {
  id: number
  status: buildApiStatusType
  timestamp: number
  preset_end_status: string
  build_id: number
  logs?: string[]
  logs_path?: string
}

export interface localRunType extends runMinifyApiType {
  type: "run"
}

export type buildApiType = {
  id: number
  status: buildApiStatusType
  log_path?: string
  logs?: string[]
  preset_end_status: string
  timestamp: number
  runs: localRunType[]
}

export interface localBuildType extends buildMinifyApiType {
  type: "build"
}

// type buildsResponseType = buildApiType[]
// // {
// //   status?: string
// //   build: buildApiType[]
// // }

// type runsResponseType = {
//   status?: string
//   run: runApiType[]
// }

// type runResponseType = {
//   status?: string
//   run_info: runApiType
// }

type buildStatusResponseType = {
  status: buildApiStatusType
}

export const build_start = async (preset?: buildPresetType) => {
  try {
    const { data }: { data: buildStartResponseType } = await $v1.post("/bot/build/start", preset)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const build_stop = async (build_id: number) => {
  try {
    const { data } = await $v1.get(`/bot/build/stop/${build_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const build_status = async (build_id: number) => {
  try {
    const { data }: { data: buildStatusResponseType } = await $v1.get(
      `/bot/build/status/${build_id}`
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_builds = async () => {
  try {
    const { data }: { data: buildMinifyApiType[] } = await $v1.get("/bot/builds")
    // console.log(data)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_build = async (build_id: number) => {
  try {
    const { data }: { data: buildApiType } = await $v1.get(`/bot/builds/${build_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_runs = async () => {
  try {
    const { data }: { data: runMinifyApiType[] } = await $v1.get("/bot/runs")
    // console.log(data)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_run = async (run_id: number) => {
  try {
    const { data }: { data: runApiType } = await $v1.get(`/bot/runs/${run_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_start = async (preset: buildPresetType, build_id: number) => {
  try {
    const { data }: runStartResponseType = await $v1.post(`/bot/run/start/${build_id}`, preset)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_stop = async (run_id: number) => {
  try {
    const { data }: { data: {status: 'ok' | 'error'} } = await $v1.get(`/bot/run/stop/${run_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_status = async (run_id: number) => {
  try {
    const { data }: { data: buildStatusResponseType } = await $v1.get(`/bot/run/status/${run_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}
