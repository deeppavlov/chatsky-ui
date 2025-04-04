import { $v1 } from '.'

export type buildApiStatusType =
  | 'completed'
  | 'failed'
  | 'running'
  | 'stopped'
  | 'success'
  | 'alive'

type buildStartResponseType = {
  status: 'ok' | 'error'
  build_id: number
}

type runStartResponseType = {
  data: {
    status: 'ok' | 'error'
    run_id: number
  }
}

export type messengerType = 'web' | 'telegram'

export type buildMinifyApiType = {
  id: number
  status: buildApiStatusType
  port: number
  timestamp: string
  log_path: string
  runs: runMinifyApiType[]
  preset: {
    name: string
    messenger: messengerType
    preset: string
    end_status: string
  }
}

export type runMinifyApiType = {
  id: number
  build_id: number
  status: buildApiStatusType
  timestamp: string
  log_path: string
  port: number
  messenger: messengerType
  preset: {
    name: string
    build_name: string
    preset: string
    end_status: string
    tg_bot_token?: string
  }
}

export type buildPresetType = {
  end_status: buildApiStatusType
  name: string
  messenger: messengerType
  preset: string
}

export type runPresetType = {
  end_status: buildApiStatusType
  name: string
  build_name: string
  preset: string
  tg_bot_token?: string
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
  type: 'run'
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
  type: 'build'
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

type botMessage = {
  user_id: string
  response: {
    text: string
    [key: string]: unknown
  }
}

export const build_start = async (preset?: buildPresetType) => {
  try {
    const { data }: { data: buildStartResponseType } = await $v1.post(
      '/bot/build/start',
      preset,
    )
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
      `/bot/build/status/${build_id}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_builds = async <T extends number | undefined = undefined>(
  build_id?: T,
): Promise<T extends number ? buildMinifyApiType : buildMinifyApiType[]> => {
  const url = build_id ? `/bot/builds?build_id=${build_id}` : '/bot/builds'
  try {
    const { data } = await $v1.get(url)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_build = async (build_id: number) => {
  try {
    const { data }: { data: buildApiType } = await $v1.get(
      `/bot/builds/${build_id}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const get_runs = async <T extends number | undefined = undefined>(
  run_id?: T,
): Promise<T extends number ? runMinifyApiType : runMinifyApiType[]> => {
  const url = run_id ? `/bot/runs?run_id=${run_id}` : '/bot/runs'

  try {
    const { data } = await $v1.get(url)
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

export const run_start = async (build_id: string, preset: runPresetType) => {
  try {
    const { data }: runStartResponseType = await $v1.post(
      `/bot/run/start/${build_id}`,
      preset,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_stop = async (run_id: number) => {
  try {
    const { data }: { data: { status: 'ok' | 'error' } } = await $v1.get(
      `/bot/run/stop/${run_id}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_stop_all = async () => {
  try {
    const { data }: { data: { status: 'ok' | 'error' } } =
      await $v1.get('/bot/run/stop_all')
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const run_status = async (run_id: number) => {
  try {
    const { data }: { data: buildStatusResponseType } = await $v1.get(
      `/bot/run/status/${run_id}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const send_message = async (
  run_id: number,
  user_message: string,
  user_id: number = 1,
) => {
  const url = `bot/chat?run_id=${run_id}&user_message=${user_message}${
    user_id ? `&user_id=${user_id}` : ''
  }`

  try {
    const { data }: { data: botMessage } = await $v1.post(url)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const checkBuildIsChanged = async () => {
  try {
    const {
      data: { data },
    } = await $v1.get('/bot/build/is_changed')

    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getChatHistory = async (chatId: number, userId: number = 1) => {
  try {
    const { data }: { data: Array<[string, string]> } = await $v1.get(
      `/bot/get_chat/${chatId}/${userId}`,
    )
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getChatIds = async () => {
  try {
    const { data }: { data: string[] } = await $v1.get('/bot/get_chat_ids')
    return data.map((id) => id.split('_')) // [runId, userId]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getBuildLogs = async (build_id: number): Promise<string[]> => {
  try {
    const { data } = await $v1.get(`/bot/builds/logs/${build_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getRunLogs = async (run_id: number): Promise<string[]> => {
  try {
    const { data } = await $v1.get(`/bot/runs/logs/${run_id}`)
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}
