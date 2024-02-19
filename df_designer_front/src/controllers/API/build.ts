import axios, { AxiosResponse } from "axios"
import { uniqueId } from "lodash"
import { apiPresetType, buildApiType, buildApiTypeMinify, runApiType } from "../../contexts/buildContext"
import { savedBuildType } from "../../types/entities"

type buildResponseTypeMinify = {
  status?: string
  build_info: buildApiTypeMinify
}

type buildResponseType = {
  status?: string
  build_info: buildApiType
}

type buildsResponseType = {
  status?: string
  build: buildApiType[]
}

type runResponseType = {
  status?: string
  run_info: runApiType
}

type runsResponseType = {
  status?: string
  run: runApiType[]
}

export const buildBotScript = async () => {
  try {
    const response: AxiosResponse = await axios.post('/build')
    const data: buildResponseTypeMinify = response.data
    if (data.status !== 'ok') {
      throw Error('data.status is not ok')
    } else {
      return true
    }
  } catch (error) {
    throw error
  }
}

export const getBuilds = async () => {
  try {
    const response: AxiosResponse = await axios.get('/bot/builds')
    const data: buildsResponseType = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const startBuild = async (preset?: apiPresetType) => {
  try {
    const response: AxiosResponse<buildResponseType> = await axios.post('/bot/build/start', preset ?? {
      name: uniqueId('build-'),
      duration: 4,
      end_status: 'completed'
    })
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const getBuildStatus = async () => {
  try {
    const response: AxiosResponse<string> = await axios.get(`/bot/build/status`)
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const stopBuild = async () => {
  try {
    const response: AxiosResponse<{status: string}> = await axios.get('/bot/build/stop')
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
} 

export const startRun = async (preset?: apiPresetType) => {
  try {
    const response: AxiosResponse<runResponseType> = await axios.post('/bot/run/start', preset)
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const getRunStatus = async () => {
  try {
    const response: AxiosResponse<string> = await axios.get('/bot/run/status')
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const getRuns = async () => {
  try {
    const response: AxiosResponse<runsResponseType> = await axios.get('/bot/runs')
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}

export const stopRun = async () => {
  try {
    const response: AxiosResponse<{status: string}> = await axios.get('/bot/run/stop')
    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    throw error
  }
}